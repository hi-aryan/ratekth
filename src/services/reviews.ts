import "server-only";
import { db } from "@/db";
import { post, course, user, postTags, tag } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import type { ReviewForDisplay, Tag } from "@/lib/types";
import { computeOverallRating } from "@/lib/utils";

/**
 * Service Input: Data required to create a new review.
 */
export interface CreateReviewInput {
    userId: string;
    courseId: number;
    yearTaken: number;
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: "light" | "medium" | "heavy";
    content?: string;
    tagIds?: number[];
}

/**
 * Service Input: Data required to update an existing review.
 */
export interface UpdateReviewInput {
    yearTaken: number;
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: "light" | "medium" | "heavy";
    content?: string | null;
    tagIds?: number[];
}

/**
 * Service Output: Review data formatted for edit form.
 * Includes course info and tag IDs for form population.
 */
export interface ReviewForEdit {
    id: number;
    courseId: number;
    courseName: string;
    courseCode: string;
    yearTaken: number;
    ratingProfessor: number;
    ratingMaterial: number;
    ratingPeers: number;
    ratingWorkload: 'light' | 'medium' | 'heavy';
    content: string | null;
    tagIds: number[];
}



/**
 * Service: Check if a user has already reviewed a specific course.
 * Returns the existing review ID if found, null otherwise.
 * Used for "already reviewed" detection and edit redirection.
 */
export const getUserReviewForCourse = async (
    userId: string,
    courseId: number
): Promise<{ id: number } | null> => {
    const existingReview = await db.query.post.findFirst({
        where: and(
            eq(post.userId, userId),
            eq(post.courseId, courseId)
        ),
        columns: { id: true },
    });
    return existingReview ?? null;
};

/**
 * Service: Create a new review for a course.
 * Enforces the one-review-per-course rule at service level (defense in depth).
 * Throws if user has already reviewed the course.
 * Returns the created review ID.
 */
export const createReview = async (data: CreateReviewInput): Promise<{ id: number }> => {
    // Authorization check: one review per course per user
    const existingReview = await getUserReviewForCourse(data.userId, data.courseId);
    if (existingReview) {
        throw new Error("You have already reviewed this course");
    }

    // Use transaction for atomicity (review + tags)
    return await db.transaction(async (tx) => {
        // 1. Insert the review
        const [newReview] = await tx.insert(post).values({
            userId: data.userId,
            courseId: data.courseId,
            datePosted: new Date(),
            yearTaken: data.yearTaken,
            ratingProfessor: data.ratingProfessor,
            ratingMaterial: data.ratingMaterial,
            ratingPeers: data.ratingPeers,
            ratingWorkload: data.ratingWorkload,
            content: data.content ?? null,
        }).returning();

        // 2. Insert tags (if provided, max 3 enforced by action layer)
        if (data.tagIds && data.tagIds.length > 0) {
            await tx.insert(postTags).values(
                data.tagIds.map((tagId) => ({
                    postId: newReview.id,
                    tagId,
                }))
            );
        }

        return { id: newReview.id };
    });
};

/**
 * Service: Update an existing review.
 * Validates ownership before updating.
 * Throws if review not found or user doesn't own it.
 */
export const updateReview = async (
    reviewId: number,
    userId: string,
    data: UpdateReviewInput
): Promise<void> => {
    // Verify ownership
    const existingReview = await db.query.post.findFirst({
        where: and(
            eq(post.id, reviewId),
            eq(post.userId, userId)
        ),
        columns: { id: true },
    });

    if (!existingReview) {
        throw new Error("Review not found or you don't have permission to edit it");
    }

    // Use transaction for atomicity (update + tags sync)
    await db.transaction(async (tx) => {
        // 1. Update review fields
        await tx.update(post).set({
            yearTaken: data.yearTaken,
            ratingProfessor: data.ratingProfessor,
            ratingMaterial: data.ratingMaterial,
            ratingPeers: data.ratingPeers,
            ratingWorkload: data.ratingWorkload,
            content: data.content,
        }).where(eq(post.id, reviewId));

        // 2. Sync tags (delete old, insert new)
        if (data.tagIds !== undefined) {
            await tx.delete(postTags).where(eq(postTags.postId, reviewId));
            if (data.tagIds.length > 0) {
                await tx.insert(postTags).values(
                    data.tagIds.map((tagId) => ({
                        postId: reviewId,
                        tagId,
                    }))
                );
            }
        }
    });
};

/**
 * Service: Get all reviews for a specific course.
 * Returns reviews with author info, tags, and computed overall rating.
 * Sorted by newest first.
 */
export const getReviewsForCourse = async (courseId: number): Promise<ReviewForDisplay[]> => {
    // Fetch reviews with author info
    const reviews = await db
        .select({
            id: post.id,
            datePosted: post.datePosted,
            yearTaken: post.yearTaken,
            ratingProfessor: post.ratingProfessor,
            ratingMaterial: post.ratingMaterial,
            ratingPeers: post.ratingPeers,
            ratingWorkload: post.ratingWorkload,
            content: post.content,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            authorId: post.userId,
            authorUsername: user.username,
            authorImage: user.image,
        })
        .from(post)
        .innerJoin(course, eq(post.courseId, course.id))
        .innerJoin(user, eq(post.userId, user.id))
        .where(eq(post.courseId, courseId))
        .orderBy(desc(post.datePosted));

    if (reviews.length === 0) {
        return [];
    }

    // Fetch tags for these reviews
    const reviewIds = reviews.map((r) => r.id);
    const tagsResult = reviewIds.length > 0
        ? await db
            .select({
                postId: postTags.postId,
                tagId: tag.id,
                tagName: tag.name,
                tagSentiment: tag.sentiment,
            })
            .from(postTags)
            .innerJoin(tag, eq(postTags.tagId, tag.id))
            .where(inArray(postTags.postId, reviewIds))
        : [];

    // Group tags by review
    const tagsByReview = new Map<number, Tag[]>();
    tagsResult.forEach((t) => {
        const existing = tagsByReview.get(t.postId) ?? [];
        existing.push({
            id: t.tagId,
            name: t.tagName,
            sentiment: t.tagSentiment,
        });
        tagsByReview.set(t.postId, existing);
    });

    // Transform to ReviewForDisplay
    return reviews.map((r) => ({
        id: r.id,
        datePosted: r.datePosted,
        yearTaken: r.yearTaken,
        ratingProfessor: r.ratingProfessor,
        ratingMaterial: r.ratingMaterial,
        ratingPeers: r.ratingPeers,
        ratingWorkload: r.ratingWorkload,
        content: r.content,
        overallRating: computeOverallRating(r.ratingProfessor, r.ratingMaterial, r.ratingPeers),
        authorId: r.authorId,
        course: {
            id: r.courseId,
            name: r.courseName,
            code: r.courseCode,
        },
        author: {
            username: r.authorUsername,
            image: r.authorImage,
        },
        tags: tagsByReview.get(r.id) ?? [],
    }));
};

/**
 * Service: Get all available tags for review creation/editing.
 */
export const getAllTags = async (): Promise<Tag[]> => {
    const tags = await db.query.tag.findMany({
        orderBy: (tag, { asc }) => [asc(tag.name)],
    });
    return tags;
};

/**
 * Service: Get all courses that a user has already reviewed.
 * Returns an array with both courseId and reviewId for redirecting to edit page.
 */
export const getUserReviewedCourseIds = async (userId: string): Promise<Array<{ courseId: number; reviewId: number }>> => {
    const reviews = await db
        .select({ courseId: post.courseId, reviewId: post.id })
        .from(post)
        .where(eq(post.userId, userId));
    return reviews;
};

/**
 * Service: Get review data for editing.
 * Validates ownership before returning.
 * Returns null if review not found or user doesn't own it.
 */
export const getReviewForEdit = async (
    reviewId: number,
    userId: string
): Promise<ReviewForEdit | null> => {
    // Fetch review with ownership check and course info
    const reviewResult = await db
        .select({
            id: post.id,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            yearTaken: post.yearTaken,
            ratingProfessor: post.ratingProfessor,
            ratingMaterial: post.ratingMaterial,
            ratingPeers: post.ratingPeers,
            ratingWorkload: post.ratingWorkload,
            content: post.content,
        })
        .from(post)
        .innerJoin(course, eq(post.courseId, course.id))
        .where(and(
            eq(post.id, reviewId),
            eq(post.userId, userId)
        ))
        .limit(1);

    if (reviewResult.length === 0) {
        return null;
    }

    const review = reviewResult[0];

    // Fetch tag IDs for this review
    const tagRows = await db.query.postTags.findMany({
        where: eq(postTags.postId, reviewId),
        columns: { tagId: true },
    });

    const tagIds = tagRows.map(row => row.tagId);

    return {
        id: review.id,
        courseId: review.courseId,
        courseName: review.courseName,
        courseCode: review.courseCode,
        yearTaken: review.yearTaken,
        ratingProfessor: review.ratingProfessor,
        ratingMaterial: review.ratingMaterial,
        ratingPeers: review.ratingPeers,
        ratingWorkload: review.ratingWorkload,
        content: review.content,
        tagIds,
    };
};

/**
 * Service: Get a single review by ID for public display.
 * Returns full review info including authorId for ownership check.
 * Returns null if review not found.
 */
export const getReviewById = async (reviewId: number): Promise<ReviewForDisplay | null> => {
    // Fetch review with course and author info
    const reviewResult = await db
        .select({
            id: post.id,
            datePosted: post.datePosted,
            yearTaken: post.yearTaken,
            ratingProfessor: post.ratingProfessor,
            ratingMaterial: post.ratingMaterial,
            ratingPeers: post.ratingPeers,
            ratingWorkload: post.ratingWorkload,
            content: post.content,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            authorId: post.userId,
            authorUsername: user.username,
            authorImage: user.image,
        })
        .from(post)
        .innerJoin(course, eq(post.courseId, course.id))
        .innerJoin(user, eq(post.userId, user.id))
        .where(eq(post.id, reviewId))
        .limit(1);

    if (reviewResult.length === 0) {
        return null;
    }

    const r = reviewResult[0];

    // Fetch tags for this review
    const tagsResult = await db
        .select({
            tagId: tag.id,
            tagName: tag.name,
            tagSentiment: tag.sentiment,
        })
        .from(postTags)
        .innerJoin(tag, eq(postTags.tagId, tag.id))
        .where(eq(postTags.postId, reviewId));

    const tags: Tag[] = tagsResult.map(t => ({
        id: t.tagId,
        name: t.tagName,
        sentiment: t.tagSentiment,
    }));

    return {
        id: r.id,
        datePosted: r.datePosted,
        yearTaken: r.yearTaken,
        ratingProfessor: r.ratingProfessor,
        ratingMaterial: r.ratingMaterial,
        ratingPeers: r.ratingPeers,
        ratingWorkload: r.ratingWorkload,
        content: r.content,
        overallRating: computeOverallRating(r.ratingProfessor, r.ratingMaterial, r.ratingPeers),
        authorId: r.authorId,
        course: {
            id: r.courseId,
            name: r.courseName,
            code: r.courseCode,
        },
        author: {
            username: r.authorUsername,
            image: r.authorImage,
        },
        tags,
    };
};

/**
 * Service: Delete a review.
 * Validates ownership before deletion.
 * Throws if review not found or user doesn't own it.
 * Tags are automatically deleted via CASCADE foreign key.
 */
export const deleteReview = async (reviewId: number, userId: string): Promise<void> => {
    // Verify ownership
    const existingReview = await db.query.post.findFirst({
        where: and(
            eq(post.id, reviewId),
            eq(post.userId, userId)
        ),
        columns: { id: true },
    });

    if (!existingReview) {
        throw new Error("Review not found or you don't have permission to delete it");
    }

    // Delete the review (tags deleted via CASCADE)
    await db.delete(post).where(eq(post.id, reviewId));
};

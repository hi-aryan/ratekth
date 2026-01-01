import "server-only";
import { db } from "@/db";
import { post, course, user, postTags, tag } from "@/db/schema";
import { eq, desc, inArray, sql } from "drizzle-orm";
import type { ReviewForDisplay, PaginatedResult, Tag } from "@/lib/types";
import { FEED_PAGE_SIZE, type FeedSortOption } from "@/lib/constants";
import { computeOverallRating } from "@/lib/utils";
import { getVisibleCourseIds } from "@/services/courses";



/**
 * Get sort expression based on sort option.
 */
const getSortOrder = (sortBy: FeedSortOption) => {
    switch (sortBy) {
        case 'top-rated':
            return desc(sql`(${post.ratingProfessor} + ${post.ratingMaterial} + ${post.ratingPeers}) / 3.0`);
        case 'professor':
            return desc(post.ratingProfessor);
        case 'material':
            return desc(post.ratingMaterial);
        case 'peers':
            return desc(post.ratingPeers);
        case 'newest':
        default:
            return desc(post.datePosted);
    }
};

/**
 * Service: Get paginated feed of reviews filtered by user's course visibility.
 *
 * - Authenticated users see only reviews for their visible courses
 * - Guests see all reviews
 * - Sorted by datePosted (newest) by default
 */
export const getStudentFeed = async (
    programId?: number | null,
    mastersDegreeId?: number | null,
    specializationId?: number | null,
    options?: { page?: number; pageSize?: number; sortBy?: FeedSortOption }
): Promise<PaginatedResult<ReviewForDisplay>> => {
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = options?.pageSize ?? FEED_PAGE_SIZE;
    const sortBy = options?.sortBy ?? 'newest';
    const offset = (page - 1) * pageSize;

    // Get visible course IDs (null = no filter)
    const visibleCourseIds = await getVisibleCourseIds(programId, mastersDegreeId, specializationId);

    // Build WHERE clause
    const whereClause = visibleCourseIds !== null && visibleCourseIds.length > 0
        ? inArray(post.courseId, visibleCourseIds)
        : undefined;

    // If user has academic info but no visible courses, return empty
    if (visibleCourseIds !== null && visibleCourseIds.length === 0) {
        return {
            items: [],
            page,
            pageSize,
            hasMore: false,
        };
    }

    // Fetch pageSize + 1 records to determine hasMore without COUNT query
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
            authorUsername: user.username,
            authorImage: user.image,
        })
        .from(post)
        .innerJoin(course, eq(post.courseId, course.id))
        .innerJoin(user, eq(post.userId, user.id))
        .where(whereClause)
        .orderBy(getSortOrder(sortBy))
        .limit(pageSize + 1)
        .offset(offset);

    // Determine hasMore and trim to pageSize
    const hasMore = reviews.length > pageSize;
    const trimmedReviews = hasMore ? reviews.slice(0, pageSize) : reviews;

    // Fetch tags for trimmed reviews
    const reviewIds = trimmedReviews.map(r => r.id);
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
    tagsResult.forEach(t => {
        const existing = tagsByReview.get(t.postId) ?? [];
        existing.push({
            id: t.tagId,
            name: t.tagName,
            sentiment: t.tagSentiment,
        });
        tagsByReview.set(t.postId, existing);
    });

    // Transform to ReviewForDisplay
    const items: ReviewForDisplay[] = trimmedReviews.map(r => ({
        id: r.id,
        datePosted: r.datePosted,
        yearTaken: r.yearTaken,
        ratingProfessor: r.ratingProfessor,
        ratingMaterial: r.ratingMaterial,
        ratingPeers: r.ratingPeers,
        ratingWorkload: r.ratingWorkload,
        content: r.content,
        overallRating: computeOverallRating(r.ratingProfessor, r.ratingMaterial, r.ratingPeers),
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

    return {
        items,
        page,
        pageSize,
        hasMore,
    };
};

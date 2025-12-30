"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/services/auth";
import { reviewSchema } from "@/lib/validation";
import { createReview, updateReview, getUserReviewForCourse } from "@/services/reviews";
import { ActionState } from "@/lib/types";

/**
 * Action: Submit a new review.
 * Validates input, checks auth, detects duplicate, creates review.
 */
export async function submitReviewAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to post a review." };
    }

    const rawData = Object.fromEntries(formData.entries());

    // Parse tagIds from multiple checkboxes (FormData sends multiple values)
    const tagIds = formData.getAll("tagIds").map(v => Number(v)).filter(n => !isNaN(n) && n > 0);

    const result = reviewSchema.safeParse({
        ...rawData,
        tagIds,
    });

    if (!result.success) {
        return {
            error: "Please fix the errors below.",
            fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
        };
    }

    const { courseId, yearTaken, ratingProfessor, ratingMaterial, ratingPeers, ratingWorkload, content } = result.data;

    try {
        // Check if user already reviewed this course
        const existingReview = await getUserReviewForCourse(session.user.id, courseId);
        if (existingReview) {
            return {
                error: "You have already reviewed this course.",
                existingReviewId: existingReview.id,
            };
        }

        await createReview({
            userId: session.user.id,
            courseId,
            yearTaken,
            ratingProfessor,
            ratingMaterial,
            ratingPeers,
            ratingWorkload,
            content: content ?? undefined,
            tagIds: result.data.tagIds,
        });
    } catch (error) {
        console.error("[SubmitReviewAction Error]:", error);
        if (error instanceof Error && error.message.includes("already reviewed")) {
            return { error: "You have already reviewed this course." };
        }
        return { error: "Failed to submit review. Please try again." };
    }

    revalidatePath("/");
    redirect("/?success=review-posted");
}

/**
 * Action: Update an existing review.
 * Validates input, checks auth and ownership, updates review.
 * reviewId is read from hidden form field for standard useActionState compatibility.
 */
export async function updateReviewAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to edit a review." };
    }

    const reviewId = Number(formData.get("reviewId"));
    if (!reviewId || isNaN(reviewId) || reviewId <= 0) {
        return { error: "Invalid review ID." };
    }

    const rawData = Object.fromEntries(formData.entries());

    // Parse tagIds from multiple checkboxes
    const tagIds = formData.getAll("tagIds").map(v => Number(v)).filter(n => !isNaN(n) && n > 0);

    const result = reviewSchema.safeParse({
        ...rawData,
        tagIds,
    });

    if (!result.success) {
        return {
            error: "Please fix the errors below.",
            fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
        };
    }

    const { yearTaken, ratingProfessor, ratingMaterial, ratingPeers, ratingWorkload, content } = result.data;

    try {
        await updateReview(reviewId, session.user.id, {
            yearTaken,
            ratingProfessor,
            ratingMaterial,
            ratingPeers,
            ratingWorkload,
            content,
            tagIds: result.data.tagIds,
        });
    } catch (error) {
        console.error("[UpdateReviewAction Error]:", error);
        if (error instanceof Error && error.message.includes("permission")) {
            return { error: "You don't have permission to edit this review." };
        }
        return { error: "Failed to update review. Please try again." };
    }

    revalidatePath("/");
    redirect("/?success=review-updated");
}

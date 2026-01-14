"use server";

import { headers } from "next/headers";
import { feedbackSchema } from "@/lib/validation";
import { createFeedback, checkFeedbackRateLimit } from "@/services/feedback";
import { auth } from "@/services/auth";
import { ActionState } from "@/lib/types";

/**
 * Action: Submit feedback.
 * Role: Controller - Validates input, calls service.
 * Allows both authenticated and anonymous submissions.
 * Rate limited: 2 submissions per 10 minutes.
 */
export async function submitFeedbackAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;

  // Get IP for rate limiting (used for anonymous users)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Check rate limit via service
  const { allowed, retryAfterSeconds } = await checkFeedbackRateLimit(userId, ip);
  if (!allowed) {
    const minutes = Math.ceil((retryAfterSeconds ?? 0) / 60);
    return { error: `Too many submissions. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  // Parse and validate
  const rawContent = formData.get("content");
  const result = feedbackSchema.safeParse({ content: rawContent });

  if (!result.success) {
    return {
      error: "Please fix the errors below.",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
    };
  }

  try {
    await createFeedback({
      content: result.data.content,
      userId,
      ip,
    });

    return { success: true, message: "Thank you for your feedback!" };
  } catch (error) {
    console.error("[SubmitFeedbackAction Error]:", error);
    return { error: "Failed to submit feedback. Please try again." };
  }
}

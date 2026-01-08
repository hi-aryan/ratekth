"use server";

import { feedbackSchema } from "@/lib/validation";
import { createFeedback } from "@/services/feedback";
import { auth } from "@/services/auth";
import { ActionState } from "@/lib/types";

/**
 * Action: Submit feedback.
 * Role: Controller - Validates input, calls service.
 * Allows both authenticated and anonymous submissions.
 */
export async function submitFeedbackAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const userId = session?.user?.id;

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
    });

    return { success: true, message: "Thank you for your feedback!" };
  } catch (error) {
    console.error("[SubmitFeedbackAction Error]:", error);
    return { error: "Failed to submit feedback. Please try again." };
  }
}

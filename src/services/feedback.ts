import "server-only";
import { db } from "@/db";
import { feedback } from "@/db/schema";

interface CreateFeedbackInput {
  content: string;
  userId?: string;
}

/**
 * Service: Create a new feedback entry.
 * Returns void - feedback has no ID-based operations.
 */
export const createFeedback = async (data: CreateFeedbackInput): Promise<void> => {
  await db.insert(feedback).values({
    content: data.content,
    userId: data.userId ?? null,
  });
};
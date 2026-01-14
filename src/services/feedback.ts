import "server-only";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { count, and, gte, eq, asc } from "drizzle-orm";

interface CreateFeedbackInput {
  content: string;
  userId?: string;
  ip: string;
}

const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Service: Check if a user/IP has exceeded feedback rate limit.
 * Limit: 2 submissions per 10 minutes.
 * Uses userId if authenticated, otherwise falls back to IP.
 */
export const checkFeedbackRateLimit = async (
  userId: string | undefined,
  ip: string
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> => {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  // Build condition: match by userId if authenticated, otherwise by IP
  const condition = userId
    ? and(gte(feedback.createdAt, windowStart), eq(feedback.userId, userId))
    : and(gte(feedback.createdAt, windowStart), eq(feedback.ip, ip));

  // Count recent submissions
  const [result] = await db
    .select({ count: count() })
    .from(feedback)
    .where(condition);

  const currentCount = result?.count ?? 0;

  if (currentCount >= RATE_LIMIT_MAX) {
    // Find oldest submission in window to calculate retry time
    const [oldest] = await db
      .select({ createdAt: feedback.createdAt })
      .from(feedback)
      .where(condition)
      .orderBy(asc(feedback.createdAt))
      .limit(1);

    const retryAfterMs = oldest
      ? oldest.createdAt.getTime() + RATE_LIMIT_WINDOW_MS - Date.now()
      : RATE_LIMIT_WINDOW_MS;

    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  return { allowed: true };
};

/**
 * Service: Create a new feedback entry.
 * Returns void - feedback has no ID-based operations.
 */
export const createFeedback = async (data: CreateFeedbackInput): Promise<void> => {
  await db.insert(feedback).values({
    content: data.content,
    userId: data.userId ?? null,
    ip: data.ip,
  });
};
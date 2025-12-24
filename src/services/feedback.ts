import { db } from "@/db";
import { feedback } from "@/db/schema";

export const createFeedback = async (content: string, userId?: string) => {
  return await db.insert(feedback).values({ content, userId });
};
import { db } from "@/db";
import { course } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Service to fetch a course by its KTH course code.
 * Ensures encapsulation of database logic away from UI components.
 */
export const getCourseByCode = async (code: string) => {
    try {
        const result = await db.query.course.findFirst({
            where: eq(course.code, code),
        });
        return result;
    } catch (error) {
        console.error(`Error fetching course with code ${code}:`, error);
        throw new Error("Failed to fetch course");
    }
};

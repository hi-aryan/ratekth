"use server";

import { searchCourses } from "@/services/courses";
import type { CourseWithStats } from "@/lib/types";

/**
 * Action: Search for courses by name or code.
 * Called by SearchBar client component.
 * Returns matching courses or error message.
 */
export async function searchCoursesAction(
    query: string
): Promise<{ courses: CourseWithStats[] } | { error: string }> {
    // Input validation
    if (typeof query !== "string") {
        return { error: "Invalid search query." };
    }

    const trimmedQuery = query.trim();

    // Min length validation (also enforced at service level)
    if (trimmedQuery.length < 2) {
        return { courses: [] };
    }

    // Max length sanity check
    if (trimmedQuery.length > 100) {
        return { error: "Search query too long." };
    }

    try {
        const courses = await searchCourses(trimmedQuery);
        return { courses };
    } catch (error) {
        console.error("[SearchCoursesAction Error]:", error);
        return { error: "Failed to search courses. Please try again." };
    }
}

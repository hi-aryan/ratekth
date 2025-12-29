import "server-only";
import { db } from "@/db";
import { course, courseProgram, courseSpecialization, post } from "@/db/schema";
import { eq, sql, inArray, count, avg } from "drizzle-orm";
import type { CourseWithStats } from "@/lib/types";

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

/**
 * Service: Get course by ID with review statistics.
 */
export const getCourseById = async (id: number): Promise<CourseWithStats | null> => {
    const result = await db
        .select({
            id: course.id,
            name: course.name,
            code: course.code,
            reviewCount: count(post.id),
            averageRating: avg(
                sql`(${post.ratingProfessor} + ${post.ratingMaterial} + ${post.ratingPeers}) / 3.0`
            ),
        })
        .from(course)
        .leftJoin(post, eq(course.id, post.courseId))
        .where(eq(course.id, id))
        .groupBy(course.id);

    if (result.length === 0) return null;

    const row = result[0];
    return {
        ...row,
        reviewCount: Number(row.reviewCount),
        averageRating: row.averageRating ? Number(row.averageRating) : undefined,
    };
};

/**
 * Service: Get courses visible to a user based on their academic affiliation.
 * Returns the UNION of courses from:
 * 1. Base Program (programId)
 * 2. Master's Degree (mastersDegreeId)
 * 3. Specialization (specializationId)
 *
 * If no academic IDs provided, returns all courses (for guests).
 */
export const getAvailableCourses = async (
    programId?: number | null,
    mastersDegreeId?: number | null,
    specializationId?: number | null
): Promise<CourseWithStats[]> => {
    // Collect visible course IDs based on academic affiliation
    const courseIds = new Set<number>();

    // 1. Courses from Base Program or Master's Degree (both use courseProgram table)
    const programIds = [programId, mastersDegreeId].filter((id): id is number => id != null);
    if (programIds.length > 0) {
        const programCourses = await db
            .select({ courseId: courseProgram.courseId })
            .from(courseProgram)
            .where(inArray(courseProgram.programId, programIds));
        programCourses.forEach(row => courseIds.add(row.courseId));
    }

    // 2. Courses from Specialization
    if (specializationId) {
        const specCourses = await db
            .select({ courseId: courseSpecialization.courseId })
            .from(courseSpecialization)
            .where(eq(courseSpecialization.specializationId, specializationId));
        specCourses.forEach(row => courseIds.add(row.courseId));
    }

    // If no courses found (guest user or no academic affiliation), return all courses
    if (courseIds.size === 0 && !programId && !mastersDegreeId && !specializationId) {
        const allCourses = await db
            .select({
                id: course.id,
                name: course.name,
                code: course.code,
                reviewCount: count(post.id),
                averageRating: avg(
                    sql`(${post.ratingProfessor} + ${post.ratingMaterial} + ${post.ratingPeers}) / 3.0`
                ),
            })
            .from(course)
            .leftJoin(post, eq(course.id, post.courseId))
            .groupBy(course.id)
            .orderBy(course.code);

        return allCourses.map(row => ({
            ...row,
            reviewCount: Number(row.reviewCount),
            averageRating: row.averageRating ? Number(row.averageRating) : undefined,
        }));
    }

    // No visible courses for this user
    if (courseIds.size === 0) {
        return [];
    }

    // Fetch course details with review stats for visible courses
    const visibleCourses = await db
        .select({
            id: course.id,
            name: course.name,
            code: course.code,
            reviewCount: count(post.id),
            averageRating: avg(
                sql`(${post.ratingProfessor} + ${post.ratingMaterial} + ${post.ratingPeers}) / 3.0`
            ),
        })
        .from(course)
        .leftJoin(post, eq(course.id, post.courseId))
        .where(inArray(course.id, Array.from(courseIds)))
        .groupBy(course.id)
        .orderBy(course.code);

    return visibleCourses.map(row => ({
        ...row,
        reviewCount: Number(row.reviewCount),
        averageRating: row.averageRating ? Number(row.averageRating) : undefined,
    }));
};

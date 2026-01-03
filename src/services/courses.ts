import "server-only";
import { db } from "@/db";
import { course, courseProgram, courseSpecialization, post } from "@/db/schema";
import { eq, sql, inArray, count, avg } from "drizzle-orm";
import type { CourseWithStats } from "@/lib/types";

/**
 * Service to fetch a course by its KTH course code.
 * Returns course with review statistics.
 */
export const getCourseByCode = async (code: string): Promise<CourseWithStats | null> => {
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
        .where(eq(course.code, code))
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
 * Service: Search courses by name or code.
 * Returns up to 10 matching courses with review stats.
 * Case-insensitive search using ILIKE.
 * Returns empty array if query is less than 2 characters.
 */
export const searchCourses = async (query: string): Promise<CourseWithStats[]> => {
    const trimmedQuery = query.trim();

    // Reject queries that are too short
    if (trimmedQuery.length < 2) {
        return [];
    }

    // Use ILIKE for case-insensitive partial matching
    const searchPattern = `%${trimmedQuery}%`;

    const results = await db
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
        .where(
            sql`${course.name} ILIKE ${searchPattern} OR ${course.code} ILIKE ${searchPattern}`
        )
        .groupBy(course.id)
        .orderBy(course.code)
        .limit(10);

    return results.map(row => ({
        ...row,
        reviewCount: Number(row.reviewCount),
        averageRating: row.averageRating ? Number(row.averageRating) : undefined,
    }));
};

/**
 * Service: Get visible course IDs for a user based on their academic affiliation.
 * Returns null if no filtering should be applied (guest user).
 * 
 * Shared by: getAvailableCourses, getStudentFeed
 */
export const getVisibleCourseIds = async (
    programId?: number | null,
    mastersDegreeId?: number | null,
    specializationId?: number | null
): Promise<number[] | null> => {
    // If no academic info, don't filter (show all)
    if (!programId && !mastersDegreeId && !specializationId) {
        return null;
    }

    const courseIds = new Set<number>();

    // Courses from Program or Master's Degree
    const programIds = [programId, mastersDegreeId].filter((id): id is number => id != null);
    if (programIds.length > 0) {
        const programCourses = await db
            .select({ courseId: courseProgram.courseId })
            .from(courseProgram)
            .where(inArray(courseProgram.programId, programIds));
        programCourses.forEach(row => courseIds.add(row.courseId));
    }

    // Courses from Specialization
    if (specializationId) {
        const specCourses = await db
            .select({ courseId: courseSpecialization.courseId })
            .from(courseSpecialization)
            .where(eq(courseSpecialization.specializationId, specializationId));
        specCourses.forEach(row => courseIds.add(row.courseId));
    }

    return Array.from(courseIds);
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
    // Use shared visibility logic
    const visibleCourseIds = await getVisibleCourseIds(programId, mastersDegreeId, specializationId);

    // If no courses found (guest user or no academic affiliation), return all courses
    if (visibleCourseIds === null) {
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
    if (visibleCourseIds.length === 0) {
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
        .where(inArray(course.id, visibleCourseIds))
        .groupBy(course.id)
        .orderBy(course.code);

    return visibleCourses.map(row => ({
        ...row,
        reviewCount: Number(row.reviewCount),
        averageRating: row.averageRating ? Number(row.averageRating) : undefined,
    }));
};

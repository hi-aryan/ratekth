import "server-only";
import { db } from "@/db";
import { program } from "@/db/schema";
import { asc, eq, ne, or, and, sql } from "drizzle-orm";
import { OPEN_ENTRANCE_PROGRAM_CODE } from "@/lib/constants";
import type { Program } from "@/lib/types";

/**
 * Service: Fetch all academic programs.
 */
export const getAllPrograms = async () => {
    return await db.query.program.findMany({
        orderBy: [asc(program.name)],
    });
};

/**
 * Service: Fetch base programs (Bachelor 180hp or Master 300hp).
 * These are full degree programs where students start their education.
 */
export const getBasePrograms = async () => {
    return await db.query.program.findMany({
        where: or(
            eq(program.credits, 180),
            eq(program.credits, 300)
        ),
        orderBy: [asc(program.name)],
    });
};

/**
 * Service: Fetch master's degrees (120hp).
 * These are standalone 2-year programs or embedded degrees within a 300hp program.
 */
export const getMastersDegrees = async () => {
    return await db.query.program.findMany({
        where: eq(program.credits, 120),
        orderBy: [asc(program.name)],
    });
};

/**
 * Service: Get program code by ID.
 * Used for username generation during registration.
 */
export const getProgramCodeById = async (programId: number): Promise<string | null> => {
    const result = await db.query.program.findFirst({
        where: eq(program.id, programId),
        columns: { code: true },
    });
    return result?.code ?? null;
};

/**
 * Service: Search master's degrees (120hp programs) by code or name.
 * Returns up to 10 matching programs.
 * Case-insensitive search using ILIKE.
 * Returns empty array if query is less than 2 characters.
 */
export const searchMastersDegrees = async (query: string): Promise<Program[]> => {
    const trimmedQuery = query.trim();

    // Reject queries that are too short
    if (trimmedQuery.length < 2) {
        return [];
    }

    // Use ILIKE for case-insensitive partial matching
    const searchPattern = `%${trimmedQuery}%`;

    const results = await db
        .select({
            id: program.id,
            name: program.name,
            code: program.code,
            credits: program.credits,
            programType: program.programType,
            hasIntegratedMasters: program.hasIntegratedMasters,
        })
        .from(program)
        .where(
            and(
                eq(program.credits, 120),
                sql`(${program.name} ILIKE ${searchPattern} OR ${program.code} ILIKE ${searchPattern})`
            )
        )
        .orderBy(asc(program.name))
        .limit(10);

    return results;
};

/**
 * Service: Fetch valid destination programs for Open Entrance (COPEN) students.
 * 
 * Business Rules:
 * - Only 300hp Civilingenjör programs (not 180hp Bachelor programs)
 * - Excludes COPEN itself (cannot "upgrade" to the same program)
 * - Ordered alphabetically by name for consistent UI
 * 
 * Used by: account/page.tsx for the upgrade form dropdown
 */
export const getOpenEntranceDestinationPrograms = async (): Promise<Program[]> => {
    return await db.query.program.findMany({
        where: and(
            eq(program.credits, 300),
            ne(program.code, OPEN_ENTRANCE_PROGRAM_CODE)
        ),
        orderBy: [asc(program.name)],
    });
};


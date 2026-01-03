import "server-only";
import { db } from "@/db";
import { user as userTable, program as programTable, specialization } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserWithEligibility } from "@/lib/types";

/**
 * Service: Get user with program credits for eligibility check.
 * Returns null if user not found.
 * Joins with program table to get credits for base program.
 */
export const getUserWithProgramCredits = async (userId: string): Promise<UserWithEligibility | null> => {
    const result = await db
        .select({
            id: userTable.id,
            email: userTable.email,
            programId: userTable.programId,
            programCredits: programTable.credits,
            programName: programTable.name,
            programCode: programTable.code,
            mastersDegreeId: userTable.mastersDegreeId,
            specializationId: userTable.specializationId,
        })
        .from(userTable)
        .leftJoin(programTable, eq(userTable.programId, programTable.id))
        .where(eq(userTable.id, userId));

    if (result.length === 0) return null;

    const row = result[0];

    // If user has a master's degree selected, fetch its details
    let mastersDegree: { name: string; code: string } | null = null;
    if (row.mastersDegreeId) {
        const mastersResult = await db.query.program.findFirst({
            where: eq(programTable.id, row.mastersDegreeId),
            columns: { name: true, code: true },
        });
        if (mastersResult) {
            mastersDegree = mastersResult;
        }
    }

    // If user has a specialization selected, fetch its details
    let specializationData: { name: string } | null = null;
    if (row.specializationId) {
        const specResult = await db.query.specialization.findFirst({
            where: eq(specialization.id, row.specializationId),
            columns: { name: true },
        });
        if (specResult) {
            specializationData = specResult;
        }
    }

    return {
        id: row.id,
        email: row.email,
        programId: row.programId,
        programCredits: row.programCredits,
        programName: row.programName,
        programCode: row.programCode,
        mastersDegreeId: row.mastersDegreeId,
        mastersDegree,
        specializationId: row.specializationId,
        specialization: specializationData,
    };
};

/**
 * Service: Update user's academic info (master's degree + specialization).
 * 
 * Validates:
 * - User exists
 * - User is eligible (base program 180hp/300hp)
 * - User hasn't already selected (mastersDegreeId is null)
 * - mastersDegreeId exists and is 120hp
 * - specializationId belongs to mastersDegreeId (if provided)
 * - specializationId is required if specializations exist for the degree
 * 
 * Uses transaction for atomicity.
 */
export const updateUserAcademicInfo = async (
    userId: string,
    mastersDegreeId: number,
    specializationId?: number
): Promise<void> => {
    await db.transaction(async (tx) => {
        // 1. Fetch user with program credits
        const userResult = await tx
            .select({
                id: userTable.id,
                programId: userTable.programId,
                mastersDegreeId: userTable.mastersDegreeId,
                programCredits: programTable.credits,
            })
            .from(userTable)
            .leftJoin(programTable, eq(userTable.programId, programTable.id))
            .where(eq(userTable.id, userId));

        if (userResult.length === 0) {
            throw new Error("User not found");
        }

        const user = userResult[0];

        // 2. Check eligibility: must be base program (180hp or 300hp)
        if (!user.programCredits || (user.programCredits !== 180 && user.programCredits !== 300)) {
            throw new Error("Not eligible for master's degree selection");
        }

        // 3. Check if already selected (one-time enforcement)
        if (user.mastersDegreeId !== null) {
            throw new Error("Academic selection already made");
        }

        // 4. Validate master's degree exists and is 120hp
        const mastersProgram = await tx.query.program.findFirst({
            where: eq(programTable.id, mastersDegreeId),
            columns: { id: true, credits: true },
        });

        if (!mastersProgram) {
            throw new Error("Invalid master's degree");
        }

        if (mastersProgram.credits !== 120) {
            throw new Error("Selected program is not a master's degree");
        }

        // 5. Check if specializations exist for this degree
        const existingSpecs = await tx.query.specialization.findMany({
            where: eq(specialization.programId, mastersDegreeId),
            columns: { id: true },
        });

        // 6. If specializations exist, one must be selected
        if (existingSpecs.length > 0 && !specializationId) {
            throw new Error("Please select a specialization");
        }

        // 7. If specializationId provided, validate it belongs to the master's degree
        if (specializationId) {
            const spec = await tx.query.specialization.findFirst({
                where: eq(specialization.id, specializationId),
                columns: { programId: true },
            });

            if (!spec) {
                throw new Error("Specialization not found");
            }

            if (spec.programId !== mastersDegreeId) {
                throw new Error("Specialization does not belong to the selected degree");
            }
        }

        // 8. Update user's academic info
        await tx.update(userTable)
            .set({
                mastersDegreeId,
                specializationId: specializationId ?? null,
            })
            .where(eq(userTable.id, userId));
    });
};

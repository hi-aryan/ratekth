import { db } from "@/db";
import { specialization } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Service: Fetch specializations for a specific program.
 */
export const getSpecializationsByProgramId = async (programId: number) => {
    return await db.query.specialization.findMany({
        where: eq(specialization.programId, programId),
        orderBy: [asc(specialization.name)],
    });
};

import { db } from "@/db";
import { program } from "@/db/schema";
import { asc } from "drizzle-orm";

/**
 * Service: Fetch all academic programs.
 */
export const getAllPrograms = async () => {
    return await db.query.program.findMany({
        orderBy: [asc(program.name)],
    });
};

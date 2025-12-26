import { db } from "@/db";
import { program } from "@/db/schema";
import { asc, eq, or } from "drizzle-orm";

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

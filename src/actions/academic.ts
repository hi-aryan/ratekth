"use server"

import { getSpecializationsByProgramId } from "@/services/specializations";
import { searchMastersDegrees } from "@/services/programs";
import type { Program } from "@/lib/types";

/**
 * Action: Fetch specializations for a selected master's degree.
 * Always returns a valid array (empty on error).
 */
export const getSpecializationsAction = async (mastersDegreeId: number) => {
    try {
        return await getSpecializationsByProgramId(mastersDegreeId);
    } catch (error) {
        console.error("[getSpecializationsAction] Error:", error);
        return [];
    }
};

/**
 * Action: Search master's degrees by query string.
 * Returns structured response for client-side handling.
 */
export const searchMastersDegreesAction = async (
    query: string
): Promise<{ programs: Program[] } | { error: string }> => {
    try {
        const programs = await searchMastersDegrees(query);
        return { programs };
    } catch (error) {
        console.error("[searchMastersDegreesAction] Error:", error);
        return { error: "Failed to search programs" };
    }
};

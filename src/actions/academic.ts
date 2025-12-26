"use server"

import { getSpecializationsByProgramId } from "@/services/specializations";

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


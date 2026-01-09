"use server"

import { redirect } from "next/navigation";
import { auth, signOut } from "@/services/auth";
import { updateUserAcademicInfo, updateBaseProgramSpecialization } from "@/services/users";
import { ActionState } from "@/lib/types";

/**
 * Action: Update user's academic selection (Master's Degree + Specialization).
 * 
 * Flow:
 * 1. Verify session (authorization)
 * 2. Parse FormData for mastersDegreeId and specializationId
 * 3. Call service to validate and update
 * 4. Force logout to refresh JWT with new academic IDs
 * 5. Redirect to login with success message
 */
export async function updateAcademicAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "You must be logged in to perform this action." };
    }

    const mastersDegreeIdRaw = formData.get("mastersDegreeId");
    const specializationIdRaw = formData.get("specializationId");

    // Parse and validate mastersDegreeId (required)
    if (!mastersDegreeIdRaw || mastersDegreeIdRaw === "") {
        return { error: "Please select a master's degree." };
    }

    const mastersDegreeId = parseInt(mastersDegreeIdRaw as string, 10);
    if (isNaN(mastersDegreeId) || mastersDegreeId <= 0) {
        return { error: "Invalid master's degree selection." };
    }

    // Parse specializationId (optional, validated by service if required)
    let specializationId: number | undefined;
    if (specializationIdRaw && specializationIdRaw !== "") {
        specializationId = parseInt(specializationIdRaw as string, 10);
        if (isNaN(specializationId) || specializationId <= 0) {
            return { error: "Invalid specialization selection." };
        }
    }

    try {
        await updateUserAcademicInfo(session.user.id, mastersDegreeId, specializationId);
    } catch (error) {
        if (error instanceof Error) {
            // Return user-friendly error messages from service
            return { error: error.message };
        }
        console.error("[updateAcademicAction] Error:", error);
        return { error: "Something went wrong. Please try again." };
    }

    // Force logout to refresh JWT with new academic IDs
    try {
        await signOut({ redirect: false });
    } catch (error) {
        console.error("[updateAcademicAction] Logout error:", error);
        // Continue to redirect even if logout has issues
    }

    // Redirect to login with success message
    redirect("/login?success=academic-updated");
}

/**
 * Action: Update user's base-program specialization.
 * 
 * Flow:
 * 1. Verify session
 * 2. Parse FormData for programSpecializationId
 * 3. Call service to validate and update
 * 4. Force logout to refresh JWT
 * 5. Redirect to login with success message
 */
export async function updateBaseProgramSpecializationAction(
    _prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "You must be logged in to perform this action." };
    }

    const programSpecializationIdRaw = formData.get("programSpecializationId");

    // Parse and validate programSpecializationId (required)
    if (!programSpecializationIdRaw || programSpecializationIdRaw === "") {
        return { error: "Please select a specialization." };
    }

    const programSpecializationId = parseInt(programSpecializationIdRaw as string, 10);
    if (isNaN(programSpecializationId) || programSpecializationId <= 0) {
        return { error: "Invalid specialization selection." };
    }

    try {
        await updateBaseProgramSpecialization(session.user.id, programSpecializationId);
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }
        console.error("[updateBaseProgramSpecializationAction] Error:", error);
        return { error: "Something went wrong. Please try again." };
    }

    // Force logout to refresh JWT
    try {
        await signOut({ redirect: false });
    } catch (error) {
        console.error("[updateBaseProgramSpecializationAction] Logout error:", error);
    }

    // Redirect to login with success message
    redirect("/login?success=program-specialization-updated");
}

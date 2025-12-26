"use server"

import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validation";
import { signIn, signOut, findUserByEmail, createUser } from "@/services/auth";
import { ActionState } from "@/lib/types";

/**
 * Action: Handles user registration.
 * Role: Controller - Validates, check identity, creates user, sends magic link.
 */
export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const rawData = Object.fromEntries(formData.entries());
    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
        return {
            error: "Form validation failed.",
            fieldErrors: result.error.flatten().fieldErrors as any,
        };
    }

    const { email, password, programId, mastersDegreeId, specializationId } = result.data;

    try {
        // 1. Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return { error: "Email already registered. Please login." };
        }

        // 2. Create unverified user
        await createUser({
            email,
            password,
            programId,
            mastersDegreeId,
            specializationId,
        });

        // 3. Send Verification Magic Link
        await signIn("nodemailer", {
            email,
            callbackUrl: "/login?success=verified",
            redirect: false
        });
    } catch (error) {
        console.error("[RegisterAction Error]:", error);
        return { error: "Failed to create account. Please try again." };
    }

    // Redirect to login after success
    redirect("/login?success=account-created");
}

/**
 * Action: Handles user login.
 * Role: Controller - Password-based login for verified users.
 */
export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const rawData = Object.fromEntries(formData.entries());
    const result = loginSchema.safeParse(rawData);

    if (!result.success) {
        return {
            error: "Please check your credentials.",
            fieldErrors: result.error.flatten().fieldErrors as any,
        };
    }

    const { email, password } = result.data;

    try {
        const user = await findUserByEmail(email);

        if (!user) {
            return { error: "No account found with this email. Please register." };
        }

        if (!user.emailVerified) {
            return { error: "Please verify your email before logging in." };
        }

        // Perform password login (redirect: false to handle result explicitly)
        const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        if (!signInResult?.ok) {
            return { error: "Invalid email or password." };
        }
    } catch (error) {
        console.error("[LoginAction Error]:", error);
        return { error: "Something went wrong. Please try again later." };
    }

    // Redirect on success (outside try/catch, consistent with registerAction)
    redirect("/");
}

/**
 * Action: Handles user logout.
 * Role: Controller - Destroys session and redirects to login.
 */
export async function logoutAction() {
    try {
        await signOut({ redirect: false });
    } catch (error) {
        console.error("[LogoutAction Error]:", error);
        redirect("/?error=logout-failed");
    }

    redirect("/login?success=logged-out");
}


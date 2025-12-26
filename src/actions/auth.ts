"use server"

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
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
            fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
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
        // Auth.js v5: signIn throws on failure, doesn't return { ok: false }
        await signIn("nodemailer", {
            email,
            callbackUrl: "/login?success=verified",
            redirect: false
        });
        // If we reach here, email was sent successfully
    } catch (error) {
        // Auth.js v5 throws AuthError on email send failure
        if (error instanceof AuthError) {
            console.error("[RegisterAction] Email send failed:", error);
            return { error: "Account created but verification email failed to send. Please use 'Resend Verification' on the login page." };
        }
        console.error("[RegisterAction Error]:", error);
        return { error: "Failed to create account. Please try again." };
    }

    // Only redirect on full success (user created AND email sent)
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
            fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
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

        // Auth.js v5: signIn throws on failure, doesn't return { ok: false }
        await signIn("credentials", {
            email,
            password,
            redirect: false
        });
        // If we reach here, sign-in succeeded
    } catch (error) {
        // Auth.js v5 throws AuthError on invalid credentials
        if (error instanceof AuthError) {
            return { error: "Invalid email or password." };
        }
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


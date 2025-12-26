"use server"

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { loginSchema, registerSchema, kthEmailSchema } from "@/lib/validation";
import { signIn, signOut, findUserByEmail, createUser, getResendCooldownStatus } from "@/services/auth";
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
        await signIn("nodemailer", {
            email,
            callbackUrl: "/login?success=verified",
            redirect: false
        });
    } catch (error) {
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

/**
 * Action: Resends verification email to unverified users.
 * Role: Controller - Validates email, checks cooldown, sends magic link.
 */
export async function resendVerificationAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const email = formData.get("email");
    const parsed = kthEmailSchema.safeParse(email);

    if (!parsed.success) {
        return { error: "Please enter a valid @kth.se email address." };
    }

    const validEmail = parsed.data;

    try {
        // 1. Check user exists
        const user = await findUserByEmail(validEmail);
        if (!user) {
            return { error: "No account found with this email." };
        }

        // 2. Check if already verified
        if (user.emailVerified) {
            return { error: "This email is already verified. You can log in." };
        }

        // 3. Check cooldown
        const cooldownStatus = await getResendCooldownStatus(validEmail);
        if (!cooldownStatus.canResend) {
            const minutes = Math.ceil(cooldownStatus.retryAfterSeconds / 60);
            return { error: `Please wait ${minutes} minute(s) before requesting another email.` };
        }

        // 4. Send verification email
        await signIn("nodemailer", {
            email: validEmail,
            callbackUrl: "/login?success=verified",
            redirect: false
        });

        return { success: true, message: "Verification email sent! Check your inbox." };
    } catch (error) {
        console.error("[ResendVerificationAction Error]:", error);
        return { error: "Something went wrong. Please try again." };
    }
}

"use server"

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { loginSchema, registerSchema, kthEmailSchema, resetPasswordSchema } from "@/lib/validation";
import { signIn, signOut, findUserByEmail, createUser, getResendCooldownStatus, getPasswordResetCooldownStatus, createPasswordResetToken, validatePasswordResetToken, updateUserPassword } from "@/services/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
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

/**
 * Action: Request password reset email.
 * Role: Controller - Validates email, checks user exists and is verified, generates token, sends email.
 */
export async function requestPasswordResetAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
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

        // 2. Check if user is verified (unverified users should use resend verification instead)
        if (!user.emailVerified) {
            return { error: "Please verify your email first. Use 'Resend Verification' below." };
        }

        // 3. Check cooldown
        const cooldownStatus = await getPasswordResetCooldownStatus(validEmail);
        if (!cooldownStatus.canRequest) {
            const minutes = Math.ceil(cooldownStatus.retryAfterSeconds / 60);
            return { error: `Please wait ${minutes} minute(s) before requesting another reset email.` };
        }

        // 4. Generate token and send email
        const token = await createPasswordResetToken(validEmail);
        await sendPasswordResetEmail(validEmail, token);

        return { success: true, message: "Password reset link sent! Check your inbox." };
    } catch (error) {
        console.error("[RequestPasswordResetAction Error]:", error);
        return { error: "Something went wrong. Please try again." };
    }
}

/**
 * Action: Reset password with valid token.
 * Role: Controller - Validates form and token, updates password, redirects to login.
 */
export async function resetPasswordAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const rawData = Object.fromEntries(formData.entries());
    const result = resetPasswordSchema.safeParse(rawData);

    if (!result.success) {
        return {
            error: "Please check your input.",
            fieldErrors: result.error.flatten().fieldErrors as Record<string, string[] | undefined>,
        };
    }

    const { token, password } = result.data;

    try {
        // 1. Validate token and get email
        const email = await validatePasswordResetToken(token);
        if (!email) {
            redirect("/login?error=reset-link-invalid");
        }

        // 2. Update password and consume token
        await updateUserPassword(email, password, token);
    } catch (error) {
        console.error("[ResetPasswordAction Error]:", error);
        return { error: "Something went wrong. Please try again." };
    }

    // Redirect on success
    redirect("/login?success=password-reset");
}


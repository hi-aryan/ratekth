import Nodemailer from "next-auth/providers/nodemailer";
import { Resend } from "resend";
import { renderEmailTemplate } from "@/lib/email-templates";

const MAIL_TIMEOUT_MS = 15_000; // 15s
const DEFAULT_FROM_EMAIL = "rateKTH <noreply@ratekth.se>";

/**
 * Get the "from" email address. Reads from env at runtime.
 * Fallback to default if not configured (dev environment).
 */
const getFromEmail = (): string => process.env.EMAIL_FROM || DEFAULT_FROM_EMAIL;

/**
 * Send email via Resend with timeout fallback.
 * Lazy-initializes Resend client to avoid build-time errors.
 */
const sendEmailWithFallback = async (
    to: string,
    subject: string,
    text: string,
    html: string,
    fallbackUrl?: string
): Promise<void> => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = getFromEmail();

    try {
        const result = await Promise.race([
            resend.emails.send({
                from: fromEmail,
                to,
                subject,
                text,
                html,
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("Email timeout")), MAIL_TIMEOUT_MS)
            ),
        ]);

        if ("error" in result && result.error) {
            throw new Error(result.error.message);
        }

        console.log("✓ Email sent to", to);
    } catch (error) {
        console.error("✗ Failed to send email:", error);
        if (fallbackUrl) {
            console.log("\n========== [EMAIL FALLBACK] ==========");
            console.log("To:", to);
            console.log("URL:", fallbackUrl);
            console.log("=======================================\n");
        }
    }
};

/**
 * Auth.js Nodemailer provider config.
 * Uses Resend under the hood via custom sendVerificationRequest.
 */
export const mailConfig = Nodemailer({
    server: {}, // Not used - we override sendVerificationRequest
    from: DEFAULT_FROM_EMAIL, // Static default; actual sending uses getFromEmail()
    sendVerificationRequest: async ({ identifier, url }) => {
        const { host } = new URL(url);

        await sendEmailWithFallback(
            identifier,
            `Verify your email for ${host}`,
            `Verify your email for rateKTH\n${url}\n\n`,
            renderEmailTemplate({
                title: "Verify your email",
                body: "Welcome to the home of student reviews at KTH! Click the button below to activate your account.",
                ctaText: "Verify Email",
                ctaUrl: url,
            }),
            url
        );
    },
});

/**
 * Send password reset email with tokenized link.
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await sendEmailWithFallback(
        email,
        "Reset your rateKTH password",
        `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
        renderEmailTemplate({
            title: "Reset your password",
            body: "Click the button below to reset your rateKTH password.",
            ctaText: "Reset Password",
            ctaUrl: resetUrl,
        }),
        resetUrl
    );
};

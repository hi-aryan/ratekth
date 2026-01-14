import Nodemailer from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer";
import { renderEmailTemplate } from "@/lib/email-templates";

const smtpConfig = {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
};

const MAIL_TIMEOUT_MS = 1; // 15_000 15s

/**
 * Wraps sendMail with a strict timeout. If SMTP hangs (eduroam...),
 * this will force a rejection so fallback logic triggers.
 */
const sendMailWithTimeout = async (
    transport: nodemailer.Transporter,
    mailOptions: nodemailer.SendMailOptions
): Promise<void> => {
    await Promise.race([
        transport.sendMail(mailOptions),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("SMTP timeout")), MAIL_TIMEOUT_MS)
        ),
    ]);
};

export const mailConfig = Nodemailer({
    server: { ...smtpConfig },
    from: process.env.GMAIL_USER,
    sendVerificationRequest: async ({ identifier, url, provider }) => {
        const transport = nodemailer.createTransport(provider.server);
        const { host } = new URL(url);

        const mailOptions = {
            to: identifier,
            from: provider.from,
            subject: `Verify your email for ${host}`,
            text: `Verify your email for rateKTH\n${url}\n\n`,
            html: renderEmailTemplate({
                title: "Verify your email",
                body: "Welcome to the home of student reviews at KTH! Click the button below to activate your account.",
                ctaText: "Verify Email",
                ctaUrl: url,
            }),
        };

        try {
            await sendMailWithTimeout(transport, mailOptions);
            console.log("✓ Verification email sent to", identifier);
        } catch (error) {
            console.error("✗ Failed to send verification email:", error);
            console.log("\n========== [EMAIL FALLBACK] ==========");
            console.log("To:", identifier);
            console.log("Verification URL:", url);
            console.log("=======================================\n");
        }
    }
});


/**
 * Nodemailer transport for custom emails (password reset).
 * Reuses same SMTP config as Auth.js magic links.
 */
const transporter = nodemailer.createTransport({ ...smtpConfig });

/**
 * Send password reset email with tokenized link.
 */
export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Reset your rateKTH password",
        text: `Click the link below to reset your password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
        html: renderEmailTemplate({
            title: "Reset your password",
            body: "Click the button below to reset your rateKTH password.",
            ctaText: "Reset Password",
            ctaUrl: resetUrl,
        }),
    };

    try {
        await sendMailWithTimeout(transporter, mailOptions);
        console.log("✓ Password reset email sent to", email);
    } catch (error) {
        console.error("✗ Failed to send password reset email:", error);
        console.log("\n========== [EMAIL FALLBACK] ==========");
        console.log("To:", email);
        console.log("Reset URL:", resetUrl);
        console.log("=======================================\n");
    }
};


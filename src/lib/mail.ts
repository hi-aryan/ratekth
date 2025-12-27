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

export const mailConfig = Nodemailer({
    server: { ...smtpConfig },
    from: process.env.GMAIL_USER,
    sendVerificationRequest: async ({ identifier, url, provider }) => {
        const transport = nodemailer.createTransport(provider.server);
        const { host } = new URL(url);

        await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: `Verify your email for ${host}`,
            text: `Verify your email for rateKTH\n${url}\n\n`,
            html: renderEmailTemplate({
                title: "Verify your email",
                body: "Welcome to rateKTH! Click the button below to verify your email address and activate your account.",
                ctaText: "Verify Email",
                ctaUrl: url,
            }),
        });
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

    await transporter.sendMail({
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
    });
};

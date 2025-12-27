import Nodemailer from "next-auth/providers/nodemailer";
import nodemailer from "nodemailer";

export const mailConfig = Nodemailer({
    server: {
        host: "smtp.gmail.com",
        port: 465, /* 465 for SSL, 587 for TLS */
        secure: true,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    },
    from: process.env.GMAIL_USER,
});

/**
 * Nodemailer transport for custom emails (password reset).
 * Reuses same SMTP config as Auth.js magic links.
 */
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

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
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset your password</h2>
                <p>Click the button below to reset your rateKTH password:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
                    Reset Password
                </a>
                <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour.</p>
                <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
};

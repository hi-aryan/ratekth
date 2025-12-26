import Nodemailer from "next-auth/providers/nodemailer";

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

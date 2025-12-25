import { DefaultSession } from "next-auth"

export type ActionState = { /* add <T> to when adding posts/reviews?? */
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
    message?: string
} | null

/**
 * NextAuth Module Augmentation
 * extends User and Session objects with extra fields.
 */
declare module "next-auth" {
    interface User {
        emailVerified?: Date | null
    }

    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

/**
 * Domain Type: Academic Program
 * Shared between Services (fetching) and Components (displaying)
 */
export interface Program {
    id: number
    name: string
    code: string
}
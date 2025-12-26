/* TODO: User, Course, Review, Specialization, Tag types */

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
    credits: number
    programType: 'bachelor' | 'master'
}

/**
 * Domain Type: Specialization within a Master's Degree
 */
export interface Specialization {
    id: number
    name: string
    programId: number
}

/**
 * Service Input: Data required to create a new user.
 * Either programId (Case 1) or mastersDegreeId (Case 2) must be provided.
 */
export interface CreateUserInput {
    email: string
    password: string
    programId?: number
    mastersDegreeId?: number
    specializationId?: number
}
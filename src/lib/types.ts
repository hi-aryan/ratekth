/* TODO: User, Course, Review, Specialization, Tag types */

import { DefaultSession } from "next-auth"

export type ActionState = { /* add <T> to when adding posts/reviews?? */
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
    message?: string
    existingReviewId?: number
} | null

/**
 * NextAuth Module Augmentation
 * Extends User, Session, and JWT with academic fields.
 * Enables visibility queries without extra DB lookups.
 */
declare module "next-auth" {
    interface User {
        emailVerified?: Date | null
        programId?: number | null
        mastersDegreeId?: number | null
        specializationId?: number | null
    }

    interface Session {
        user: {
            id: string
            programId?: number | null
            mastersDegreeId?: number | null
            specializationId?: number | null
        } & DefaultSession["user"]
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        programId?: number | null
        mastersDegreeId?: number | null
        specializationId?: number | null
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
    hasIntegratedMasters?: boolean
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

/**
 * DTO: Safe user data for actions and components.
 * Excludes password - this is the ONLY user type that should cross service boundaries.
 */
export interface SafeUser {
    id: string
    email: string
    emailVerified: Date | null
    name?: string | null
    username?: string | null
    image?: string | null
    programId?: number | null
    mastersDegreeId?: number | null
    specializationId?: number | null
}

/**
 * Internal: User with password for auth verification only.
 * NEVER export from services - use only within auth.ts authorize().
 */
export interface UserWithPassword extends SafeUser {
    password: string
}

/**
 * DTO: User with eligibility info for account page.
 * Includes program details for determining master's degree selection eligibility.
 */
export interface UserWithEligibility {
    id: string
    email: string
    username: string | null
    programId: number | null
    programCredits: number | null          // 180, 300, or 120
    programName: string | null
    programCode: string | null
    programHasIntegratedMasters: boolean | null  // true = cannot select master's
    mastersDegreeId: number | null         // null = eligible for selection
    mastersDegree: { name: string; code: string } | null
    specializationId: number | null
    specialization: { name: string } | null
}

/**
 * Domain Type: Tag for reviews with sentiment.
 */
export interface Tag {
    id: number
    name: string
    sentiment: 'positive' | 'negative'
}

/**
 * Domain Type: Course basic info.
 */
export interface Course {
    id: number
    name: string
    code: string
}

/**
 * DTO: Course with aggregated review statistics (for search results/listings).
 */
export interface CourseWithStats extends Course {
    reviewCount: number
    averageRating?: number
}

/**
 * DTO: Review formatted for display (includes related course, author, tags).
 * Overall rating is computed, not stored.
 */
export interface ReviewForDisplay {
    id: number
    datePosted: Date
    yearTaken: number
    ratingProfessor: number
    ratingMaterial: number
    ratingPeers: number
    ratingWorkload: 'light' | 'medium' | 'heavy'
    content: string | null
    overallRating: number // computed: avg of 3 ratings
    authorId: string // for ownership check on detail page
    course: Course
    author: {
        username: string | null
        image: string | null
    }
    tags: Tag[]
}

/**
 * Generic paginated result wrapper.
 * totalCount is optional (not available when using limit+1 optimization).
 */
export interface PaginatedResult<T> {
    items: T[]
    totalCount?: number
    page: number
    pageSize: number
    hasMore: boolean
}
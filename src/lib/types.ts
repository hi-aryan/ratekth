export type ActionState = { /* add <T> to when adding posts/reviews?? */
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
    message?: string
} | null

/**
 * Domain Type: Academic Program
 * Shared between Services (fetching) and Components (displaying)
 */
export interface Program {
    id: number
    name: string
    code: string
}
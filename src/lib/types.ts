export type ActionState = {
    success?: boolean
    error?: string
    fieldErrors?: Record<string, string[] | undefined>
    message?: string
} | null

/* add <T> to when adding posts/reviews?? */
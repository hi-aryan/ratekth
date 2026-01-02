"use client"

import { useActionState } from "react"
import { Trash2 } from "lucide-react"
import { deleteReviewAction } from "@/actions/reviews"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface DeleteReviewButtonProps {
    reviewId: number
}

/**
 * Interactive delete button with confirmation dialog.
 * Uses useActionState for form submission with pending state.
 */
export const DeleteReviewButton = ({ reviewId }: DeleteReviewButtonProps) => {
    const [showConfirm, setShowConfirm] = useState(false)
    const [state, formAction, isPending] = useActionState(deleteReviewAction, null)

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-carbon/70">Delete review?</span>
                <form action={formAction}>
                    <input type="hidden" name="reviewId" value={reviewId} />
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                            "bg-coral text-white hover:bg-coral/90",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isPending ? "Deleting..." : "Confirm"}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                        "bg-carbon/10 text-carbon hover:bg-carbon/20",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    "text-coral/80 hover:text-coral hover:bg-coral/10"
                )}
            >
                <Trash2 className="w-4 h-4" />
                Delete
            </button>
            {state?.error && (
                <p className="text-sm text-coral mt-1">{state.error}</p>
            )}
        </>
    )
}

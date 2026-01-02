"use client"

import { useActionState, useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteReviewAction } from "@/actions/reviews"
import { Button } from "@/components/ui/Button"

interface DeleteReviewButtonProps {
    reviewId: number
}

/**
 * Interactive delete button with confirmation dialog.
 * Uses Button variants: ghost for initial trigger, destructive for confirm.
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
                    <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        loading={isPending}
                    >
                        Confirm
                    </Button>
                </form>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                >
                    Cancel
                </Button>
            </div>
        )
    }

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="text-coral hover:text-coral hover:bg-coral/10"
            >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
            </Button>
            {state?.error && (
                <p className="text-sm text-coral mt-1">{state.error}</p>
            )}
        </>
    )
}

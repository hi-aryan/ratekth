import { Loader2 } from "lucide-react"

/**
 * Loading state for feed page.
 * Simple centered spinner — no layout matching needed.
 */
export default function FeedLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-carbon opacity-40 animate-spin" />
                <p className="text-sm text-carbon/50">Loading...</p>
            </div>
        </div>
    )
}

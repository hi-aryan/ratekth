'use client'

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

/**
 * Error Boundary for (auth) route group.
 * Catches unexpected errors in login/register/reset pages and provides recovery UI.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <>
            <div className="text-center text-carbon">
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-carbon/60 mt-2">We couldn&apos;t load this page.</p>
            </div>
            <Card className="text-center py-8">
                <p className="text-sm text-carbon/60 mb-6">
                    Please try again. If the problem persists, contact support.
                </p>
                <Button onClick={() => reset()}>
                    Try again
                </Button>
            </Card>
        </>
    )
}

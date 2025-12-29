'use client'

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

/**
 * Error Boundary for (app) route group.
 * Catches unexpected errors in feed/course pages and provides recovery UI.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <main className="min-h-screen bg-porcelain flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <h2 className="text-xl font-semibold text-carbon mb-2">
                    Something went wrong
                </h2>
                <p className="text-sm text-carbon/60 mb-6">
                    We couldn&apos;t load this page. Please try again.
                </p>
                <Button onClick={() => reset()}>
                    Try again
                </Button>
            </Card>
        </main>
    )
}

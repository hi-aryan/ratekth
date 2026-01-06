"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

interface WriteReviewButtonProps {
    className?: string
    /** Optional click handler (used to close a sidebar) */
    onClick?: () => void
}

/**
 * WriteReviewButton: Conditionally renders "Write Review" button.
 * Hides itself when user is already on /review/new to avoid redundancy.
 */
export const WriteReviewButton = ({ className, onClick }: WriteReviewButtonProps) => {
    const pathname = usePathname()

    // Don't show when already on the review creation page
    if (pathname === "/review/new") return null

    return (
        <Link href="/review/new" onClick={onClick} className="block">
            <Button showShine className={className}>Write Review</Button>
        </Link>
    )
}

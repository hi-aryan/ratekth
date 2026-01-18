"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileReviewFabProps {
    isAuthenticated: boolean;
}

/**
 * MobileReviewFab: Fixed floating action button for writing reviews.
 * - Mobile only (hidden on md+)
 * - Hides on /review/new to avoid redundancy
 * - Redirects to login with callback if not authenticated
 */
export const MobileReviewFab = ({ isAuthenticated }: MobileReviewFabProps) => {
    const pathname = usePathname();

    if (pathname === "/review/new") return null;

    const href = isAuthenticated ? "/review/new" : "/login?callbackUrl=/review/new";

    return (
        <Link
            href={href}
            className={cn(
                "fixed bottom-6 right-6 z-50 md:hidden",
                "w-13 h-13 rounded-full shadow-lg",
                "bg-carbon text-white",
                "flex items-center justify-center",
                "hover:scale-105 active:scale-95 transition-transform"
            )}
            aria-label="Write review"
        >
            <PenLine className="w-5 h-5" />
        </Link>
    );
};

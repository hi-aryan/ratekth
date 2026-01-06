"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { FeedFilterOption } from "@/lib/constants"

/**
 * FeedFilterToggle Component
 * 
 * Allows authenticated users to toggle between "All Reviews" and "My Program" views.
 * Uses URL searchParams for server-component-friendly state management.
 */
export const FeedFilterToggle = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentFilter = searchParams.get("filter") ?? "all"

    const handleFilterChange = (filter: FeedFilterOption) => {
        const params = new URLSearchParams(searchParams.toString())

        if (filter === "all") {
            params.delete("filter")
        } else {
            params.set("filter", filter)
        }

        // Reset to page 1 when changing filter
        params.delete("page")

        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex gap-1 p-1 bg-carbon/5 rounded-lg">
            <button
                onClick={() => handleFilterChange("all")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${currentFilter === "all"
                    ? "bg-white text-carbon shadow-sm scale-[1.02]"
                    : "text-carbon/60 hover:text-carbon"
                    }`}
            >
                All Reviews
            </button>
            <button
                onClick={() => handleFilterChange("my-program")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${currentFilter === "my-program"
                    ? "bg-white text-carbon shadow-sm scale-[1.02]"
                    : "text-carbon/60 hover:text-carbon"
                    }`}
            >
                My Program
            </button>
        </div>
    )
}

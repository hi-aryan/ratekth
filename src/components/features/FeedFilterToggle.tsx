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

    const currentFilter = searchParams.get("filter") ?? "my-program"

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
        <div className="flex gap-1 px-2 py-1.5 bg-carbon/4 rounded-lg">
            <button
                onClick={() => handleFilterChange("all")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${currentFilter === "all"
                    ? "bg-white text-carbon shadow-sm scale-[1.02]"
                    : "text-carbon/60 hover:text-carbon active:scale-[0.95]"
                    }`}
            >
                All Reviews
            </button>
            <button
                onClick={() => handleFilterChange("my-program")}
                className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${currentFilter === "my-program"
                    ? "bg-white text-carbon shadow-sm scale-[1.02]"
                    : "text-carbon/60 hover:text-carbon active:scale-[0.95]"
                    }`}
            >
                My Program
            </button>
        </div>
    )
}

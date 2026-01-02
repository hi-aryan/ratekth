"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { SORT_OPTIONS, type FeedSortOption } from "@/lib/constants"

/**
 * Labels for sort options in dropdown.
 */
const sortLabels: Record<FeedSortOption, string> = {
    'newest': 'Newest',
    'top-rated': 'Top Rated',
    'professor': 'Best Professor',
    'material': 'Best Material',
    'peers': 'Best Peers',
}

interface SortDropdownProps {
    /** Optional: if not provided, derives from URL searchParams */
    currentSort?: FeedSortOption
}

/**
 * SortDropdown: Client component for changing feed sort order.
 * Derives currentSort from URL if not provided as prop.
 * Updates URL params and resets to page 1 when sort changes.
 */
export const SortDropdown = ({ currentSort: propSort }: SortDropdownProps) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Derive from URL if not provided as prop
    const sortByParam = searchParams.get('sortBy')
    const currentSort: FeedSortOption = propSort ?? (
        SORT_OPTIONS.includes(sortByParam as FeedSortOption)
            ? (sortByParam as FeedSortOption)
            : 'newest'
    )

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value as FeedSortOption
        const params = new URLSearchParams(searchParams.toString())

        // Reset to page 1 when sort changes
        params.delete("page")

        // Only add sortBy if not default
        if (newSort === "newest") {
            params.delete("sortBy")
        } else {
            params.set("sortBy", newSort)
        }

        const query = params.toString()
        router.push(query ? `/?${query}` : "/")
    }

    return (
        <div className="flex items-center gap-3">
            <label htmlFor="sort-select" className="text-sm text-carbon/50 shrink-0">
                Sort by
            </label>
            <select
                id="sort-select"
                value={currentSort}
                onChange={handleChange}
                className="flex-1 min-w-0 px-3 py-2 text-sm text-carbon/80 bg-white border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 rounded-lg focus:outline-none focus:border-carbon cursor-pointer appearance-none"
                >
                {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                        {sortLabels[option]}
                    </option>
                ))}
            </select>
        </div>
    )
}

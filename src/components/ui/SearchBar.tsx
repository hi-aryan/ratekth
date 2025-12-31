"use client"

import { Search } from "lucide-react"
import { useState } from "react"

/**
 * SearchBar: MVP search input with icon.
 * Currently dumb - stores local state only, no backend integration.
 * Future: Will connect to search service via URL params or server action.
 */
export const SearchBar = () => {
    const [query, setQuery] = useState("")

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon/40 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-lg border border-carbon/20 bg-white pl-10 pr-4 py-2 text-sm text-carbon transition-all placeholder:text-carbon/50 focus:border-carbon focus:outline-none focus:ring-4 focus:ring-carbon/5"
            />
        </div>
    )
}

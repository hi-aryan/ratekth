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
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="peer w-full rounded-lg border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 bg-white pl-10 pr-4 py-2 text-sm text-carbon placeholder:text-carbon/50 focus:border-carbon/70 focus:outline-none focus:shadow-[0_0_4px_rgba(31,91,174,0.2)]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-40 pointer-events-none transition-all duration-200 peer-focus:text-carbon peer-focus:opacity-80 peer-hover:scale-115 peer-hover:opacity-60" />
        </div>
    )
}

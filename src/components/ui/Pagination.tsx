import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { FeedSortOption } from "@/lib/constants"

interface PaginationProps {
    currentPage: number
    hasMore: boolean
    sortBy?: FeedSortOption
}

/**
 * Pagination: Server component for feed navigation.
 * Uses <Link> for SEO-friendly, prefetchable navigation.
 * Preserves sortBy param across page changes.
 */
export const Pagination = ({ currentPage, hasMore, sortBy }: PaginationProps) => {
    const isFirstPage = currentPage === 1

    /**
     * Build href with page and optional sortBy params.
     */
    const buildHref = (page: number): string => {
        const params = new URLSearchParams()
        if (page > 1) params.set("page", String(page))
        if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy)
        const query = params.toString()
        return query ? `/?${query}` : "/"
    }

    return (
        <div className="flex items-center justify-center gap-3 pt-6">
            {/* Previous Button */}
            {isFirstPage ? (
                <span className="flex items-center gap-1.5 px-4 py-2 text-sm text-carbon/30 cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </span>
            ) : (
                <Link
                    href={buildHref(currentPage - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-carbon/70 hover:text-carbon transition-colors rounded-lg hover:bg-carbon/5"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Link>
            )}

            {/* Page Indicator */}
            <span className="px-3 py-1.5 text-sm font-medium text-carbon bg-carbon/5 rounded-lg">
                Page {currentPage}
            </span>

            {/* Next Button */}
            {hasMore ? (
                <Link
                    href={buildHref(currentPage + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-carbon/70 hover:text-carbon transition-colors rounded-lg hover:bg-carbon/5"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Link>
            ) : (
                <span className="flex items-center gap-1.5 px-4 py-2 text-sm text-carbon/30 cursor-not-allowed">
                    Next
                    <ChevronRight className="w-4 h-4" />
                </span>
            )}
        </div>
    )
}

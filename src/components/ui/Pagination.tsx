import Link from "next/link"
import { ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react"
import type { FeedSortOption } from "@/lib/constants"

interface PaginationProps {
    currentPage: number
    hasMore: boolean
    sortBy?: FeedSortOption
    /** Base path for pagination links (default: "/") */
    basePath?: string
}

/**
 * Pagination: Server component for feed navigation.
 * 
 * Uses <Link> for SEO-friendly, prefetchable navigation.
 * Preserves sortBy param across page changes.
 * 
 * Layout: [««] [‹] Page X [›]
 */
export const Pagination = ({
    currentPage,
    hasMore,
    sortBy,
    basePath = "/"
}: PaginationProps) => {
    const isFirstPage = currentPage === 1

    /**
     * Build href with page and optional sortBy params.
     * Page 1 omits the page param for cleaner URLs.
     */
    const buildHref = (page: number): string => {
        const params = new URLSearchParams()
        if (page > 1) params.set("page", String(page))
        if (sortBy && sortBy !== "newest") params.set("sortBy", sortBy)
        const query = params.toString()
        return query ? `${basePath}?${query}` : basePath
    }

    // Consistent sizing for all elements
    const buttonBase = "flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
    const buttonActive = `${buttonBase} text-carbon/60 hover:text-carbon hover:bg-carbon/5`
    const buttonDisabled = `${buttonBase} text-carbon/20 cursor-not-allowed`

    return (
        <div className="flex items-center justify-center gap-1 pt-6">
            {/* First */}
            {isFirstPage ? (
                <span className={buttonDisabled} aria-disabled="true">
                    <ChevronsLeft className="w-5 h-5" />
                </span>
            ) : (
                <Link href={buildHref(1)} className={buttonActive}>
                    <ChevronsLeft className="w-5 h-5" />
                </Link>
            )}

            {/* Previous */}
            {isFirstPage ? (
                <span className={buttonDisabled} aria-disabled="true">
                    <ChevronLeft className="w-5 h-5" />
                </span>
            ) : (
                <Link href={buildHref(currentPage - 1)} className={buttonActive}>
                    <ChevronLeft className="w-5 h-5" />
                </Link>
            )}

            {/* Page Indicator - same height as buttons */}
            <span className="h-8 px-4 flex items-center text-sm font-medium text-carbon bg-carbon/5 rounded-lg mx-1">
                Page {currentPage}
            </span>

            {/* Next */}
            {hasMore ? (
                <Link href={buildHref(currentPage + 1)} className={buttonActive}>
                    <ChevronRight className="w-5 h-5" />
                </Link>
            ) : (
                <span className={buttonDisabled} aria-disabled="true">
                    <ChevronRight className="w-5 h-5" />
                </span>
            )}

            {/* Invisible placeholder to balance First button */}
            <span className="w-8 h-8" aria-hidden="true" />
        </div>
    )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { searchCoursesAction } from "@/actions/courses"
import { useDebounce } from "@/lib/hooks"
import type { CourseWithStats } from "@/lib/types"

/**
 * SearchBar: Course search with debounced dropdown results.
 * - Debounces input (300ms)
 * - Fetches matching courses via Server Action
 * - Keyboard navigation (↑↓ + Enter + Escape)
 * - Click outside to close dropdown
 * - Navigates to /course/[code] on selection
 */
export const SearchBar = () => {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<CourseWithStats[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const [error, setError] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const debouncedQuery = useDebounce(query, 300)

    // Fetch results when debounced query changes
    useEffect(() => {
        let isCancelled = false

        const fetchResults = async () => {
            if (debouncedQuery.trim().length < 2) {
                setResults([])
                setIsOpen(false)
                setError(null)
                return
            }

            setIsLoading(true)
            setError(null)

            const response = await searchCoursesAction(debouncedQuery)

            // Ignore stale responses if a newer request has been made
            if (isCancelled) return

            if ("error" in response) {
                setError(response.error)
                setResults([])
            } else {
                setResults(response.courses)
                setError(null)
            }

            setIsOpen(true)
            setIsLoading(false)
            setSelectedIndex(-1)
        }

        fetchResults()

        return () => {
            isCancelled = true
        }
    }, [debouncedQuery])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Navigate to course page
    const handleSelect = useCallback((course: CourseWithStats) => {
        setQuery("")
        setResults([])
        setIsOpen(false)
        router.push(`/course/${course.code}`)
    }, [router])

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || results.length === 0) return

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
                break
            case "ArrowUp":
                e.preventDefault()
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
                break
            case "Enter":
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    handleSelect(results[selectedIndex])
                }
                break
            case "Escape":
                e.preventDefault()
                setIsOpen(false)
                inputRef.current?.blur()
                break
        }
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Input */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results.length > 0 || error) setIsOpen(true)
                    }}
                    placeholder="Search courses..."
                    className="peer w-full rounded-lg border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 bg-white pl-10 pr-4 py-2 text-sm text-carbon placeholder:text-carbon/70 focus:border-carbon/70 focus:outline-none focus:shadow-[0_0_4px_rgba(31,91,174,0.2)]"
                />
                {/* Icon: Search or Loading */}
                {isLoading ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-60 animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-40 pointer-events-none transition-all duration-200 peer-focus:text-carbon peer-focus:opacity-80 peer-hover:scale-115 peer-hover:opacity-60" />
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-carbon/20 shadow-lg z-50 overflow-hidden">
                    {error ? (
                        <div className="px-4 py-3 text-sm text-coral/80">
                            {error}
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto scrollbar-hide">
                            {results.map((course, index) => (
                                <li key={course.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(course)}
                                        className={`w-full px-4 py-3 text-left transition-all ${index === selectedIndex
                                            ? "bg-carbon/5"
                                            : "hover:translate-x-[3px]"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-carbon">{course.code}</span>
                                                <span className="text-carbon/60"> — {course.name}</span>
                                            </div>
                                            <span className="text-xs text-carbon/40 shrink-0 ml-2">
                                                {course.reviewCount} {course.reviewCount === 1 ? "review" : "reviews"}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-carbon/50">
                            No courses found for &quot;{debouncedQuery}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

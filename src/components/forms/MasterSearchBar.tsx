"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Loader2, X } from "lucide-react"
import { searchMastersDegreesAction } from "@/actions/academic"
import { useDebounce } from "@/lib/hooks"
import type { Program } from "@/lib/types"

/**
 * MasterSearchBar: Master's degree search with debounced dropdown results.
 * - Debounces input (300ms)
 * - Fetches matching 120hp programs via Server Action
 * - Keyboard navigation (↑↓ + Enter + Escape)
 * - Click outside to close dropdown
 * - Calls onSelect callback with selected program
 */

interface MasterSearchBarProps {
    onSelect: (program: Program) => void
    selectedProgram: Program | null
    onClear: () => void
    disabled?: boolean
    placeholder?: string
}

export const MasterSearchBar = ({
    onSelect,
    selectedProgram,
    onClear,
    disabled = false,
    placeholder = "Search master's degrees..."
}: MasterSearchBarProps) => {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Program[]>([])
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

            const response = await searchMastersDegreesAction(debouncedQuery)

            // Ignore stale responses if a newer request has been made
            if (isCancelled) return

            if ("error" in response) {
                setError(response.error)
                setResults([])
            } else {
                setResults(response.programs)
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

    // Handle selection
    const handleSelect = useCallback((program: Program) => {
        setQuery("")
        setResults([])
        setIsOpen(false)
        onSelect(program)
    }, [onSelect])

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

    // If a program is selected, show it instead of search bar
    if (selectedProgram) {
        return (
            <div className="flex items-center gap-3 p-3 bg-blue/5 border border-blue/20 rounded-lg">
                <div className="flex-1">
                    <span className="text-sm font-bold text-blue bg-blue/10 px-2 py-0.5 rounded mr-2">
                        {selectedProgram.code}
                    </span>
                    <span className="font-medium text-carbon">
                        {selectedProgram.name}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onClear}
                    disabled={disabled}
                    className="p-1.5 text-carbon/40 hover:text-coral hover:bg-coral/10 rounded-md transition-colors disabled:opacity-50"
                    aria-label="Clear selection"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )
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
                    placeholder={placeholder}
                    disabled={disabled}
                    className="peer w-full rounded-lg border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 bg-white pl-10 pr-4 py-2.5 text-sm text-carbon placeholder:text-carbon/50 focus:border-carbon/70 focus:outline-none focus:shadow-[0_0_4px_rgba(31,91,174,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {/* Icon: Search or Loading */}
                {isLoading ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-60 animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-40 pointer-events-none transition-all duration-200 peer-focus:text-carbon peer-focus:opacity-80" />
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
                        <ul className="max-h-64 overflow-y-auto">
                            {results.map((program, index) => (
                                <li key={program.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(program)}
                                        className={`w-full px-4 py-3 text-left transition-all ${index === selectedIndex
                                            ? "bg-carbon/5"
                                            : "hover:translate-x-[3px]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-blue bg-blue/10 px-1.5 py-0.5 rounded">
                                                {program.code}
                                            </span>
                                            <span className="text-carbon">
                                                {program.name}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-carbon/50">
                            No programs found for &quot;{debouncedQuery}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

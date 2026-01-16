"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Search, Loader2, ChevronDown, Check, X } from "lucide-react"
import { useDebounce } from "@/lib/hooks"
import { cn } from "@/lib/utils"

/**
 * Combobox: Generic searchable select component.
 * 
 * Supports two modes:
 * - Client-side filter: Pass `items` array, filtering handled locally
 * - Server-side search: Pass `onSearch` function, items fetched async
 * 
 * Features:
 * - Keyboard navigation (↑↓ Enter Escape)
 * - Click outside to close
 * - Debounced search (300ms)
 * - Accessible (ARIA attributes)
 */

export interface ComboboxProps<T> {
    /** Full list of items for client-side filtering */
    items?: T[]
    /** Async search function for server-side search */
    onSearch?: (query: string) => Promise<T[]>
    /** Extract display text from item */
    getDisplayValue: (item: T) => string
    /** Extract search/filter text (defaults to getDisplayValue) */
    getSearchValue?: (item: T) => string
    /** Extract unique key from item */
    getKey: (item: T) => string | number
    /** Called when item is selected */
    onSelect: (item: T) => void
    /** Currently selected item */
    selected?: T | null
    /** Called when selection is cleared */
    onClear?: () => void
    /** Placeholder text */
    placeholder?: string
    /** Disabled state */
    disabled?: boolean
    /** Message when no results found */
    emptyMessage?: string
    /** Open dropdown upward instead of downward */
    openUpward?: boolean
    /** Custom render for each item (optional) */
    renderItem?: (item: T, isSelected: boolean, isHighlighted: boolean) => React.ReactNode
}

export const Combobox = <T,>({
    items = [],
    onSearch,
    getDisplayValue,
    getSearchValue,
    getKey,
    onSelect,
    selected,
    onClear,
    placeholder = "Search or select...",
    disabled = false,
    emptyMessage = "No results found",
    openUpward = false,
    renderItem,
}: ComboboxProps<T>) => {
    const [query, setQuery] = useState("")
    const [filteredItems, setFilteredItems] = useState<T[]>(items)
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const [error, setError] = useState<string | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    const debouncedQuery = useDebounce(query, 300)
    const isServerMode = !!onSearch
    const getSearchText = useMemo(
        () => getSearchValue ?? getDisplayValue,
        [getSearchValue, getDisplayValue]
    )

    // Client-side filter when query changes
    useEffect(() => {
        if (isServerMode) return

        if (debouncedQuery.trim().length === 0) {
            setFilteredItems(items)
        } else {
            const lowerQuery = debouncedQuery.toLowerCase()
            const filtered = items.filter(item =>
                getSearchText(item).toLowerCase().includes(lowerQuery)
            )
            setFilteredItems(filtered)
        }
        setHighlightedIndex(-1)
    }, [debouncedQuery, items, isServerMode, getSearchText])

    // Server-side search when query changes
    useEffect(() => {
        if (!isServerMode || !onSearch) return

        let isCancelled = false

        const doSearch = async () => {
            if (debouncedQuery.trim().length < 2) {
                setFilteredItems([])
                setError(null)
                return
            }

            setIsLoading(true)
            setError(null)

            try {
                const results = await onSearch(debouncedQuery)
                if (!isCancelled) {
                    setFilteredItems(results)
                    setHighlightedIndex(-1)
                }
            } catch {
                if (!isCancelled) {
                    setError("Search failed")
                    setFilteredItems([])
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false)
                }
            }
        }

        doSearch()

        return () => {
            isCancelled = true
        }
    }, [debouncedQuery, isServerMode, onSearch])

    // Show all items when opening in client mode
    useEffect(() => {
        if (isOpen && !isServerMode && query.trim().length === 0) {
            setFilteredItems(items)
        }
    }, [isOpen, isServerMode, items, query])

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex] as HTMLElement
            item?.scrollIntoView({ block: "nearest" })
        }
    }, [highlightedIndex])

    const handleSelect = useCallback((item: T) => {
        onSelect(item)
        setQuery("")
        setIsOpen(false)
        setHighlightedIndex(-1)
    }, [onSelect])

    const handleClear = useCallback(() => {
        onClear?.()
        setQuery("")
        setFilteredItems(items)
        inputRef.current?.focus()
    }, [onClear, items])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < filteredItems.length - 1 ? prev + 1 : prev
                )
                break
            case "ArrowUp":
                e.preventDefault()
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev))
                break
            case "Enter":
                e.preventDefault()
                if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
                    handleSelect(filteredItems[highlightedIndex])
                }
                break
            case "Escape":
                e.preventDefault()
                setIsOpen(false)
                inputRef.current?.blur()
                break
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
        if (!isOpen) setIsOpen(true)
    }

    const handleInputFocus = () => {
        if (!isOpen) {
            setIsOpen(true)
            if (!isServerMode) {
                setFilteredItems(items)
            }
        }
    }

    // Display items (in server mode with no query, show nothing until user types)
    const displayItems = useMemo(() => {
        if (isServerMode && debouncedQuery.trim().length < 2) {
            return []
        }
        return filteredItems
    }, [isServerMode, debouncedQuery, filteredItems])

    const showEmptyState = isServerMode
        ? debouncedQuery.trim().length >= 2 && displayItems.length === 0 && !isLoading
        : query.trim().length > 0 && displayItems.length === 0

    const showHint = isServerMode && debouncedQuery.trim().length < 2 && !isLoading

    // If selected, render selected state
    if (selected) {
        return (
            <div className="flex items-center gap-3 py-2 px-3 bg-blue/5 border border-blue/20 rounded-lg">
                <div className="flex-1 text-sm text-carbon">
                    {getDisplayValue(selected)}
                </div>
                {onClear && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        className="p-1.5 text-carbon/40 hover:text-coral hover:bg-coral/10 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Clear selection"
                    >
                        <X className="w-4 h-4 text-carbon opacity-40" />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Input trigger */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    className="peer w-full rounded-lg border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 bg-white pl-10 pr-10 py-2.5 text-sm text-carbon placeholder:text-carbon/50 focus:border-carbon/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {/* Left icon */}
                {isLoading ? (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-60 animate-spin" />
                ) : (
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-40 pointer-events-none transition-all duration-200 peer-focus:text-carbon peer-focus:opacity-80 peer-hover:scale-115 peer-hover:opacity-60" />
                )}
                {/* Right icon */}
                <ChevronDown
                    className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-carbon opacity-40 pointer-events-none transition-all duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute left-0 right-0 bg-white rounded-lg border border-carbon/20 shadow-lg z-50 overflow-hidden",
                        openUpward ? "bottom-full mb-2" : "top-full mt-1"
                    )}
                >
                    {error ? (
                        <div className="px-4 py-3 text-sm text-coral/80">
                            {error}
                        </div>
                    ) : showHint ? (
                        <div className="px-4 py-3 text-sm text-carbon/50">
                            Type at least 2 characters to search...
                        </div>
                    ) : showEmptyState ? (
                        <div className="px-4 py-3 text-sm text-carbon/50">
                            {emptyMessage}
                        </div>
                    ) : displayItems.length > 0 ? (
                        <ul
                            ref={listRef}
                            role="listbox"
                            className="max-h-64 overflow-y-auto scrollbar-hide"
                        >
                            {displayItems.map((item, index) => {
                                const key = getKey(item)
                                const isHighlighted = index === highlightedIndex
                                const isSelected = selected && getKey(selected) === key

                                if (renderItem) {
                                    return (
                                        <li key={key}>
                                            <button
                                                type="button"
                                                role="option"
                                                aria-selected={isSelected || false}
                                                onClick={() => handleSelect(item)}
                                                className="w-full text-left"
                                            >
                                                {renderItem(item, isSelected || false, isHighlighted)}
                                            </button>
                                        </li>
                                    )
                                }

                                return (
                                    <li key={key}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected || false}
                                            onClick={() => handleSelect(item)}
                                            className={cn(
                                                "w-full px-4 py-3 text-left text-sm text-carbon transition-all flex items-center justify-between",
                                                isHighlighted && "bg-carbon/5",
                                                !isHighlighted && "hover:translate-x-[3px]"
                                            )}
                                        >
                                            <span>{getDisplayValue(item)}</span>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-blue shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : null}
                </div>
            )}
        </div>
    )
}

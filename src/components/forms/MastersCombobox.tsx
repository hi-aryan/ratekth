"use client"

import { useCallback } from "react"
import { Combobox } from "@/components/ui/Combobox"
import { searchMastersDegreesAction } from "@/actions/academic"
import type { Program } from "@/lib/types"

/**
 * MastersCombobox: Master's degree selection using server-side search.
 * Wrapper around generic Combobox with masters-specific config.
 */

interface MastersComboboxProps {
    selected: Program | null
    onSelect: (program: Program) => void
    onClear: () => void
    disabled?: boolean
}

export const MastersCombobox = ({
    selected,
    onSelect,
    onClear,
    disabled = false,
}: MastersComboboxProps) => {
    const handleSearch = useCallback(async (query: string): Promise<Program[]> => {
        const result = await searchMastersDegreesAction(query)
        if ("error" in result) {
            throw new Error(result.error)
        }
        return result.programs
    }, [])

    return (
        <Combobox<Program>
            onSearch={handleSearch}
            getDisplayValue={(p) => `${p.code} ${p.name}`}
            getKey={(p) => p.id}
            onSelect={onSelect}
            selected={selected}
            onClear={onClear}
            disabled={disabled}
            placeholder="Search by program code or name..."
            emptyMessage="No master's degrees found"
            openUpward={true}
            renderItem={(program, isSelected, isHighlighted) => (
                <div
                    className={`w-full px-4 py-3 text-left transition-all flex items-center gap-2 ${
                        isHighlighted ? "bg-carbon/5" : "hover:translate-x-[3px]"
                    }`}
                >
                    <span className="text-xs font-bold text-blue bg-blue/10 px-1.5 py-0.5 rounded shrink-0">
                        {program.code}
                    </span>
                    <span className="text-sm text-carbon">{program.name}</span>
                    {isSelected && (
                        <span className="ml-auto text-blue">✓</span>
                    )}
                </div>
            )}
        />
    )
}

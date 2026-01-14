"use client"

import { Combobox } from "@/components/ui/Combobox"
import type { Program } from "@/lib/types"

/**
 * ProgramCombobox: Base program selection using client-side filtering.
 * Wrapper around generic Combobox with program-specific config.
 * Used in AcademicSelector for registration.
 */

interface ProgramComboboxProps {
    programs: Program[]
    selected: Program | null
    onSelect: (program: Program) => void
    onClear: () => void
    disabled?: boolean
    showCredits?: boolean
}

export const ProgramCombobox = ({
    programs,
    selected,
    onSelect,
    onClear,
    disabled = false,
    showCredits = true,
}: ProgramComboboxProps) => (
    <Combobox<Program>
        items={programs}
        getDisplayValue={(p) => showCredits 
            ? `[${p.code}] ${p.name} (${p.credits}hp)` 
            : `[${p.code}] ${p.name}`
        }
        getSearchValue={(p) => `${p.code} ${p.name}`}
        getKey={(p) => p.id}
        onSelect={onSelect}
        selected={selected}
        onClear={onClear}
        disabled={disabled}
        placeholder="Search your program..."
        emptyMessage="No programs found"
    />
)


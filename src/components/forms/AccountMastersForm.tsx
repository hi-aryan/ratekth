"use client"

import { useState, useTransition } from "react"
import { Program, Specialization } from "@/lib/types"
import { getSpecializationsAction } from "@/actions/academic"
import { updateAcademicAction } from "@/actions/users"
import { MastersCombobox } from "@/components/forms/MastersCombobox"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { PermanentSelectionWarning } from "@/components/ui/PermanentSelectionWarning"

/**
 * AccountMastersForm Component
 * 
 * One-time master's degree + specialization selection form for eligible users.
 * Uses combobox for degree selection (search-based).
 * Includes mandatory confirmation step before submission.
 */

export const AccountMastersForm = () => {
    // Form state
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Transition for async operations
    const [isLoadingSpecs, startLoadingSpecs] = useTransition()
    const [isSubmitting, startSubmitting] = useTransition()

    // Handle program selection from combobox
    const handleProgramSelect = (program: Program) => {
        setSelectedProgram(program)
        setSelectedSpecializationId("")
        setIsConfirmed(false)
        setError(null)

        // Fetch specializations for this program
        startLoadingSpecs(async () => {
            const specs = await getSpecializationsAction(program.id)
            setSpecializations(specs)
        })
    }

    // Handle clearing selection
    const handleClearSelection = () => {
        setSelectedProgram(null)
        setSelectedSpecializationId("")
        setSpecializations([])
        setIsConfirmed(false)
        setError(null)
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startSubmitting(async () => {
            const result = await updateAcademicAction(null, formData)
            if (result?.error) {
                setError(result.error)
                setIsConfirmed(false)
            }
            // On success, action redirects - no need to handle here
        })
    }

    // Determine if specialization is required
    const specializationRequired = specializations.length > 0
    const hasValidSelection = selectedProgram &&
        !isLoadingSpecs &&
        (!specializationRequired || selectedSpecializationId)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-carbon text-lg">Select Your Master&apos;s Degree</h3>
                <p className="text-carbon/60 text-sm">
                    Search for the master&apos;s track you&apos;re pursuing. 
                    <a 
                        href="https://www.kth.se/student/kurser/program" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-1 text-blue hover:underline"
                    >
                        Not sure? Check KTH
                    </a>
                </p>
            </div>

            {/* Master's Degree Combobox */}
            <FormField label="Master's Degree">
                <MastersCombobox
                    selected={selectedProgram}
                    onSelect={handleProgramSelect}
                    onClear={handleClearSelection}
                    disabled={isSubmitting}
                />
                {/* Hidden input for FormData */}
                {selectedProgram && (
                    <input 
                        type="hidden" 
                        name="mastersDegreeId" 
                        value={selectedProgram.id} 
                    />
                )}
            </FormField>

            {/* Specialization Selection (if applicable) */}
            {isLoadingSpecs && (
                <div className="animate-in fade-in duration-300 pl-1">
                    <p className="text-sm text-blue font-medium flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"></span>
                        Loading specializations...
                    </p>
                </div>
            )}

            {!isLoadingSpecs && specializations.length > 0 && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <FormField label="Specialization">
                        <Select
                            name="specializationId"
                            value={selectedSpecializationId}
                            onChange={(e) => {
                                setSelectedSpecializationId(e.target.value)
                                setIsConfirmed(false)
                            }}
                            disabled={isSubmitting}
                            className="transition-all"
                        >
                            <option value="">Select a specialization...</option>
                            {specializations.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>
                </div>
            )}

            {/* Confirmation Section - Only visible when selection is valid */}
            {hasValidSelection && (
                <div className="animate-in zoom-in-95 fade-in duration-500 delay-100 ease-out">
                    <PermanentSelectionWarning
                        isConfirmed={isConfirmed}
                        onConfirmChange={setIsConfirmed}
                        disabled={isSubmitting}
                    >
                        This selection is <strong>permanent</strong>. Once saved, you cannot change your master&apos;s degree or specialization without contacting support.
                    </PermanentSelectionWarning>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="animate-in shake fade-in mt-4">
                    <Alert variant="error">{error}</Alert>
                </div>
            )}

            {/* Submit Button + Animation (minor DRY violation) */}
            <div className={`grid transition-all duration-300 ease-in-out ${
                hasValidSelection && isConfirmed 
                    ? "grid-rows-[1fr] opacity-100 mt-2" 
                    : "grid-rows-[0fr] opacity-0 mt-0"
            }`}>
                <div className="overflow-hidden">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full font-bold"
                        disabled={isSubmitting || !isConfirmed}
                        loading={isSubmitting}
                        tabIndex={isConfirmed ? 0 : -1}
                        aria-hidden={!isConfirmed}
                    >
                        Save Academic Selection
                    </Button>
                </div>
            </div>
        </form>
    )
}

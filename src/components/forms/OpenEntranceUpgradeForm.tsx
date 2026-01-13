"use client"

import { useState, useTransition } from "react"
import { Program, Specialization } from "@/lib/types"
import { getSpecializationsAction } from "@/actions/academic"
import { upgradeFromOpenEntranceAction } from "@/actions/users"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { PermanentSelectionWarning } from "@/components/ui/PermanentSelectionWarning"

/**
 * OpenEntranceUpgradeForm Component
 * 
 * One-time program upgrade form for COPEN (Open Entrance) students.
 * Allows selection of destination 300hp program + optional specialization.
 * Includes mandatory confirmation before submission.
 */

interface OpenEntranceUpgradeFormProps {
    destinationPrograms: Program[]
}

export const OpenEntranceUpgradeForm = ({ destinationPrograms }: OpenEntranceUpgradeFormProps) => {
    // Form state
    const [selectedProgramId, setSelectedProgramId] = useState<string>("")
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Transitions for async operations
    const [isLoadingSpecs, startLoadingSpecs] = useTransition()
    const [isSubmitting, startSubmitting] = useTransition()

    // Handle program selection change
    const handleProgramChange = (value: string) => {
        setSelectedProgramId(value)
        setSelectedSpecializationId("")
        setIsConfirmed(false)
        setError(null)

        if (value) {
            startLoadingSpecs(async () => {
                const specs = await getSpecializationsAction(Number(value))
                setSpecializations(specs)
            })
        } else {
            setSpecializations([])
        }
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startSubmitting(async () => {
            const result = await upgradeFromOpenEntranceAction(null, formData)
            if (result?.error) {
                setError(result.error)
                setIsConfirmed(false)
            }
            // On success, action redirects - no need to handle here
        })
    }

    const hasValidSelection = selectedProgramId && !isLoadingSpecs

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Destination Program Selection */}
            <FormField label="Destination Programme">
                <Select
                    value={selectedProgramId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    disabled={isSubmitting}
                >
                    <option value="">Select your programme...</option>
                    {destinationPrograms.map((p) => (
                        <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                        </option>
                    ))}
                </Select>
            </FormField>

            {/* Loading indicator for specializations */}
            {isLoadingSpecs && (
                <div className="animate-in fade-in duration-300 pl-1">
                    <p className="text-sm text-blue font-medium flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin"></span>
                        Loading specializations...
                    </p>
                </div>
            )}

            {/* Specialization Selection (if available) */}
            {!isLoadingSpecs && specializations.length > 0 && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <FormField label="Programme Specialization (optional)">
                        <Select
                            value={selectedSpecializationId}
                            onChange={(e) => {
                                setSelectedSpecializationId(e.target.value)
                                setIsConfirmed(false)
                            }}
                            disabled={isSubmitting}
                        >
                            <option value="">No specialization</option>
                            {specializations.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>
                </div>
            )}

            {/* Confirmation Section */}
            {hasValidSelection && (
                <div className="animate-in zoom-in-95 fade-in duration-500 delay-100 ease-out">
                    <PermanentSelectionWarning
                        isConfirmed={isConfirmed}
                        onConfirmChange={setIsConfirmed}
                        disabled={isSubmitting}
                    >
                        This selection is <strong>permanent</strong>. After upgrading, you will no longer see Open Entrance courses in your feed and cannot review them.
                    </PermanentSelectionWarning>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="animate-in shake fade-in mt-4">
                    <Alert variant="error">{error}</Alert>
                </div>
            )}

            {/* Hidden inputs for form submission */}
            <input type="hidden" name="newProgramId" value={selectedProgramId} />
            <input type="hidden" name="programSpecializationId" value={selectedSpecializationId} />

            {/* Submit Button */}
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
                        Upgrade Programme
                    </Button>
                </div>
            </div>
        </form>
    )
}

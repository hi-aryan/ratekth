"use client"

import { useState, useTransition } from "react"
import { Program, Specialization } from "@/lib/types"
import { getSpecializationsAction } from "@/actions/academic"
import { updateAcademicAction } from "@/actions/users"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"

/**
 * AccountMastersForm Component
 * 
 * One-time master's degree + specialization selection form for eligible users.
 * Includes mandatory confirmation step before submission.
 */

interface AccountMastersFormProps {
    mastersDegrees: Program[]
}

export const AccountMastersForm = ({ mastersDegrees }: AccountMastersFormProps) => {
    // Form state
    const [selectedMastersDegreeId, setSelectedMastersDegreeId] = useState<string>("")
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Transition for async operations
    const [isLoadingSpecs, startLoadingSpecs] = useTransition()
    const [isSubmitting, startSubmitting] = useTransition()

    // Handle master's degree change: fetch specializations
    const handleMastersDegreeChange = (value: string) => {
        setSelectedMastersDegreeId(value)
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
    const hasValidSelection = selectedMastersDegreeId &&
        (!specializationRequired || selectedSpecializationId)

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
                <h3 className="font-semibold text-carbon">Select Your Master&apos;s Degree</h3>
                <p className="text-sm text-carbon/60">
                    Choose the master&apos;s track you&apos;re pursuing.
                </p>
            </div>

            {/* Master's Degree Selection */}
            <FormField label="Master's Degree">
                <Select
                    name="mastersDegreeId"
                    value={selectedMastersDegreeId}
                    onChange={(e) => handleMastersDegreeChange(e.target.value)}
                    disabled={isSubmitting}
                >
                    <option value="">Select your degree...</option>
                    {mastersDegrees.map((p) => (
                        <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                        </option>
                    ))}
                </Select>
            </FormField>

            {/* Specialization Selection (if applicable) */}
            {isLoadingSpecs && (
                <p className="text-xs text-carbon/50">Loading specializations...</p>
            )}

            {!isLoadingSpecs && specializations.length > 0 && (
                <FormField label="Specialization">
                    <Select
                        name="specializationId"
                        value={selectedSpecializationId}
                        onChange={(e) => {
                            setSelectedSpecializationId(e.target.value)
                            setIsConfirmed(false)
                        }}
                        disabled={isSubmitting}
                    >
                        <option value="">Select a specialization...</option>
                        {specializations.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </Select>
                </FormField>
            )}

            {/* Confirmation Section */}
            {hasValidSelection && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                        <svg
                            className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <p className="text-sm text-amber-800">
                            <strong>This selection is permanent.</strong> Once saved, you cannot change your master&apos;s degree or specialization.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            disabled={isSubmitting}
                            className="w-4 h-4 text-kth-blue rounded border-carbon/30 focus:ring-kth-blue"
                        />
                        <span className="text-sm text-carbon">
                            I understand and want to proceed
                        </span>
                    </label>
                </div>
            )}

            {/* Error Display */}
            {error && <Alert variant="error">{error}</Alert>}

            {/* Submit Button */}
            <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!hasValidSelection || !isConfirmed || isSubmitting}
                loading={isSubmitting}
            >
                Save Academic Selection
            </Button>
        </form>
    )
}

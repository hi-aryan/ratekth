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
        !isLoadingSpecs &&
        (!specializationRequired || selectedSpecializationId)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-carbon text-lg">Select Your Master&apos;s Degree</h3>
                <p className="text-carbon/60">
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
                    className="transition-all"
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
                    <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl space-y-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100/50 rounded-lg shrink-0">
                                <svg
                                    className="w-5 h-5 text-amber-700"
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
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm mb-1">Confirm Permanently</h4>
                                <p className="text-sm text-amber-800/80 leading-relaxed">
                                    This selection is <strong>permanent</strong>. Once saved, you cannot change your master&apos;s degree or specialization without contacting support.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                        disabled={isSubmitting}
                                        className="peer w-5 h-5 text-blue rounded border-carbon/30 focus:ring-blue transition-colors cursor-pointer"
                                    />
                                </div>
                                <span className="text-sm font-medium text-carbon group-hover:text-black transition-colors">
                                    I understand and want to save this selection
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="animate-in shake fade-in">
                    <Alert variant="error">{error}</Alert>
                </div>
            )}

            {/* Submit Button - Only visible when confirmed */}
            {hasValidSelection && isConfirmed && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 transition-all">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full font-bold shadow-lg shadow-blue/20 hover:shadow-blue/30 transition-all active:scale-[0.98]"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                    >
                        Save Academic Selection
                    </Button>
                </div>
            )}
        </form>
    )
}

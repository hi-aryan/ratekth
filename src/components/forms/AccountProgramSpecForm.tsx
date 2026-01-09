"use client"

import { useState, useTransition } from "react"
import { Specialization } from "@/lib/types"
import { updateBaseProgramSpecializationAction } from "@/actions/users"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { PermanentSelectionWarning } from "@/components/ui/PermanentSelectionWarning"

interface AccountProgramSpecFormProps {
    specializations: Specialization[]
    programName: string
}

/**
 * Form for selecting base-program specialization (year 3).
 * Similar flow to AccountMastersForm but simpler (no search needed).
 */
export const AccountProgramSpecForm = ({ 
    specializations, 
    programName 
}: AccountProgramSpecFormProps) => {
    const [selectedSpecId, setSelectedSpecId] = useState<string>("")
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, startSubmitting] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        const formData = new FormData(e.currentTarget)

        startSubmitting(async () => {
            const result = await updateBaseProgramSpecializationAction(null, formData)
            if (result?.error) {
                setError(result.error)
                setIsConfirmed(false)
            }
            // On success, action redirects - no need to handle here
        })
    }

    const hasValidSelection = selectedSpecId !== ""

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
                <h3 className="font-semibold text-carbon text-lg">Select Your Specialization</h3>
                <p className="text-carbon/60 text-sm">
                    Choose your year-3 specialization track for <strong>{programName}</strong>.
                </p>
            </div>

            <FormField label="Specialization">
                <Select
                    name="programSpecializationId"
                    value={selectedSpecId}
                    onChange={(e) => {
                        setSelectedSpecId(e.target.value)
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

            {/* Confirmation Section - Only visible when selection is valid */}
            {hasValidSelection && (
                <div className="animate-in zoom-in-95 fade-in duration-500 delay-100 ease-out">
                    <PermanentSelectionWarning
                        isConfirmed={isConfirmed}
                        onConfirmChange={setIsConfirmed}
                        disabled={isSubmitting}
                    >
                        This selection is <strong>permanent</strong>. Once saved, you cannot change your 
                        program specialization without contacting support.
                    </PermanentSelectionWarning>
                </div>
            )}

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
                        Save Specialization
                    </Button>
                </div>
            </div>
        </form>
    )
}

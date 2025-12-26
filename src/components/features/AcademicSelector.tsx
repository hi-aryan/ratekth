"use client"

import { useState, useTransition } from "react"
import { Program, Specialization } from "@/lib/types"
import { getSpecializationsAction } from "@/actions/academic"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"

/**
 * AcademicSelector Component
 * 
 * Reusable component for selecting academic enrollment path:
 * - Case 1: Base Program (Bachelor 180hp / Master 300hp)
 * - Case 2: Direct Master's Degree (120hp) + optional Specialization
 * 
 * Encapsulates all conditional logic and syncs values to hidden inputs for form submission.
 */

type EnrollmentType = "base" | "masters"

interface AcademicSelectorProps {
    basePrograms: Program[]
    mastersDegrees: Program[]
    fieldErrors?: {
        programId?: string[]
        mastersDegreeId?: string[]
        specializationId?: string[]
    }
}

export const AcademicSelector = ({
    basePrograms,
    mastersDegrees,
    fieldErrors,
}: AcademicSelectorProps) => {
    const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>("base")
    const [selectedProgramId, setSelectedProgramId] = useState<string>("")
    const [selectedMastersDegreeId, setSelectedMastersDegreeId] = useState<string>("")
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [isPending, startTransition] = useTransition()

    // Handle master's degree change: fetch specializations directly
    const handleMastersDegreeChange = (value: string) => {
        setSelectedMastersDegreeId(value)
        setSelectedSpecializationId("")

        if (value) {
            startTransition(async () => {
                const specs = await getSpecializationsAction(Number(value))
                setSpecializations(specs)
            })
        } else {
            setSpecializations([])
        }
    }

    // Reset selections when enrollment type changes
    const handleEnrollmentTypeChange = (type: EnrollmentType) => {
        setEnrollmentType(type)
        setSelectedProgramId("")
        setSelectedMastersDegreeId("")
        setSelectedSpecializationId("")
        setSpecializations([])
    }

    return (
        <div className="space-y-4">
            {/* Enrollment Type Toggle */}
            <FormField label="I am enrolling in a...">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => handleEnrollmentTypeChange("base")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${enrollmentType === "base"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        Base Program
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEnrollmentTypeChange("masters")}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${enrollmentType === "masters"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        Master's Degree
                    </button>
                </div>
            </FormField>

            {/* Case 1: Base Program Selection */}
            {enrollmentType === "base" && (
                <FormField
                    label="Your Base Program"
                    error={fieldErrors?.programId?.[0]}
                >
                    <Select
                        value={selectedProgramId}
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                    >
                        <option value="">Select your program...</option>
                        {basePrograms.map((p) => (
                            <option key={p.id} value={p.id}>
                                [{p.code}] {p.name} ({p.credits}hp)
                            </option>
                        ))}
                    </Select>
                </FormField>
            )}

            {/* Case 2: Master's Degree Selection */}
            {enrollmentType === "masters" && (
                <>
                    <FormField
                        label="Your Master's Degree"
                        error={fieldErrors?.mastersDegreeId?.[0]}
                    >
                        <Select
                            value={selectedMastersDegreeId}
                            onChange={(e) => handleMastersDegreeChange(e.target.value)}
                            disabled={isPending}
                        >
                            <option value="">Select your degree...</option>
                            {mastersDegrees.map((p) => (
                                <option key={p.id} value={p.id}>
                                    [{p.code}] {p.name}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    {/* Specialization (only if degree has specializations) */}
                    {specializations.length > 0 && (
                        <FormField
                            label="Specialization (optional)"
                            error={fieldErrors?.specializationId?.[0]}
                        >
                            <Select
                                value={selectedSpecializationId}
                                onChange={(e) => setSelectedSpecializationId(e.target.value)}
                                disabled={isPending}
                            >
                                <option value="">No specialization</option>
                                {specializations.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                    )}

                    {isPending && (
                        <p className="text-xs text-slate-400">Loading specializations...</p>
                    )}
                </>
            )}

            {/* Hidden inputs for form submission */}
            <input type="hidden" name="programId" value={enrollmentType === "base" ? selectedProgramId : ""} />
            <input type="hidden" name="mastersDegreeId" value={enrollmentType === "masters" ? selectedMastersDegreeId : ""} />
            <input type="hidden" name="specializationId" value={enrollmentType === "masters" ? selectedSpecializationId : ""} />
        </div>
    )
}

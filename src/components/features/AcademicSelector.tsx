"use client"

import { useState, useTransition } from "react"
import { Program, Specialization } from "@/lib/types"
import { getSpecializationsAction } from "@/actions/academic"
import { FormField } from "@/components/ui/FormField"
import { Select } from "@/components/ui/Select"
import { ToggleButton } from "@/components/ui/ToggleButton"
import { ProgramCombobox } from "@/components/forms/ProgramCombobox"

/**
 * AcademicSelector Component
 * 
 * Reusable component for selecting academic enrollment path:
 * - Case 1: Degree Programme (Bachelor 180hp / Master 300hp)
 * - Case 2: Direct Master's Degree (120hp only) + optional Specialization
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
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
    const [selectedMastersDegree, setSelectedMastersDegree] = useState<Program | null>(null)
    const [selectedSpecializationId, setSelectedSpecializationId] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [isPending, startTransition] = useTransition()

    // Handle master's degree selection: fetch specializations
    const handleMastersDegreeSelect = (program: Program) => {
        setSelectedMastersDegree(program)
        setSelectedSpecializationId("")

        startTransition(async () => {
            const specs = await getSpecializationsAction(program.id)
            setSpecializations(specs)
        })
    }

    // Handle master's degree clear
    const handleMastersDegreeClear = () => {
        setSelectedMastersDegree(null)
        setSelectedSpecializationId("")
        setSpecializations([])
    }

    // Reset selections when enrollment type changes
    const handleEnrollmentTypeChange = (type: EnrollmentType) => {
        setEnrollmentType(type)
        setSelectedProgram(null)
        setSelectedMastersDegree(null)
        setSelectedSpecializationId("")
        setSpecializations([])
    }

    return (
        <div className="space-y-4">
            {/* Enrollment Type Toggle */}
            <FormField label="I am enrolling in a...">
                {/* Toggle buttons */}
                <div className="flex gap-2">
                    <ToggleButton
                        isActive={enrollmentType === "base"}
                        onClick={() => handleEnrollmentTypeChange("base")}
                    >
                        Degree Programme
                    </ToggleButton>
                    <ToggleButton
                        isActive={enrollmentType === "masters"}
                        onClick={() => handleEnrollmentTypeChange("masters")}
                    >
                        Master&apos;s Degree
                    </ToggleButton>
                </div>
                {/* Clarification - collapses to 0 height when not selected */}
                <div className={`grid transition-all duration-300 ease-out ${
                    enrollmentType === "masters" 
                        ? "grid-rows-[1fr] opacity-100 mt-2" 
                        : "grid-rows-[0fr] opacity-0 mt-0"
                }`}>
                    <p className="overflow-hidden text-xs text-carbon/50 text-right">
                        Only for standalone master&apos;s (120hp)
                    </p>
                </div>
            </FormField>

            {/* Case 1: Base Program Selection */}
            {enrollmentType === "base" && (
                <FormField
                    label="Your Degree Programme"
                    error={fieldErrors?.programId?.[0]}
                >
                    <ProgramCombobox
                        programs={basePrograms}
                        selected={selectedProgram}
                        onSelect={setSelectedProgram}
                        onClear={() => setSelectedProgram(null)}
                    />
                </FormField>
            )}

            {/* Case 2: Master's Degree Selection */}
            {enrollmentType === "masters" && (
                <>
                    <FormField
                        label="Your Master's Degree"
                        error={fieldErrors?.mastersDegreeId?.[0]}
                    >
                        <ProgramCombobox
                            programs={mastersDegrees}
                            selected={selectedMastersDegree}
                            onSelect={handleMastersDegreeSelect}
                            onClear={handleMastersDegreeClear}
                            disabled={isPending}
                            showCredits={false}
                        />
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
                        <p className="text-xs text-carbon/50">Loading specializations...</p>
                    )}
                </>
            )}

            {/* Hidden inputs for form submission */}
            <input type="hidden" name="programId" value={enrollmentType === "base" && selectedProgram ? selectedProgram.id : ""} />
            <input type="hidden" name="mastersDegreeId" value={enrollmentType === "masters" && selectedMastersDegree ? selectedMastersDegree.id : ""} />
            <input type="hidden" name="specializationId" value={enrollmentType === "masters" ? selectedSpecializationId : ""} />
        </div>
    )
}

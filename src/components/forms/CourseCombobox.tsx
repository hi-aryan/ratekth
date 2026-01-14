"use client"

import { useMemo } from "react"
import { Combobox } from "@/components/ui/Combobox"
import type { CourseWithStats } from "@/lib/types"

/**
 * CourseCombobox: Course selection using client-side filtering.
 * Wrapper around generic Combobox with course-specific config.
 */

interface CourseComboboxProps {
    courses: CourseWithStats[]
    selected: CourseWithStats | null
    onSelect: (course: CourseWithStats) => void
    onClear?: () => void
    disabled?: boolean
    /** Course IDs that have already been reviewed (for optional styling) */
    reviewedCourseIds?: Set<number>
}

export const CourseCombobox = ({
    courses,
    selected,
    onSelect,
    onClear,
    disabled = false,
    reviewedCourseIds,
}: CourseComboboxProps) => {
    // Filter out already-reviewed courses from the main list
    const availableCourses = useMemo(() => {
        if (!reviewedCourseIds || reviewedCourseIds.size === 0) {
            return courses
        }
        return courses.filter(c => !reviewedCourseIds.has(c.id))
    }, [courses, reviewedCourseIds])

    return (
        <Combobox<CourseWithStats>
            items={availableCourses}
            getDisplayValue={(c) => `${c.code} ${c.name}`}
            getSearchValue={(c) => `${c.code} ${c.name}`}
            getKey={(c) => c.id}
            onSelect={onSelect}
            selected={selected}
            onClear={onClear}
            disabled={disabled}
            placeholder="Search or select a course..."
            emptyMessage="No courses found"
            renderItem={(course, isSelected, isHighlighted) => (
                <div
                    className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between ${
                        isHighlighted ? "bg-carbon/5" : "hover:translate-x-[3px]"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-carbon">{course.code}</span>
                        <span className="text-carbon/60">{course.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-carbon/40">
                            {course.reviewCount} {course.reviewCount === 1 ? "review" : "reviews"}
                        </span>
                        {isSelected && (
                            <span className="text-blue">✓</span>
                        )}
                    </div>
                </div>
            )}
        />
    )
}

"use client"

import { useMemo, useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Feather, Scale, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { submitReviewAction, updateReviewAction } from "@/actions/reviews"
import { reviewFormSchema, type ReviewFormInput } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { StarRatingInput } from "@/components/ui/StarRatingInput"
import { CourseCombobox } from "@/components/forms/CourseCombobox"
import { cn } from "@/lib/utils"
import { computeOverallRating } from "@/lib/utils"
import { MAX_TAGS_PER_REVIEW } from "@/lib/constants"
import type { CourseWithStats, Tag } from "@/lib/types"
import type { ReviewForEdit } from "@/services/reviews"

interface ReviewFormProps {
    courses: CourseWithStats[]
    tags: Tag[]
    defaultCourseId?: number
    initialData?: ReviewForEdit
    reviewedCourses?: Array<{ courseId: number; reviewId: number }>
}

type WorkloadLevel = "light" | "medium" | "heavy"

export const ReviewForm = ({ courses, tags, defaultCourseId, initialData, reviewedCourses }: ReviewFormProps) => {
    const router = useRouter()
    const isEditMode = !!initialData
    const [isPending, startTransition] = useTransition()
    const [existingReviewId, setExistingReviewId] = useState<number | null>(null)

    // Find initial selected course for combobox
    const initialCourse = useMemo(() => {
        const courseId = initialData?.courseId ?? defaultCourseId
        return courseId ? courses.find(c => c.id === courseId) ?? null : null
    }, [courses, initialData?.courseId, defaultCourseId])
    const [selectedCourse, setSelectedCourse] = useState<CourseWithStats | null>(initialCourse)

    const form = useForm<ReviewFormInput>({
        resolver: zodResolver(reviewFormSchema),
        defaultValues: {
            courseId: initialData?.courseId ?? defaultCourseId ?? 0,
            yearTaken: initialData?.yearTaken ?? new Date().getFullYear(),
            ratingProfessor: initialData?.ratingProfessor ?? 0,
            ratingMaterial: initialData?.ratingMaterial ?? 0,
            ratingPeers: initialData?.ratingPeers ?? 0,
            ratingWorkload: initialData?.ratingWorkload ?? undefined,
            content: initialData?.content ?? "",
            tagIds: initialData?.tagIds ?? []
        }
    })

    const reviewIdByCourseId = useMemo(() => {
        const map = new Map<number, number>()
        reviewedCourses?.forEach(({ courseId, reviewId }) => {
            map.set(courseId, reviewId)
        })
        return map
    }, [reviewedCourses])

    const handleCourseChange = (courseId: number) => {
        if (courseId > 0) {
            const reviewId = reviewIdByCourseId.get(courseId)
            if (reviewId) {
                router.push(`/review/${reviewId}/edit`)
            }
        }
    }

    const watchedRatings = form.watch(["ratingProfessor", "ratingMaterial", "ratingPeers"])
    const overallRating = watchedRatings.every(r => r > 0)
        ? computeOverallRating(watchedRatings[0], watchedRatings[1], watchedRatings[2])
        : null

    const selectedTags = form.watch("tagIds") ?? []

    const onSubmit = (data: ReviewFormInput) => {
        startTransition(async () => {
            const formData = new FormData()
            if (isEditMode) {
                formData.append("reviewId", String(initialData.id))
            }
            formData.append("courseId", String(data.courseId))
            formData.append("yearTaken", String(data.yearTaken))
            formData.append("ratingProfessor", String(data.ratingProfessor))
            formData.append("ratingMaterial", String(data.ratingMaterial))
            formData.append("ratingPeers", String(data.ratingPeers))
            formData.append("ratingWorkload", data.ratingWorkload)
            if (data.content) formData.append("content", data.content)
            data.tagIds?.forEach(id => formData.append("tagIds", String(id)))
            
            const action = isEditMode ? updateReviewAction : submitReviewAction
            const result = await action(null, formData)
            
            if (result?.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (errors?.[0]) {
                        form.setError(field as keyof ReviewFormInput, { message: errors[0] })
                    }
                })
            } else if (result?.error) {
                form.setError("root", { message: result.error })
                if (result.existingReviewId) {
                    setExistingReviewId(result.existingReviewId)
                }
            }
        })
    }

    const handleTagToggle = (tagId: number) => {
        const current = form.getValues("tagIds") ?? []
        if (current.includes(tagId)) {
            form.setValue("tagIds", current.filter(id => id !== tagId))
        } else if (current.length < MAX_TAGS_PER_REVIEW) {
            form.setValue("tagIds", [...current, tagId])
        }
    }

    const currentYear = new Date().getFullYear()

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Course Selection */}
            <FormField
                label="Course"
                error={form.formState.errors.courseId?.message}
            >
                {isEditMode ? (
                    <div className="px-4 py-2 bg-carbon/5 border border-carbon/20 rounded-lg text-sm text-carbon/60">
                        {initialData.courseCode} - {initialData.courseName}
                    </div>
                ) : (
                    <>
                        <Controller
                            name="courseId"
                            control={form.control}
                            render={({ field }) => (
                                <CourseCombobox
                                    courses={courses}
                                    selected={selectedCourse}
                                    onSelect={(course) => {
                                        setSelectedCourse(course)
                                        field.onChange(course.id)
                                    }}
                                    onClear={() => {
                                        setSelectedCourse(null)
                                        field.onChange(0)
                                    }}
                                    disabled={isPending}
                                    reviewedCourseIds={new Set(reviewIdByCourseId.keys())}
                                />
                            )}
                        />
                    </>
                )}
            </FormField>

            {/* Year Taken */}
            <FormField
                label="Year Taken"
                error={form.formState.errors.yearTaken?.message}
            >
                <Controller
                    name="yearTaken"
                    control={form.control}
                    render={({ field }) => (
                        <Select
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        >
                            {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </Select>
                    )}
                />
            </FormField>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    label="Professor"
                    error={form.formState.errors.ratingProfessor?.message}
                    className="items-center"
                >
                    <Controller
                        name="ratingProfessor"
                        control={form.control}
                        render={({ field }) => (
                            <StarRatingInput value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FormField>

                <FormField
                    label="Material"
                    error={form.formState.errors.ratingMaterial?.message}
                    className="items-center"
                >
                    <Controller
                        name="ratingMaterial"
                        control={form.control}
                        render={({ field }) => (
                            <StarRatingInput value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FormField>

                <FormField
                    label="Peers"
                    error={form.formState.errors.ratingPeers?.message}
                    className="items-center"
                >
                    <Controller
                        name="ratingPeers"
                        control={form.control}
                        render={({ field }) => (
                            <StarRatingInput value={field.value} onChange={field.onChange} />
                        )}
                    />
                </FormField>
            </div>

            {/* Real-time Overall Rating */}
            {overallRating !== null && (
                <div className="text-center py-2 bg-porcelain rounded-lg">
                    <span className="text-sm text-carbon/60">Overall Rating: </span>
                    <span className="text-lg font-bold text-carbon">{overallRating}</span>
                    <span className="text-sm text-carbon/60"> / 5</span>
                </div>
            )}

            {/* Workload */}
            <FormField
                label="Workload"
                error={form.formState.errors.ratingWorkload?.message}
            >
                <Controller
                    name="ratingWorkload"
                    control={form.control}
                    render={({ field }) => (
                        <div className="flex gap-2">
                            {([
                                { level: "light" as WorkloadLevel, Icon: Feather },
                                { level: "medium" as WorkloadLevel, Icon: Scale },
                                { level: "heavy" as WorkloadLevel, Icon: Dumbbell },
                            ]).map(({ level, Icon }) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => field.onChange(level)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-carbon/20 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 hover:border-carbon/40",
                                        field.value === level && "bg-carbon text-white border-carbon"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium capitalize">{level}</span>
                                </button>
                            ))}
                        </div>
                    )}
                />
            </FormField>

            {/* Tags */}
            <FormField
                label={`Tags (${selectedTags.length}/${MAX_TAGS_PER_REVIEW})`}
                error={form.formState.errors.tagIds?.message}
            >
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id)
                        const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS_PER_REVIEW
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                disabled={isDisabled}
                                className={cn(
                                    "px-3 py-1.5 border rounded-full text-sm transition-all duration-150",
                                    isDisabled && "opacity-50 cursor-not-allowed",
                                    !isDisabled && "hover:scale-105 active:scale-95",
                                    tag.sentiment === "positive"
                                        ? cn(
                                            "border-green/50 text-green/80",
                                            isSelected && "bg-green/20 border-green text-green"
                                        )
                                        : cn(
                                            "border-coral/50 text-coral/70",
                                            isSelected && "bg-coral/20 border-coral text-coral"
                                        )
                                )}
                            >
                                {tag.name}
                            </button>
                        )
                    })}
                </div>
            </FormField>

            {/* Content */}
            <FormField
                label="Your Review"
                error={form.formState.errors.content?.message}
            >
                <textarea
                    {...form.register("content")}
                    rows={4}
                    maxLength={2000}
                    placeholder="Share your thoughts..."
                    className="w-full px-4 py-3 bg-white border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 rounded-lg focus:outline-none focus:border-carbon text-sm resize-none"
                />
            </FormField>

            {/* Error Display */}
            {form.formState.errors.root && (
                <div className="space-y-3">
                    <Alert variant="error">{form.formState.errors.root.message}</Alert>
                    {existingReviewId && (
                        <Link href={`/review/${existingReviewId}/edit`} className="block">
                            <Button type="button" size="lg" className="w-full">
                                Edit Your Review
                            </Button>
                        </Link>
                    )}
                </div>
            )}

            {/* Submit */}
            <Button type="submit" size="lg" loading={isPending} className="w-full">
                {isEditMode ? "Update Review" : "Submit Review"}
            </Button>
        </form>
    )
}

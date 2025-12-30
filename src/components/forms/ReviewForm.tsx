"use client";

import { useState, useActionState, useMemo, useEffect } from "react";
import { Feather, Scale, Flame } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitReviewAction, updateReviewAction } from "@/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { StarRatingInput } from "@/components/ui/StarRatingInput";
import { cn } from "@/lib/utils";
import { computeOverallRating } from "@/lib/utils";
import { MAX_TAGS_PER_REVIEW } from "@/lib/constants";
import type { CourseWithStats, Tag } from "@/lib/types";
import type { ReviewForEdit } from "@/services/reviews";

interface ReviewFormProps {
    courses: CourseWithStats[];
    tags: Tag[];
    defaultCourseId?: number;
    initialData?: ReviewForEdit;
    reviewedCourses?: Array<{ courseId: number; reviewId: number }>;
}

export const ReviewForm = ({ courses, tags, defaultCourseId, initialData, reviewedCourses }: ReviewFormProps) => {
    const router = useRouter();
    const isEditMode = !!initialData;
    const [state, action, isPending] = useActionState(
        isEditMode ? updateReviewAction : submitReviewAction,
        null
    );

    // Memoized map for quick lookup: courseId -> reviewId
    const reviewIdByCourseId = useMemo(() => {
        const map = new Map<number, number>();
        reviewedCourses?.forEach(({ courseId, reviewId }) => {
            map.set(courseId, reviewId);
        });
        return map;
    }, [reviewedCourses]);

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseId = parseInt(e.target.value, 10);
        if (!isNaN(selectedCourseId) && selectedCourseId > 0) {
            const reviewId = reviewIdByCourseId.get(selectedCourseId);
            if (reviewId) {
                router.push(`/review/${reviewId}/edit`);
            }
        }
    };

    // Controlled state for ratings (for real-time overall display)
    const [ratingProfessor, setRatingProfessor] = useState(initialData?.ratingProfessor ?? 0);
    const [ratingMaterial, setRatingMaterial] = useState(initialData?.ratingMaterial ?? 0);
    const [ratingPeers, setRatingPeers] = useState(initialData?.ratingPeers ?? 0);

    // Tag selection state (max 3)
    const [selectedTags, setSelectedTags] = useState<number[]>(initialData?.tagIds ?? []);

    // Fix: React 19 form actions desync controlled input DOM state. See notes/react19-form-bug.md
    const [formKey, setFormKey] = useState(0);
    useEffect(() => {
        if (state !== null) setFormKey(k => k + 1);
    }, [state]);

    const overallRating =
        ratingProfessor > 0 && ratingMaterial > 0 && ratingPeers > 0
            ? computeOverallRating(ratingProfessor, ratingMaterial, ratingPeers)
            : null;

    const handleTagToggle = (tagId: number) => {
        setSelectedTags((prev) => {
            if (prev.includes(tagId)) {
                return prev.filter((id) => id !== tagId);
            }
            if (prev.length >= MAX_TAGS_PER_REVIEW) {
                return prev;
            }
            return [...prev, tagId];
        });
    };

    const currentYear = new Date().getFullYear();

    return (
        <form action={action} className="space-y-6">
            {/* Hidden fields for edit mode */}
            {isEditMode && (
                <>
                    <input type="hidden" name="reviewId" value={initialData.id} />
                    <input type="hidden" name="courseId" value={initialData.courseId} />
                </>
            )}

            {/* Course Selection */}
            <FormField
                label="Course"
                error={state?.fieldErrors?.courseId?.[0]}
            >
                {isEditMode ? (
                    <div className="px-4 py-2 bg-carbon/5 border border-carbon/20 rounded-lg text-sm text-carbon/60">
                        {initialData.courseCode} - {initialData.courseName}
                    </div>
                ) : (
                    <Select
                        name="courseId"
                        defaultValue={defaultCourseId ?? ""}
                        onChange={handleCourseChange}
                        required
                    >
                        <option value="">Select a course...</option>
                        {courses.filter(c => !reviewIdByCourseId.has(c.id)).map(course => (
                            <option key={course.id} value={course.id}>
                                {course.code} - {course.name}
                            </option>
                        ))}
                        {reviewIdByCourseId.size > 0 && (
                            <optgroup label="Already Reviewed">
                                {courses.filter(c => reviewIdByCourseId.has(c.id)).map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                    </option>
                                ))}
                            </optgroup>
                        )}
                    </Select>
                )}
            </FormField>

            {/* Year Taken */}
            <FormField
                label="Year Taken"
                error={state?.fieldErrors?.yearTaken?.[0]}
            >
                <Select name="yearTaken" defaultValue={initialData?.yearTaken ?? currentYear} required>
                    {Array.from({ length: 10 }, (_, i) => currentYear - i).map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </Select>
            </FormField>

            {/* Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    label="Professor"
                    error={state?.fieldErrors?.ratingProfessor?.[0]}
                    className="items-center"
                >
                    <StarRatingInput
                        name="ratingProfessor"
                        value={ratingProfessor}
                        onChange={setRatingProfessor}
                    />
                </FormField>

                <FormField
                    label="Material"
                    error={state?.fieldErrors?.ratingMaterial?.[0]}
                    className="items-center"
                >
                    <StarRatingInput
                        name="ratingMaterial"
                        value={ratingMaterial}
                        onChange={setRatingMaterial}
                    />
                </FormField>

                <FormField
                    label="Peers"
                    error={state?.fieldErrors?.ratingPeers?.[0]}
                    className="items-center"
                >
                    <StarRatingInput
                        name="ratingPeers"
                        value={ratingPeers}
                        onChange={setRatingPeers}
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
                error={state?.fieldErrors?.ratingWorkload?.[0]}
            >
                <div className="flex gap-2">
                    {([
                        { level: "light", Icon: Feather },
                        { level: "medium", Icon: Scale },
                        { level: "heavy", Icon: Flame },
                    ] as const).map(({ level, Icon }) => (
                        <label
                            key={level}
                            className="flex-1 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="ratingWorkload"
                                value={level}
                                defaultChecked={initialData?.ratingWorkload === level}
                                className="sr-only peer"
                            />
                            <div className="flex items-center justify-center gap-2 py-2 px-4 border border-carbon/20 rounded-lg transition-all duration-150 peer-checked:bg-carbon peer-checked:text-white peer-checked:border-carbon hover:scale-105 active:scale-95 hover:border-carbon/40">
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium capitalize">{level}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </FormField>

            {/* Tags - key={formKey} fixes React 19 form action bug (see comment above) */}
            <FormField
                key={formKey}
                label={`Tags (${selectedTags.length}/${MAX_TAGS_PER_REVIEW})`}
                error={state?.fieldErrors?.tagIds?.[0]}
            >
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        const isDisabled = !isSelected && selectedTags.length >= MAX_TAGS_PER_REVIEW;
                        return (
                            <label
                                key={tag.id}
                                className={cn(
                                    "cursor-pointer",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                <input
                                    type="checkbox"
                                    name="tagIds"
                                    value={tag.id}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => handleTagToggle(tag.id)}
                                    className="sr-only peer"
                                />
                                <div
                                    className={cn(
                                        "px-3 py-1.5 border rounded-full text-sm transition-all duration-150",
                                        tag.sentiment === "positive"
                                            ? "border-green/50 text-green/80 peer-checked:bg-green/20 peer-checked:border-green peer-checked:text-green"
                                            : "border-coral/50 text-coral/70 peer-checked:bg-coral/20 peer-checked:border-coral peer-checked:text-coral",
                                        !isDisabled && "hover:scale-105 active:scale-95"
                                    )}
                                >
                                    {tag.name}
                                </div>
                            </label>
                        );
                    })}
                </div>
            </FormField>

            {/* Content */}
            <FormField
                label="Your Review (optional)"
                error={state?.fieldErrors?.content?.[0]}
            >
                <textarea
                    name="content"
                    rows={4}
                    maxLength={2000}
                    defaultValue={initialData?.content ?? ""}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-3 bg-white border border-carbon/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-carbon/10 focus:border-carbon transition-all text-sm resize-none"
                />
            </FormField>

            {/* Error Display */}
            {state?.error && !state.fieldErrors && (
                <div className="space-y-3">
                    <Alert variant="error">{state.error}</Alert>
                    {state.existingReviewId && (
                        <Link href={`/review/${state.existingReviewId}/edit`} className="block">
                            <Button type="button" className="w-full">
                                Edit Your Review
                            </Button>
                        </Link>
                    )}
                </div>
            )}

            {/* Submit */}
            <Button type="submit" loading={isPending} className="w-full">
                {isEditMode ? "Update Review" : "Submit Review"}
            </Button>
        </form>
    );
};

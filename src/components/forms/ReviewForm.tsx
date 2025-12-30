"use client";

import { useState, useActionState } from "react";
import { submitReviewAction } from "@/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { StarRatingInput } from "@/components/ui/StarRatingInput";
import { cn } from "@/lib/utils";
import { computeOverallRating } from "@/lib/utils";
import { MAX_TAGS_PER_REVIEW } from "@/lib/constants";
import type { CourseWithStats, Tag } from "@/lib/types";

interface ReviewFormProps {
    courses: CourseWithStats[];
    tags: Tag[];
    defaultCourseId?: number;
}

export const ReviewForm = ({ courses, tags, defaultCourseId }: ReviewFormProps) => {
    const [state, action, isPending] = useActionState(submitReviewAction, null);

    // Controlled state for ratings (for real-time overall display)
    const [ratingProfessor, setRatingProfessor] = useState(0);
    const [ratingMaterial, setRatingMaterial] = useState(0);
    const [ratingPeers, setRatingPeers] = useState(0);

    // Tag selection state (max 3)
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

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
                return prev; // Don't add if at limit
            }
            return [...prev, tagId];
        });
    };

    const currentYear = new Date().getFullYear();

    return (
        <form action={action} className="space-y-6">
            {/* Course Selection */}
            <FormField
                label="Course"
                error={state?.fieldErrors?.courseId?.[0]}
            >
                <Select
                    name="courseId"
                    defaultValue={defaultCourseId ?? ""}
                    required
                >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </Select>
            </FormField>

            {/* Year Taken */}
            <FormField
                label="Year Taken"
                error={state?.fieldErrors?.yearTaken?.[0]}
            >
                <Select name="yearTaken" defaultValue={currentYear} required>
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
                    {(["light", "medium", "heavy"] as const).map((level) => (
                        <label
                            key={level}
                            className="flex-1 cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="ratingWorkload"
                                value={level}
                                className="sr-only peer"
                            />
                            <div className="text-center py-2 px-4 border border-carbon/20 rounded-lg transition-all peer-checked:bg-carbon peer-checked:text-white peer-checked:border-carbon hover:border-carbon/40">
                                <span className="text-sm font-medium capitalize">{level}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </FormField>

            {/* Tags */}
            <FormField
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
                    placeholder="Share your experience..."
                    className="w-full px-4 py-3 bg-white border border-carbon/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-carbon/10 focus:border-carbon transition-all text-sm resize-none"
                />
            </FormField>

            {/* Error Display */}
            {state?.error && !state.fieldErrors && (
                <Alert variant="error">{state.error}</Alert>
            )}

            {/* Submit */}
            <Button type="submit" loading={isPending} className="w-full">
                Submit Review
            </Button>
        </form>
    );
};

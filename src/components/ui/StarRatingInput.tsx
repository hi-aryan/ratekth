"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATING_MAX } from "@/lib/constants";

interface StarRatingInputProps {
    name: string;
    value: number;
    onChange: (value: number) => void;
    max?: number;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

/**
 * StarRatingInput: Interactive star rating for forms.
 * Renders a hidden input with the selected value for form submission.
 */
export const StarRatingInput = ({
    name,
    value,
    onChange,
    max = RATING_MAX,
    size = "md",
    className,
}: StarRatingInputProps) => {
    return (
        <div className="inline-flex items-center gap-1">
            <input type="hidden" name={name} value={value} />
            {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
                const isFilled = star <= value;
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="p-0.5 transition-transform hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20 rounded-sm"
                        aria-label={`Rate ${star} out of ${max}`}
                    >
                        <Star
                            className={cn(
                                sizeStyles[size],
                                isFilled
                                    ? "fill-current text-carbon"
                                    : "text-carbon/30 hover:text-carbon/50",
                                className
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};

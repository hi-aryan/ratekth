import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { RATING_MAX } from "@/lib/constants"

interface StarRatingProps {
    value: number
    max?: number
    size?: 'xs' | 'sm' | 'md' | 'lg'
    className?: string
}

const sizeStyles = {
    xs: "w-2.5 h-2.5",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
}

/**
 * StarRating: Display-only star rating using Lucide icons.
 * Filled stars use currentColor fill, empty use stroke only.
 */
export const StarRating = ({ value, max = RATING_MAX, size = 'md', className }: StarRatingProps) => {
    const stars = []

    for (let i = 1; i <= max; i++) {
        const isFilled = i <= value
        stars.push(
            <Star
                key={i}
                className={cn(
                    sizeStyles[size],
                    isFilled ? "fill-current text-carbon" : "text-carbon opacity-30",
                    className
                )}
            />
        )
    }

    return (
        <div className="inline-flex items-center gap-0.5">
            {stars}
        </div>
    )
}

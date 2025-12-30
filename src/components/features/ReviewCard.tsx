import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import type { ReviewForDisplay } from "@/lib/types"
import { Calendar, GraduationCap, User } from "lucide-react"

interface ReviewCardProps {
    review: ReviewForDisplay
}

/**
 * Workload label mapping for display.
 */
const workloadLabels: Record<ReviewForDisplay['ratingWorkload'], string> = {
    light: 'Light',
    medium: 'Medium',
    heavy: 'Heavy',
}

/**
 * Format date for display.
 */
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

/**
 * ReviewCard: Displays a single review with ratings, course info, author, and tags.
 * Server component — receives data from parent, no client-side interactivity.
 */
export const ReviewCard = ({ review }: ReviewCardProps) => {
    return (
        <Card className="p-6">
            {/* Header: Course info */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-carbon">
                        {review.course.code}
                    </h3>
                    <p className="text-sm text-carbon/60">
                        {review.course.name}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <StarRating value={Math.round(review.overallRating)} size="md" />
                </div>
            </div>

            {/* Ratings breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-carbon/5 rounded-lg">
                <div className="text-center">
                    <p className="text-xs text-carbon/50 mb-1">Professor</p>
                    <StarRating value={review.ratingProfessor} size="sm" />
                </div>
                <div className="text-center">
                    <p className="text-xs text-carbon/50 mb-1">Material</p>
                    <StarRating value={review.ratingMaterial} size="sm" />
                </div>
                <div className="text-center">
                    <p className="text-xs text-carbon/50 mb-1">Peers</p>
                    <StarRating value={review.ratingPeers} size="sm" />
                </div>
            </div>

            {/* Content */}
            {review.content && (
                <p className="text-sm text-carbon/80 mb-4 leading-relaxed">
                    {review.content}
                </p>
            )}

            {/* Tags and Workload */}
            <div className="flex flex-wrap gap-2 mb-4"> {/* TODO: add justify-center ?? */}
                <Badge variant="neutral">
                    {workloadLabels[review.ratingWorkload]} Workload
                </Badge>
                {review.tags.map(tag => (
                    <Badge
                        key={tag.id}
                        variant={tag.sentiment === 'positive' ? 'positive' : 'negative'}
                    >
                        {tag.name}
                    </Badge>
                ))}
            </div>

            {/* Footer: Metadata */}
            <div className="flex items-center gap-4 text-xs text-carbon/50 pt-4 border-t border-carbon/10">
                <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>{review.author.username ?? 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Taken {review.yearTaken}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(review.datePosted)}</span>
                </div>
            </div>
        </Card>
    )
}

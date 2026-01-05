import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import type { ReviewForDisplay } from "@/lib/types"
import { Calendar, GraduationCap, User, Feather, Scale, Dumbbell } from "lucide-react"

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
 * Workload icon mapping for display.
 */
const workloadIcons: Record<ReviewForDisplay['ratingWorkload'], React.ElementType> = {
    light: Feather,
    medium: Scale,
    heavy: Dumbbell,
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
 * Entire card is clickable, navigating to the review detail page.
 */
export const ReviewCard = ({ review }: ReviewCardProps) => {
    return (
        <Link href={`/review/${review.id}`} className="block group">
            <Card className="p-6 group-hover:translate-x-[4px] transition-transform duration-200 ease-in-out">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold text-carbon">
                        {review.course.code}
                        <span className="font-normal text-carbon/60"> — {review.course.name}</span>
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <StarRating value={Math.round(review.overallRating)} size="md" />
                    </div>
                </div>

                {/* Ratings breakdown with workload */}
                <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-carbon/[0.02] rounded-lg text-xs text-carbon/40">
                    <div className="text-center">
                        <p className="mb-1">Professor</p>
                        <StarRating value={review.ratingProfessor} size="xs" />
                    </div>
                    <div className="text-center">
                        <p className="mb-1">Material</p>
                        <StarRating value={review.ratingMaterial} size="xs" />
                    </div>
                    <div className="text-center">
                        <p className="mb-1">Peers</p>
                        <StarRating value={review.ratingPeers} size="xs" />
                    </div>
                    <div className="text-center">
                        <p className="mb-1">Workload</p>
                        {(() => {
                            const WorkloadIcon = workloadIcons[review.ratingWorkload]
                            return (
                                <span className="inline-flex items-center gap-1">
                                    <WorkloadIcon className="w-3 h-3 text-carbon opacity-80" />
                                    <span className="text-carbon/80 font-semibold">{workloadLabels[review.ratingWorkload]}</span>
                                </span>
                            )
                        })()}
                    </div>
                </div>

                {/* Content */}
                {review.content && (
                    <p className="text-sm text-carbon/80 mb-4 leading-relaxed">
                        {review.content}
                    </p>
                )}

                {/* Tags (workload moved to ratings section) */}
                {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {review.tags.map(tag => (
                            <Badge
                                key={tag.id}
                                variant={tag.sentiment === 'positive' ? 'positive' : 'negative'}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Footer: Metadata */}
                <div className="flex items-center gap-4 text-xs text-carbon/50 pt-4 border-t border-carbon/10">
                    <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-carbon opacity-50" />
                        <span>{review.author.username ?? 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-carbon opacity-50" />
                        <span>Taken {review.yearTaken}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-carbon opacity-50" />
                        <span>{formatDate(review.datePosted)}</span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

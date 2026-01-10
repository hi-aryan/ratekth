import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import { RatingsBreakdown } from "@/components/ui/RatingsBreakdown"
import { DeleteReviewButton } from "@/components/ui/DeleteReviewButton"
import { formatReviewDate } from "@/lib/reviewHelpers"
import type { ReviewForDisplay } from "@/lib/types"
import { Calendar, GraduationCap, User, Pencil } from "lucide-react"

interface ReviewCardProps {
    review: ReviewForDisplay
    variant?: 'feed' | 'detail'
    /** Show edit/delete buttons (only for detail variant) */
    showOwnerActions?: boolean
    /** Is current user the review owner (only for detail variant) */
    isOwner?: boolean
}

/**
 * ReviewCard: Displays a single review with ratings, course info, author, and tags.
 * 
 * Variants:
 * - feed (default): Compact, clickable card for the feed list
 * - detail: Expanded view for the review detail page (not clickable)
 */
export const ReviewCard = ({ 
    review, 
    variant = 'feed',
    showOwnerActions = false,
    isOwner = false,
}: ReviewCardProps) => {
    const isFeed = variant === 'feed'

    // Sizing based on variant
    const titleClass = isFeed ? 'text-lg' : 'text-2xl'
    const overallStarSize = isFeed ? 'md' : 'lg'
    const metadataTextClass = isFeed ? 'text-xs' : 'text-sm'
    const metadataIconClass = isFeed ? 'w-3.5 h-3.5' : 'w-4 h-4'
    const contentClass = isFeed ? 'text-sm' : 'text-base'
    const sectionMargin = isFeed ? 'mb-4' : 'mb-6'

    const cardContent = (
        <Card className={`p-6 ${isFeed ? 'group-hover:translate-x-[4px] transition-transform duration-200 ease-in-out' : ''}`}>
            {/* Header: Course info and overall rating */}
            <div className={`flex items-start justify-between gap-4 ${sectionMargin}`}>
                <h3 className={`${titleClass} font-bold text-carbon`}>
                    {review.course.code}
                    <span className="font-normal text-carbon/60 block sm:inline sm:ml-2">
                        {review.course.name}
                    </span>
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                    <StarRating value={Math.round(review.overallRating)} size={overallStarSize} />
                </div>
            </div>

            {/* Ratings breakdown */}
            <div className={sectionMargin}>
                <RatingsBreakdown
                    ratingProfessor={review.ratingProfessor}
                    ratingMaterial={review.ratingMaterial}
                    ratingPeers={review.ratingPeers}
                    ratingWorkload={review.ratingWorkload}
                    variant={isFeed ? 'compact' : 'full'}
                />
            </div>

            {/* Content */}
            {review.content && (
                <p className={`${contentClass} text-carbon/80 ${sectionMargin} leading-relaxed ${isFeed ? '' : 'whitespace-pre-wrap'}`}>
                    {review.content}
                </p>
            )}

            {/* Tags */}
            {review.tags.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${sectionMargin}`}>
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

            {/* Metadata */}
            <div className={`flex items-center gap-4 ${metadataTextClass} text-carbon/50 pt-4 border-t border-carbon/10`}>
                <div className="flex items-center gap-1">
                    <User className={`${metadataIconClass} text-carbon opacity-50`} />
                    <span>{review.author.username ?? 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <GraduationCap className={`${metadataIconClass} text-carbon opacity-50`} />
                    <span>Taken {review.yearTaken}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className={`${metadataIconClass} text-carbon opacity-50`} />
                    <span>{formatReviewDate(review.datePosted)}</span>
                </div>
            </div>

            {/* Owner Actions (detail variant only) */}
            {showOwnerActions && isOwner && (
                <div className="flex items-center justify-end gap-1 pt-6 mt-6 border-t border-carbon/10">
                    <Link
                        href={`/review/${review.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors text-carbon opacity-80 hover:opacity-100 hover:bg-carbon/5"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Link>
                    <DeleteReviewButton reviewId={review.id} />
                </div>
            )}
        </Card>
    )

    // Feed variant: wrap in clickable Link
    if (isFeed) {
        return (
            <Link href={`/review/${review.id}`} className="block group">
                {cardContent}
            </Link>
        )
    }

    // Detail variant: static card
    return cardContent
}

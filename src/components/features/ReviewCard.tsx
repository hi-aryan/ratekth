import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import { RatingsBreakdown } from "@/components/ui/RatingsBreakdown"
import { DeleteReviewButton } from "@/components/ui/DeleteReviewButton"
import { formatReviewDate } from "@/lib/reviewHelpers"
import { truncateText } from "@/lib/utils"
import { FEED_CONTENT_PREVIEW_LENGTH } from "@/lib/constants"
import type { ReviewForDisplay } from "@/lib/types"
import { Calendar, ChevronRight, GraduationCap, User, Pencil } from "lucide-react"

interface ReviewCardProps {
    review: ReviewForDisplay
    variant?: 'feed' | 'detail'
    /** Show edit/delete buttons (only for detail variant) */
    showOwnerActions?: boolean
    /** Is current user the review owner (only for detail variant) */
    isOwner?: boolean
    /** Show course link row above card (feed variant only). Default true. Set false on course page. */
    showCourseLink?: boolean
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
    showCourseLink = true,
}: ReviewCardProps) => {
    const isFeed = variant === 'feed'

    // Sizing based on variant
    const titleClass = isFeed ? 'text-lg' : 'text-2xl'
    const overallStarSize = isFeed ? 'md' : 'lg'
    const metadataTextClass = isFeed ? 'text-xs' : 'text-sm'
    const metadataIconClass = isFeed ? 'w-3.5 h-3.5' : 'w-4 h-4'
    const contentClass = isFeed ? 'text-sm' : 'text-base'
    const sectionMargin = isFeed ? 'mb-4' : 'mb-6'

    const courseCode = review.course.code

    const renderHeaderInCard = (linkToCourse: boolean) => (
        <div className={`flex items-start justify-between gap-4 ${sectionMargin}`}>
            <h3 className={`${titleClass} font-bold text-carbon`}>
                {linkToCourse ? (
                    <Link href={`/course/${courseCode}`} className="inline-block text-carbon hover:-translate-y-[1px] transition-transform duration-150">
                        {courseCode}
                        <span className="font-normal text-carbon/60 block sm:inline sm:ml-2">{review.course.name}</span>
                    </Link>
                ) : (
                    <>
                        {courseCode}
                        <span className="font-normal text-carbon/60 block sm:inline sm:ml-2">{review.course.name}</span>
                    </>
                )}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
                <StarRating value={Math.round(review.overallRating)} size={overallStarSize} />
            </div>
        </div>
    )

    const renderBodyContent = () => (
        <>
            <div className={sectionMargin}>
                <RatingsBreakdown
                    ratingProfessor={review.ratingProfessor}
                    ratingMaterial={review.ratingMaterial}
                    ratingPeers={review.ratingPeers}
                    ratingWorkload={review.ratingWorkload}
                    variant={isFeed ? 'compact' : 'full'}
                />
            </div>
            {review.content && (
                <p className={`${contentClass} text-carbon/80 ${sectionMargin} leading-relaxed ${isFeed ? '' : 'whitespace-pre-wrap'}`}>
                    {isFeed ? truncateText(review.content, FEED_CONTENT_PREVIEW_LENGTH) : review.content}
                </p>
            )}
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
        </>
    )

    // Feed variant: compound card (header + body in shared container) when showCourseLink
    if (isFeed && showCourseLink) {
        return (
            <div className="bg-white rounded-lg shadow-[0_0_4px_rgba(0,0,0,0.15)] overflow-hidden">
                <Link
                    href={`/course/${courseCode}`}
                    className="block border-b border-carbon/10 group"
                >
                    <div className="flex items-center gap-3 px-8 pt-6 pb-4 group-hover:translate-x-[4px] transition-transform duration-200 ease-in-out">
                        <h3 className={`${titleClass} font-bold text-carbon min-w-0 flex-1`}>
                            {courseCode}
                            <span className="font-normal text-carbon/60 block sm:inline sm:ml-2">
                                {review.course.name}
                            </span>
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <StarRating value={Math.round(review.overallRating)} size={overallStarSize} />
                            <ChevronRight className="w-4 h-4 text-carbon/25" />
                        </div>
                    </div>
                </Link>
                <Link href={`/review/${review.id}`} className="block group">
                    <div className="px-8 pt-4 pb-8 group-hover:translate-x-[4px] transition-transform duration-200 ease-in-out">
                        {renderBodyContent()}
                    </div>
                </Link>
            </div>
        )
    }

    // Feed variant: single Card (course page, showCourseLink=false)
    if (isFeed && !showCourseLink) {
        return (
            <Link href={`/review/${review.id}`} className="block group">
                <Card className="group-hover:translate-x-[4px] transition-transform duration-200 ease-in-out">
                    {renderHeaderInCard(false)}
                    {renderBodyContent()}
                </Card>
            </Link>
        )
    }

    // Detail variant: static Card with owner actions
    return (
        <Card>
            {renderHeaderInCard(true)}
            {renderBodyContent()}
            {showOwnerActions && isOwner && (
                <div className="flex items-center justify-end gap-1 pt-6 mt-6 border-t border-carbon/10">
                    <Link
                        href={`/review/${review.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-all text-carbon/70 hover:bg-carbon/5 hover:text-carbon hover:translate-y-[-1px] active:scale-[0.95]"
                    >
                        <Pencil className="w-4 h-4" />
                        Edit
                    </Link>
                    <DeleteReviewButton reviewId={review.id} />
                </div>
            )}
        </Card>
    )
}

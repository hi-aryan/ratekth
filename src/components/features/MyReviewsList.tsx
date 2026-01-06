import Link from "next/link";
import { StarRating } from "@/components/ui/StarRating";
import type { ReviewListItem } from "@/services/reviews";
import { BookOpen, ChevronRight } from "lucide-react";

interface MyReviewsListProps {
    reviews: ReviewListItem[];
}

/**
 * MyReviewsList: Displays user's reviews as a compact, clickable list.
 * Server component - receives reviews from page.
 */
export const MyReviewsList = ({ reviews }: MyReviewsListProps) => {
    if (reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <BookOpen className="w-10 h-10 mx-auto mb-3 text-carbon/20" />
                <p className="text-carbon/50 text-sm">
                    You haven&apos;t written any reviews yet.
                </p>
                <Link
                    href="/"
                    className="inline-block mt-3 text-sm font-semibold text-blue hover:text-blue/80 transition-colors"
                >
                    Explore courses to review
                </Link>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-carbon/5">
            {reviews.map((review) => (
                <li key={review.id}>
                    <Link
                        href={`/review/${review.id}`}
                        className="group flex items-center gap-4 py-3.5 px-4 -mx-4 rounded-lg transition-all hover:bg-carbon/[0.03] active:scale-[0.995]"
                    >
                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-black text-blue bg-blue/10 py-0.5 px-2 rounded-md">
                                    {review.course.code}
                                </span>
                                <span className="text-sm font-medium text-carbon truncate">
                                    {review.course.name}
                                </span>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 shrink-0">
                            <StarRating value={Math.round(review.overallRating)} size="sm" />
                            <ChevronRight className="w-4 h-4 text-carbon/30 group-hover:text-carbon/50 transition-colors" />
                        </div>
                    </Link>
                </li>
            ))}
        </ul>
    );
};

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";
import { getReviewById } from "@/services/reviews";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { DeleteReviewButton } from "@/components/ui/DeleteReviewButton";
import { BackLink } from "@/components/ui/BackLink";
import { Calendar, GraduationCap, User, Feather, Scale, Dumbbell, Pencil } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * Workload label mapping for display.
 */
const workloadLabels: Record<'light' | 'medium' | 'heavy', string> = {
    light: 'Light',
    medium: 'Medium',
    heavy: 'Heavy',
};

/**
 * Workload icon mapping for display.
 */
const workloadIcons: Record<'light' | 'medium' | 'heavy', React.ElementType> = {
    light: Feather,
    medium: Scale,
    heavy: Dumbbell,
};

/**
 * Format date for display.
 */
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

export default async function ReviewDetailPage({ params }: PageProps) {
    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId) || reviewId <= 0) {
        redirect("/?error=review-not-found");
    }

    const review = await getReviewById(reviewId);

    if (!review) {
        redirect("/?error=review-not-found");
    }

    const session = await auth();
    const isOwner = session?.user?.id === review.authorId;
    const WorkloadIcon = workloadIcons[review.ratingWorkload];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Back link */}
            <BackLink href="/" className="mb-6" />

            <Card className="p-6">
                {/* Header: Course info and overall rating */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-carbon">
                            {review.course.code}
                        </h1>
                        <p className="text-carbon/60">
                            {review.course.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <StarRating value={Math.round(review.overallRating)} size="lg" />
                    </div>
                </div>

                {/* Ratings breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-carbon/[0.02] rounded-lg">
                    <div className="text-center">
                        <p className="text-xs text-carbon/50 mb-1.5">Professor</p>
                        <StarRating value={review.ratingProfessor} size="sm" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-carbon/50 mb-1.5">Material</p>
                        <StarRating value={review.ratingMaterial} size="sm" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-carbon/50 mb-1.5">Peers</p>
                        <StarRating value={review.ratingPeers} size="sm" />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-carbon/50 mb-1.5">Workload</p>
                        <span className="inline-flex items-center gap-1">
                            <WorkloadIcon className="w-4 h-4 text-carbon" />
                            <span className="text-sm font-medium text-carbon">{workloadLabels[review.ratingWorkload]}</span>
                        </span>
                    </div>
                </div>

                {/* Content */}
                {review.content && (
                    <div className="mb-6">
                        <p className="text-carbon/80 leading-relaxed whitespace-pre-wrap">
                            {review.content}
                        </p>
                    </div>
                )}

                {/* Tags */}
                {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
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
                <div className="flex items-center gap-4 text-sm text-carbon opacity-50 pt-4 border-t border-carbon/10">
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{review.author.username ?? 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        <span>Taken {review.yearTaken}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(review.datePosted)}</span>
                    </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                    <div className="flex items-center justify-end gap-1 pt-6 mt-6 border-t border-carbon/10">
                        <Link
                            href={`/review/${review.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-carbon opacity-80 hover:opacity-100 hover:bg-carbon/5"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit
                        </Link>
                        <DeleteReviewButton reviewId={review.id} />
                    </div>
                )}
            </Card>
        </div>
    );
}

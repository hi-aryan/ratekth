import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";
import { getCourseByCode } from "@/services/courses";
import { getReviewsForCourse, getUserReviewForCourse } from "@/services/reviews";
import { ReviewCard } from "@/components/features/ReviewCard";
import { Sidebar } from "@/components/features/Sidebar";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/ui/BackLink";
import { StarRating } from "@/components/ui/StarRating";
import { MessageSquare, Users } from "lucide-react";

interface PageProps {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function CourseFeedPage({ params, searchParams }: PageProps) {
    const { code } = await params;
    const { page } = await searchParams;

    // Validate and fetch course
    const course = await getCourseByCode(code.toUpperCase());

    if (!course) {
        redirect("/?error=course-not-found");
    }

    // Parse page number
    const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

    // Fetch paginated reviews for this course
    const reviewsResult = await getReviewsForCourse(course.id, { page: currentPage });

    // Get session for conditional actions
    const session = await auth();

    // Check if authenticated user has already reviewed this course
    let userReviewId: number | null = null;
    if (session?.user?.id) {
        const existingReview = await getUserReviewForCourse(session.user.id, course.id);
        userReviewId = existingReview?.id ?? null;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            {/* Back link */}
            <BackLink href="/" className="mb-6" />

            <div className="flex gap-6">
                {/* Feed Column */}
                <div className="flex-1 min-w-0">
                    {reviewsResult.items.length > 0 ? (
                        <div className="space-y-4">
                            {/* Reviews */}
                            {reviewsResult.items.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                hasMore={reviewsResult.hasMore}
                                basePath={`/course/${code}`}
                            />
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-carbon opacity-20" />
                            <p className="text-carbon/60 mb-4">
                                No reviews for this course yet.
                            </p>
                            {session && !userReviewId && (
                                <Link href={`/review/new?course_id=${course.id}`}>
                                    <Button variant="primary">Be the first to review</Button>
                                </Link>
                            )}
                            {!session && (
                                <Link href="/login">
                                    <Button variant="secondary">Sign in to review</Button>
                                </Link>
                            )}
                        </Card>
                    )}
                </div>

                {/* Sidebar Column - hidden on mobile */}
                <div className="hidden md:block w-72 shrink-0">
                    <div className="sticky top-18">
                        <Sidebar>
                            <div className="space-y-4">
                                {/* Course Info */}
                                <div>
                                    <h1 className="text-lg font-bold text-carbon">{course.code}</h1>
                                    <p className="text-sm text-carbon/60">{course.name}</p>
                                </div>

                                {/* Stats */}
                                <div className="pt-4 border-t border-carbon/10 space-y-3">
                                    {/* Average Rating */}
                                    {course.averageRating !== undefined && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-carbon/50">Average Rating</span>
                                            <div className="flex items-center gap-1.5">
                                                <StarRating value={Math.round(course.averageRating)} size="sm" />
                                                <span className="text-sm font-medium text-carbon">
                                                    {course.averageRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Review Count */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-carbon/50">Reviews</span>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-carbon opacity-50" />
                                            <span className="text-sm font-medium text-carbon">
                                                {course.reviewCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action */}
                                {session && (
                                    <div className="pt-4 border-t border-carbon/10">
                                        {userReviewId ? (
                                            <Link href={`/review/${userReviewId}/edit`} className="block">
                                                <Button variant="secondary" className="w-full">
                                                    Edit Your Review
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`/review/new?course_id=${course.id}`} className="block">
                                                <Button variant="primary" className="w-full">
                                                    Write a Review
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                )}

                                {!session && (
                                    <div className="pt-4 border-t border-carbon/10">
                                        <Link href="/login" className="block">
                                            <Button variant="secondary" className="w-full">
                                                Sign in to review
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </Sidebar>
                    </div>
                </div>
            </div>
        </div>
    );
}

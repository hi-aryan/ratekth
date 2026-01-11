import { redirect } from "next/navigation";
import { auth } from "@/services/auth";
import { getAllTags, getReviewForEdit } from "@/services/reviews";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Card } from "@/components/ui/Card";
import { BackLink } from "@/components/ui/BackLink";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
    const session = await auth();
    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId) || reviewId <= 0) {
        redirect("/?error=review-not-found");
    }

    // Protected by proxy.ts - session is guaranteed to exist here
    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch review with ownership validation
    const review = await getReviewForEdit(reviewId, session.user.id);

    if (!review) {
        redirect("/?error=review-not-found");
    }

    // Fetch all available tags
    const tags = await getAllTags();

    return (
        <div className="max-w-3xl mx-auto px-4 py-4">
            <BackLink href={`/review/${reviewId}`} label="Back to Review" className="mb-6" />
            <Card>
                <h1 className="text-xl font-bold text-carbon mb-6">
                    Edit Review
                </h1>

                <ReviewForm
                    courses={[]}
                    tags={tags}
                    initialData={review}
                />
            </Card>
        </div>
    );
}


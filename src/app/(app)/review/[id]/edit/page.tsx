import { redirect } from "next/navigation";
import { auth } from "@/services/auth";
import { getAvailableCourses } from "@/services/courses";
import { getAllTags, getReviewForEdit } from "@/services/reviews";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Card } from "@/components/ui/Card";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
    const session = await auth();

    // Protected by proxy.ts, but double-check
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/review/new");
    }

    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId) || reviewId <= 0) {
        redirect("/?error=review-not-found");
    }

    // Fetch review with ownership validation
    const review = await getReviewForEdit(reviewId, session.user.id);

    if (!review) {
        redirect("/?error=review-not-found");
    }

    // Fetch courses visible to this user (for form, though course is disabled in edit mode)
    const courses = await getAvailableCourses(
        session.user.programId,
        session.user.mastersDegreeId,
        session.user.specializationId
    );

    // Fetch all available tags
    const tags = await getAllTags();

    return (
        <>
            {/* Form */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Card className="p-6">
                    <h1 className="text-xl font-bold text-carbon mb-6">
                        Edit Review
                    </h1>

                    <ReviewForm
                        courses={courses}
                        tags={tags}
                        initialData={review}
                    />
                </Card>
            </div>
        </>
    );
}


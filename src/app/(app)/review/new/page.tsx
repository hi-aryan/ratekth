import { redirect } from "next/navigation";
import { auth } from "@/services/auth";
import { getAvailableCourses } from "@/services/courses";
import { getAllTags, getUserReviewedCourseIds } from "@/services/reviews";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Card } from "@/components/ui/Card";

interface PageProps {
    searchParams: Promise<{ course_id?: string }>;
}

export default async function NewReviewPage({ searchParams }: PageProps) {
    const session = await auth();

    // Protected by proxy.ts, but double-check
    if (!session?.user?.id) {
        redirect("/login?callbackUrl=/review/new");
    }

    const { course_id } = await searchParams;
    const defaultCourseId = course_id ? parseInt(course_id, 10) : undefined;

    // Fetch courses visible to this user
    const courses = await getAvailableCourses(
        session.user.programId,
        session.user.mastersDegreeId,
        session.user.specializationId
    );

    // Fetch all available tags
    const tags = await getAllTags();

    // Fetch reviewed courses for this user (with reviewId for redirect)
    const userReviews = await getUserReviewedCourseIds(session.user.id);

    return (
        <>
            {/* Form */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <Card className="p-6">
                    <h1 className="text-xl font-bold text-carbon mb-6">
                        Write a Review
                    </h1>

                    {courses.length > 0 ? (
                        <ReviewForm
                            courses={courses}
                            tags={tags}
                            defaultCourseId={defaultCourseId}
                            reviewedCourses={userReviews}
                        />
                    ) : (
                        <p className="text-carbon/60 text-center py-8">
                            No courses available for your program yet.
                        </p>
                    )}
                </Card>
            </div>
        </>
    );
}

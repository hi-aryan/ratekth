import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/services/auth"
import { getReviewById } from "@/services/reviews"
import { ReviewCard } from "@/components/features/ReviewCard"
import { BackLink } from "@/components/ui/BackLink"

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params
    const reviewId = parseInt(id, 10)

    if (isNaN(reviewId) || reviewId <= 0) return { title: "Review Not Found" }

    const review = await getReviewById(reviewId)
    if (!review) return { title: "Review Not Found" }

    const snippet = review.content
        ? review.content.slice(0, 155) + (review.content.length > 155 ? "…" : "")
        : `A student review of ${review.course.code} on rateKTH.`

    return {
        title: `${review.course.code} Review`,
        description: snippet,
        openGraph: {
            title: `${review.course.code} Review — rateKTH`,
            description: snippet,
            url: `/review/${reviewId}`,
            type: "article",
            images: [
                { url: "/ratekth-new-logo.png", width: 1200, height: 630, alt: "rateKTH" },
            ],
        },
        alternates: { canonical: `/review/${reviewId}` },
    }
}

export default async function ReviewDetailPage({ params }: PageProps) {
    const { id } = await params
    const reviewId = parseInt(id, 10)

    if (isNaN(reviewId) || reviewId <= 0) {
        redirect("/?error=review-not-found")
    }

    const review = await getReviewById(reviewId)

    if (!review) {
        redirect("/?error=review-not-found")
    }

    const session = await auth()
    const isOwner = session?.user?.id === review.authorId

    return (
        <div className="max-w-3xl mx-auto px-4 py-4">
            <BackLink href="/" className="mb-6" />
            <ReviewCard 
                review={review} 
                variant="detail" 
                showOwnerActions 
                isOwner={isOwner} 
            />
        </div>
    )
}

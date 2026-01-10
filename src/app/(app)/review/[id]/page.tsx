import { redirect } from "next/navigation"
import { auth } from "@/services/auth"
import { getReviewById } from "@/services/reviews"
import { ReviewCard } from "@/components/features/ReviewCard"
import { BackLink } from "@/components/ui/BackLink"

interface PageProps {
    params: Promise<{ id: string }>
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

import { auth } from "@/services/auth";
import { getStudentFeed } from "@/services/feed";
import { ReviewCard } from "@/components/features/ReviewCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function Home() {
  /* throw new Error("Testing error boundary"); */ // testing error page

  const session = await auth();

  // Get feed based on user's visibility (or all reviews if guest)
  const feed = await getStudentFeed(
    session?.user?.programId,
    session?.user?.mastersDegreeId,
    session?.user?.specializationId
  );

  return (
    <main className="min-h-screen bg-porcelain">
      {/* Header */}
      <header className="bg-white border-b border-carbon/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-carbon">rateKTH</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-carbon/60">
                {session.user?.email}
              </span>
            </div>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Feed */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {feed.items.length > 0 ? (
          <div className="space-y-4">
            {feed.items.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}

            {/* Pagination info */}
            <div className="text-center text-sm text-carbon/50 pt-4">
              Showing {feed.items.length} of {feed.totalCount} reviews
              {feed.hasMore && " • More available"}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-carbon/60 mb-4">
              {session
                ? "No reviews for your courses yet."
                : "No reviews yet. Sign in to see reviews for your program!"}
            </p>
            {!session && (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

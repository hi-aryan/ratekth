import { auth } from "@/services/auth";
import { getStudentFeed } from "@/services/feed";
import { ReviewCard } from "@/components/features/ReviewCard";
import { Sidebar } from "@/components/features/Sidebar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function Home() {
  // throw new Error("Testing error boundary"); // testing error page

  const session = await auth();

  // Get feed based on user's visibility (or all reviews if guest)
  const feed = await getStudentFeed(
    session?.user?.programId,
    session?.user?.mastersDegreeId,
    session?.user?.specializationId
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Feed Column */}
        <div className="flex-1 min-w-0">
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

        {/* Sidebar Column - hidden on mobile */}
        <div className="hidden md:block w-72 shrink-0">
          <div className="sticky top-18">
            <Sidebar>
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <SearchBar />
                </div>

                {/* Info */}
                <div className="pt-4 border-t border-carbon/10">
                  <p className="text-sm text-carbon/50 leading-relaxed">
                    Discover course reviews from KTH students.
                  </p>
                </div>
              </div>
            </Sidebar>
          </div>
        </div>
      </div>
    </div>
  );
}

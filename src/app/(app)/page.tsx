import { auth } from "@/services/auth";
import { getStudentFeed } from "@/services/feed";
import { ReviewCard } from "@/components/features/ReviewCard";
import { SortDropdown } from "@/components/features/SortDropdown";
import { Sidebar } from "@/components/features/Sidebar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SORT_OPTIONS, type FeedSortOption } from "@/lib/constants";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ page?: string; sortBy?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { page, sortBy } = await searchParams;

  // Parse and validate page number (default 1, minimum 1)
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // Validate sortBy (must be one of SORT_OPTIONS, default 'newest')
  const currentSort: FeedSortOption = SORT_OPTIONS.includes(sortBy as FeedSortOption)
    ? (sortBy as FeedSortOption)
    : "newest";

  const session = await auth();

  // Get feed based on user's visibility (or all reviews if guest)
  const feed = await getStudentFeed(
    session?.user?.programId,
    session?.user?.mastersDegreeId,
    session?.user?.specializationId,
    { page: currentPage, sortBy: currentSort }
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Feed Column */}
        <div className="flex-1 min-w-0">
          {feed.items.length > 0 ? (
            <div className="space-y-4">
              {/* Reviews */}
              {feed.items.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                hasMore={feed.hasMore}
                sortBy={currentSort}
              />
            </div>
          ) : (
            <Card className="text-center py-12">
              <p className="text-carbon/60 mb-4">
                {session
                  ? currentPage > 1
                    ? "No more reviews on this page."
                    : "No reviews for your courses yet."
                  : "No reviews yet. Sign in to see reviews for your program!"}
              </p>
              {!session && (
                <Link href="/login">
                  <Button variant="secondary">Sign In</Button>
                </Link>
              )}
              {session && currentPage > 1 && (
                <Link href="/">
                  <Button variant="secondary">Back to First Page</Button>
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
                {/* Sort */}
                <SortDropdown currentSort={currentSort} />

                <div className="pt-4 border-t border-carbon/10">
                  {/* Search */}
                  <SearchBar />
                  <p className="mt-2 text-xs text-carbon/40">
                    Enter at least 2 characters to search.
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

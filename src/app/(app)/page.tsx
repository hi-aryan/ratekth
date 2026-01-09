import { auth } from "@/services/auth";
import { getStudentFeed } from "@/services/feed";
import { getUserReviewCount } from "@/services/reviews";
import { ReviewCard } from "@/components/features/ReviewCard";
import { SortDropdown } from "@/components/features/SortDropdown";
import { FeedFilterToggle } from "@/components/features/FeedFilterToggle";
import { Sidebar } from "@/components/features/Sidebar";
import { SidebarStats } from "@/components/features/SidebarStats";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SORT_OPTIONS, type FeedSortOption } from "@/lib/constants";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ page?: string; sortBy?: string; filter?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { page, sortBy, filter } = await searchParams;

  // Parse and validate page number (default 1, minimum 1)
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // Validate sortBy (must be one of SORT_OPTIONS, default 'newest')
  const currentSort: FeedSortOption = SORT_OPTIONS.includes(sortBy as FeedSortOption)
    ? (sortBy as FeedSortOption)
    : "newest";

  const session = await auth();

  // Filter logic: default is "all" reviews, "my-program" filters to user's courses
  const isMyProgramFilter = filter === "my-program" && session?.user;

  // Get feed based on filter (all reviews by default, or filtered to user's program)
  const feed = await getStudentFeed(
    isMyProgramFilter ? session?.user?.programId : null,
    isMyProgramFilter ? session?.user?.mastersDegreeId : null,
    isMyProgramFilter ? session?.user?.specializationId : null,
    isMyProgramFilter ? session?.user?.programSpecializationId : null,
    { page: currentPage, sortBy: currentSort }
  );

  // Get user's review count for sidebar (only if authenticated)
  const userReviewCount = session?.user?.id
    ? await getUserReviewCount(session.user.id)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex gap-4">
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
                    : isMyProgramFilter
                      ? "No reviews for your program's courses yet."
                      : "No reviews yet. Be the first to review a course!"
                  : "No reviews yet. Sign in to see reviews for your program!"}
              </p>
              {!session && (
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
              )}
              {session && currentPage > 1 && (
                <Link href="/">
                  <Button>Back to First Page</Button>
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
                {/* Filter Toggle - only for authenticated users */}
                {session && <FeedFilterToggle />}

                {/* Sort */}
                <SortDropdown currentSort={currentSort} />

                <div className="pt-4 border-t border-carbon/10">
                  {/* Search */}
                  <SearchBar />
                  <p className="mt-2 text-xs text-carbon/40">
                    Enter at least 2 characters to search.
                  </p>
                </div>

                {/* User Stats - only for authenticated users */}
                {userReviewCount !== null && (
                  <SidebarStats reviewCount={userReviewCount} />
                )}
              </div>
            </Sidebar>
          </div>
        </div>
      </div>
    </div>
  );
}

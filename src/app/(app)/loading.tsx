import { Card } from "@/components/ui/Card"

/**
 * Loading skeleton for feed page.
 * Mirrors the structure of ReviewCard for smooth visual transition.
 */
export default function FeedLoading() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex gap-6">
                {/* Feed Column */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Review card skeletons - matches FEED_PAGE_SIZE of 10 */}
                    {[...Array(10)].map((_, i) => (
                        <Card key={i} className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="h-5 w-24 bg-carbon/10 rounded animate-pulse" />
                                    <div className="h-4 w-48 bg-carbon/5 rounded animate-pulse" />
                                </div>
                                <div className="h-5 w-20 bg-carbon/10 rounded animate-pulse" />
                            </div>

                            {/* Ratings */}
                            <div className="h-16 bg-carbon/[0.02] rounded-lg mb-4 animate-pulse" />

                            {/* Content */}
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-carbon/5 rounded animate-pulse" />
                                <div className="h-4 w-3/4 bg-carbon/5 rounded animate-pulse" />
                            </div>

                            {/* Footer */}
                            <div className="flex gap-4 pt-4 border-t border-carbon/10">
                                <div className="h-4 w-20 bg-carbon/5 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-carbon/5 rounded animate-pulse" />
                                <div className="h-4 w-28 bg-carbon/5 rounded animate-pulse" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Sidebar skeleton - hidden on mobile */}
                <div className="hidden md:block w-72 shrink-0">
                    <div className="sticky top-18">
                        <Card className="p-6 space-y-4">
                            {/* Sort skeleton */}
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-14 bg-carbon/5 rounded animate-pulse" />
                                <div className="h-10 flex-1 bg-carbon/5 rounded-lg animate-pulse" />
                            </div>
                            {/* Search skeleton */}
                            <div className="h-10 bg-carbon/5 rounded-lg animate-pulse" />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

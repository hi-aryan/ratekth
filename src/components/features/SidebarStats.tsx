import Link from "next/link";
import { MessageSquare } from "lucide-react"

interface SidebarStatsProps {
    reviewCount: number
}

/**
 * SidebarStats: Displays user's review count in the sidebar.
 * Server component - receives props from page.
 */
export const SidebarStats = ({ reviewCount }: SidebarStatsProps) => {
    return (
        <div className="pt-4 border-t border-carbon/10">
            <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-carbon/40" />
                <span className="text-sm text-carbon/50">Reviews written</span>
                <Link
                    href="/account#my-reviews"
                    className="text-sm font-black text-blue bg-blue/10 py-0.5 px-2 rounded-md hover:bg-blue/20 transition-colors"
                    title="View my reviews"
                >
                    {reviewCount}
                </Link>
            </div>
        </div>
    )
}


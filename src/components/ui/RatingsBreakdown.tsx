import { StarRating } from "@/components/ui/StarRating"
import { workloadLabels, workloadIcons, type WorkloadType } from "@/lib/reviewHelpers"

interface RatingsBreakdownProps {
    ratingProfessor: number
    ratingMaterial: number
    ratingPeers: number
    ratingWorkload: WorkloadType
    variant?: 'compact' | 'full'
}

/**
 * RatingsBreakdown: Shared component for displaying Professor, Material, Peers, and Workload.
 * 
 * Variants:
 * - compact: 1x4 grid, xs stars, smaller text (for feed cards)
 * - full: 2x2 on mobile, 1x4 on desktop, sm stars, larger text (for detail page)
 */
export const RatingsBreakdown = ({
    ratingProfessor,
    ratingMaterial,
    ratingPeers,
    ratingWorkload,
    variant = 'compact',
}: RatingsBreakdownProps) => {
    const WorkloadIcon = workloadIcons[ratingWorkload]

    const isCompact = variant === 'compact'

    // Sizing based on variant
    const starSize = isCompact ? 'xs' : 'sm'
    const iconSize = isCompact ? 'w-3 h-3' : 'w-4 h-4'
    const labelClass = isCompact ? 'text-xs text-carbon/40' : 'text-xs text-carbon/50'
    const workloadTextClass = isCompact ? 'text-xs text-carbon/80 font-semibold' : 'text-sm font-medium text-carbon'

    // Grid layout: compact always 4 cols, full is 2 cols on mobile -> 4 cols on sm+
    const gridClass = isCompact
        ? 'grid grid-cols-4 gap-2 p-3'
        : 'grid grid-cols-2 gap-3 p-4 sm:grid-cols-4'

    return (
        <div className={`${gridClass} bg-carbon/[0.02] rounded-lg`}>
            <div className="text-center">
                <p className={`${labelClass} mb-1`}>Professor</p>
                <StarRating value={ratingProfessor} size={starSize} />
            </div>
            <div className="text-center">
                <p className={`${labelClass} mb-1`}>Material</p>
                <StarRating value={ratingMaterial} size={starSize} />
            </div>
            <div className="text-center">
                <p className={`${labelClass} mb-1`}>Peers</p>
                <StarRating value={ratingPeers} size={starSize} />
            </div>
            <div className="text-center">
                <p className={`${labelClass} mb-1`}>Workload</p>
                <span className="inline-flex items-center gap-1">
                    <WorkloadIcon className={`${iconSize} text-carbon opacity-80`} />
                    <span className={workloadTextClass}>{workloadLabels[ratingWorkload]}</span>
                </span>
            </div>
        </div>
    )
}

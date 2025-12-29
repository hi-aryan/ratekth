import { cn } from "@/lib/utils"

type BadgeVariant = 'positive' | 'negative' | 'neutral'

interface BadgeProps {
    children: React.ReactNode
    variant?: BadgeVariant
    className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
    positive: "bg-green/15 text-green",
    negative: "bg-coral/15 text-coral",
    neutral: "bg-carbon/10 text-carbon",
}

/**
 * Badge: Reusable label for tags, workload, and status indicators.
 * Uses design tokens from globals.css.
 */
export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
    return (
        <span className={cn(
            "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full",
            variantStyles[variant],
            className
        )}>
            {children}
        </span>
    )
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackLinkProps {
    href: string
    label?: string
    className?: string
}

/**
 * BackLink: Reusable navigation link for returning to a previous page.
 * Server Component - uses Next.js Link for optimal performance.
 */
export const BackLink = ({ href, label = "Back", className }: BackLinkProps) => {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center gap-1.5 text-sm text-carbon/60 hover:translate-x-[-3px] transition-all duration-200 ease-in-out",
                className
            )}
        >
            <ArrowLeft className="w-4 h-4 text-carbon opacity-60" />
            {label}
        </Link>
    )
}

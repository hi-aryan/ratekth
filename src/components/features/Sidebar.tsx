import { cn } from "@/lib/utils"
import { GraduationCap } from "lucide-react"

interface SidebarProps {
    children: React.ReactNode
    className?: string
}

/**
 * Sidebar: Container for sidebar content.
 * Server component - receives children, no client-side logic.
 */
export const Sidebar = ({ children, className }: SidebarProps) => {
    return (
        <aside className={cn(
            "group relative overflow-hidden bg-white rounded-lg shadow-[0_0_3px_rgba(0,0,0,0.15)] p-6",
            className
        )}>
            {/* Background Icon */}
            <div className="absolute -bottom-16 -right-12 text-carbon opacity-[0.04] pointer-events-none select-none z-0 rotate-[-12deg]">
                <GraduationCap className="w-64 h-64" strokeWidth={1} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </aside>
    )
}

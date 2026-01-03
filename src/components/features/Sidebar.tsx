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
            "relative bg-white rounded-lg shadow-[0_0_4px_rgba(0,0,0,0.15)] p-6",
            className
        )}>
            {/* Background Icon - clipped to sidebar bounds */}
            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                <div className="absolute -bottom-16 -right-12 text-carbon opacity-[0.04] select-none rotate-[-12deg]">
                    <GraduationCap className="w-64 h-64" strokeWidth={1} />
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </aside>
    )
}

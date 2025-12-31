import { cn } from "@/lib/utils"

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
            "bg-white rounded-lg shadow-[0_0_3px_rgba(0,0,0,0.15)] p-6",
            className
        )}>
            {children}
        </aside>
    )
}

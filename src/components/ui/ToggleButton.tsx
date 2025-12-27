import { cn } from "@/lib/utils"

interface ToggleButtonProps {
    children: React.ReactNode
    isActive: boolean
    onClick: () => void
    className?: string
}

export const ToggleButton = ({ children, isActive, onClick, className }: ToggleButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-all",
                isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                className
            )}
        >
            {children}
        </button>
    )
}

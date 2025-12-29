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
                    ? "bg-carbon text-porcelain border-carbon"
                    : "bg-white text-carbon/70 border-carbon/20 hover:border-carbon/30",
                className
            )}
        >
            {children}
        </button>
    )
}

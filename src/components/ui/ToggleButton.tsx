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
                "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 active:scale-95",
                isActive
                    ? "bg-carbon text-porcelain shadow-md"
                    : "bg-carbon/5 text-carbon/70 hover:bg-carbon/10 hover:text-carbon hover:scale-102",
                className
            )}
        >
            {children}
        </button>
    )
}

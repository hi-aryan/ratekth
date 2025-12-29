import { cn } from "@/lib/utils"

type AlertVariant = "error" | "success"

interface AlertProps {
    variant: AlertVariant
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<AlertVariant, string> = {
    error: "text-coral bg-coral/10 border-coral/20",
    success: "text-green bg-green/20 border-green/30",
}

export const Alert = ({ variant, children, className }: AlertProps) => {
    return (
        <p className={cn(
            "text-sm font-medium p-3 rounded-lg border",
            variantStyles[variant],
            className
        )}>
            {children}
        </p>
    )
}

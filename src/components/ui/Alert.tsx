import { cn } from "@/lib/utils"

type AlertVariant = "error" | "success"

interface AlertProps {
    variant: AlertVariant
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<AlertVariant, string> = {
    error: "text-coral bg-coral/10 border-coral/20",
    /* success: "text-carbon/70 bg-green/20 border-green/30", */
    success: "text-green bg-green/10 border-green/20"
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

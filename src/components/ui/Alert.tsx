import { cn } from "@/lib/utils"

type AlertVariant = "error" | "success"

interface AlertProps {
    variant: AlertVariant
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<AlertVariant, string> = {
    error: "text-red-600 bg-red-50 border-red-100",
    success: "text-green-600 bg-green-50 border-green-100",
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

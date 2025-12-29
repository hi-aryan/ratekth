import { cn } from "@/lib/utils"

interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div className={cn(
            "bg-white rounded-lg shadow-[0_0_3px_rgba(0,0,0,0.15)] p-8",
            className
        )}>
            {children}
        </div>
    )
}

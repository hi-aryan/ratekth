import { cn } from "@/lib/utils"

interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card = ({ children, className }: CardProps) => {
    return (
        <div className={cn(
            "bg-white rounded-2xl shadow-sm border border-slate-100 p-8",
            className
        )}>
            {children}
        </div>
    )
}

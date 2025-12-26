import { cn } from "@/lib/utils"

export const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    return (
        <select
            {...props}
            className={cn(
                "w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        />
    )
}

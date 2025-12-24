import { cn } from "@/lib/utils"

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            {...props}
            className={cn(
                "w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5",
                className
            )}
        />
    )
}

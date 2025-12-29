import { cn } from "@/lib/utils"

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            {...props}
            className={cn(
                "w-full rounded-lg border border-carbon/20 bg-white px-4 py-2 text-sm text-carbon transition-all placeholder:text-carbon/50 focus:border-carbon focus:outline-none focus:ring-4 focus:ring-carbon/5",
                className
            )}
        />
    )
}

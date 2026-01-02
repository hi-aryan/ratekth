import { cn } from "@/lib/utils"

export const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => {
    return (
        <select
            {...props}
            className={cn(
                "w-full px-4 py-2 bg-white border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 rounded-lg focus:outline-none focus:border-carbon text-sm disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        />
    )
}

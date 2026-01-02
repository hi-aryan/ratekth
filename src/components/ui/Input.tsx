import { cn } from "@/lib/utils"

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
        <input
            {...props}
            className={cn(
                "w-full rounded-lg border border-carbon/20 transition-all duration-200 ease-in-out hover:border-carbon/40 bg-white px-4 py-2 text-sm text-carbon placeholder:text-carbon/50 focus:border-carbon focus:outline-none",
                className
            )}
        />
    )
}

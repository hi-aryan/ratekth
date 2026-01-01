"use client"

import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
}

export const Button = ({ children, className, loading, ...props }: ButtonProps) => {
    const { pending } = useFormStatus()
    const isPending = pending || loading

    return (
        <button
            {...props}
            disabled={isPending || props.disabled}
            className={cn(
                "group relative overflow-hidden flex w-full items-center justify-center rounded-lg bg-carbon px-4 py-2.5 text-sm font-semibold text-porcelain transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {/* Light sweep effect */}
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-800 ease-out group-hover:translate-x-[400%]" />

            {isPending ? (
                <span className="relative mr-2 h-4 w-4 animate-spin rounded-full border-2 border-porcelain/20 border-t-porcelain" />
            ) : null}
            <span className="relative">{children}</span>
        </button>
    )
}

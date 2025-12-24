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
                "flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {isPending ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : null}
            {children}
        </button>
    )
}

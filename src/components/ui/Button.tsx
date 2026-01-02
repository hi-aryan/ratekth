"use client"

import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
}

/**
 * Variant styles - background, text, and hover effects.
 * All variants share the same active effect (scale down).
 */
const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-carbon text-porcelain",
    secondary: "bg-blue text-white hover:bg-blue/90",
    ghost: "bg-transparent text-carbon/70 hover:bg-carbon/5 hover:text-carbon",
    destructive: "bg-coral text-white hover:bg-coral/90",
}

/**
 * Size styles - padding and text size.
 */
const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-2.5 text-sm",
}

/**
 * Button: Unified button component with variants and sizes.
 * 
 * Features:
 * - Four variants: primary (carbon), secondary (blue), ghost, destructive (coral)
 * - Three sizes: sm, md, lg
 * - Built-in loading state via useFormStatus() for form submissions
 * - Universal active:scale-[0.97] effect on all variants
 * - Light sweep hover effect on primary variant only
 * 
 * Usage:
 * - Form submit: <Button size="lg" className="w-full">Submit</Button>
 * - Nav button: <Button variant="ghost" size="sm">Menu</Button>
 * - Destructive: <Button variant="destructive" size="sm">Delete</Button>
 */
export const Button = ({
    children,
    className,
    variant = "primary",
    size = "md",
    loading,
    ...props
}: ButtonProps) => {
    const { pending } = useFormStatus()
    const isPending = pending || loading

    const isPrimary = variant === "primary"

    return (
        <button
            {...props}
            disabled={isPending || props.disabled}
            className={cn(
                // Base styles
                "group relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-lg whitespace-nowrap transition-all duration-150",
                // Universal active effect
                "active:scale-[0.97]",
                // Disabled state
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                // Variant-specific styles
                variantStyles[variant],
                // Size-specific styles
                sizeStyles[size],
                className
            )}
        >
            {/* Light sweep effect - primary variant only */}
            {isPrimary && (
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-800 ease-out group-hover:translate-x-[300%] overflow-hidden" />
            )}

            {isPending ? (
                <span className="relative mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" />
            ) : null}
            <span className="relative inline-flex items-center">{children}</span>
        </button>
    )
}

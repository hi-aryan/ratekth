"use client"

import { useFormStatus } from "react-dom"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/ui/BorderBeam"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    /** Show animated BorderBeam effect */
    showBeam?: boolean
}

/**
 * Variant styles - background and text only.
 * Hover/active effects are centralized in base styles.
 */
const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-carbon text-porcelain shadow-[0_0_6px_rgba(0,0,0,0.15)]",
    secondary: "bg-blue text-porcelain",
    ghost: "bg-transparent text-carbon/70 hover:bg-carbon/5 hover:text-carbon",
    destructive: "bg-coral/90 text-porcelain hover:bg-coral",
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
 * - Universal hover and active effects on all variants
 * - Optional BorderBeam effect via showBeam prop
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
    showBeam,
    ...props
}: ButtonProps) => {
    const { pending } = useFormStatus()
    const isPending = pending || loading

    return (
        <button
            {...props}
            disabled={isPending || props.disabled}
            className={cn(
                // Base styles
                "group/btn relative overflow-hidden inline-flex items-center justify-center font-semibold rounded-full whitespace-nowrap transition-all",
                // Universal hover/active effects
                "hover:translate-y-[-1px] active:scale-[0.95]",
                // Disabled state
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100",
                // Variant-specific styles
                variantStyles[variant],
                // Size-specific styles
                sizeStyles[size],
                className
            )}
        >
            {isPending ? (
                <span className="relative mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current/20 border-t-current" />
            ) : null}
            <span className="relative inline-flex items-center">{children}</span>

            {/* BorderBeam effect - opt-in via showBeam prop */}
            {showBeam && <BorderBeam size={30} duration={4} colorFrom="#FFFFFF" colorTo="#FFFFFF" borderWidth={2} transition={{
                type: "spring",
                stiffness: 20,
                damping: 6,
            }} />}
        </button>
    )
}

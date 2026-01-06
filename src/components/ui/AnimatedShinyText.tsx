import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef, FC } from "react"

/**
 * AnimatedShinyText: Animated gradient shimmer effect on text.
 * (Magic UI)
 * 
 * Uses brand blue (#2C67BA) as the shimmer highlight color.
 */
export const AnimatedShinyText: FC<ComponentPropsWithoutRef<"span">> = ({
    children,
    className,
    ...props
}) => {
    return (
        <span
            style={{
                "--bg-size": "500%",
                "--color-one": "white",
                "--color-two": "#5BA3FF",
            } as React.CSSProperties}
            className={cn(
                // Gradient: thin blue shimmer band (white 45% | blue 10% | white 45%)
                "animate-gradient inline bg-clip-text text-transparent",
                "bg-[length:var(--bg-size)_100%]",
                "bg-[linear-gradient(90deg,var(--color-one)_0%,var(--color-one)_40%,var(--color-two)_50%,var(--color-one)_60%,var(--color-one)_100%)]",
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

import { cn } from "@/lib/utils"
import type { ComponentPropsWithoutRef, FC } from "react"

/**
 * AnimatedShinyText: Animated gradient shimmer effect on text.
 * 
 * Based on Magic UI's AnimatedGradientText component.
 * Uses brand blue (#2C67BA) as the shimmer highlight color.
 * 
 * @example
 * <AnimatedShinyText>Sign In</AnimatedShinyText>
 */
export const AnimatedShinyText: FC<ComponentPropsWithoutRef<"span">> = ({
    children,
    className,
    ...props
}) => {
    return (
        <span
            style={{
                "--bg-size": "200%",
                "--color-one": "white",
                "--color-two": "#5BA3FF",
            } as React.CSSProperties}
            className={cn(
                "animate-gradient inline bg-gradient-to-r from-[var(--color-one)] via-[var(--color-two)] to-[var(--color-one)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
                className
            )}
            {...props}
        >
            {children}
        </span>
    )
}

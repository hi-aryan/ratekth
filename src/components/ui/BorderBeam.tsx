"use client"

import { motion, type MotionStyle, type Transition } from "motion/react"
import { cn } from "@/lib/utils"

interface BorderBeamProps {
    /** The size of the border beam. */
    size?: number
    /** The duration of the border beam animation (seconds). */
    duration?: number
    /** The delay before animation starts (seconds). */
    delay?: number
    /** The starting color of the gradient. */
    colorFrom?: string
    /** The ending color of the gradient. */
    colorTo?: string
    /** Custom motion transition settings. */
    transition?: Transition
    /** Additional class names. */
    className?: string
    /** Additional inline styles. */
    style?: React.CSSProperties
    /** Whether to reverse the animation direction. */
    reverse?: boolean
    /** The initial offset position (0-100). */
    initialOffset?: number
    /** The border width of the beam (pixels). */
    borderWidth?: number
}

/**
 * BorderBeam: Animated gradient border effect.
 * 
 * Usage: Place inside a parent with `relative overflow-hidden rounded-*`.
 * 
 * @example
 * <Card className="relative overflow-hidden">
 *   <CardContent>...</CardContent>
 *   <BorderBeam />
 * </Card>
 */
export const BorderBeam = ({
    className,
    size = 50,
    delay = 0,
    duration = 6,
    colorFrom = "#1F5BAE",  // Your blue token
    colorTo = "#1F5BAE",    // Same blue for monochrome effect
    transition,
    style,
    reverse = false,
    initialOffset = 0,
    borderWidth = 1.5,
}: BorderBeamProps) => {
    return (
        <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]"
            style={{
                borderWidth: `${borderWidth}px`,
                borderStyle: "solid",
            }}
        >
            <motion.div
                className={cn(
                    "absolute aspect-square",
                    "bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent",
                    className
                )}
                style={{
                    width: size,
                    offsetPath: `rect(0 auto auto 0 round ${size}px)`,
                    "--color-from": colorFrom,
                    "--color-to": colorTo,
                    ...style,
                } as MotionStyle}
                initial={{ offsetDistance: `${initialOffset}%` }}
                animate={{
                    offsetDistance: reverse
                        ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
                        : [`${initialOffset}%`, `${100 + initialOffset}%`],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration,
                    delay: -delay,
                    ...transition,
                }}
            />
        </div>
    )
}

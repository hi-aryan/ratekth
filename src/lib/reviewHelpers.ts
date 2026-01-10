import { Feather, Scale, Dumbbell } from "lucide-react"

/**
 * Workload type as defined in schema.
 */
export type WorkloadType = 'light' | 'medium' | 'heavy'

/**
 * Workload label mapping for display.
 */
export const workloadLabels: Record<WorkloadType, string> = {
    light: 'Light',
    medium: 'Medium',
    heavy: 'Heavy',
}

/**
 * Workload icon mapping for display.
 */
export const workloadIcons: Record<WorkloadType, React.ElementType> = {
    light: Feather,
    medium: Scale,
    heavy: Dumbbell,
}

/**
 * Format date for review display.
 */
export const formatReviewDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

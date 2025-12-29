export function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(" ");
}

/**
 * Compute overall rating from three component ratings.
 * Returns a value rounded to 1 decimal place.
 */
export const computeOverallRating = (
    professor: number,
    material: number,
    peers: number
): number => {
    return Math.round(((professor + material + peers) / 3) * 10) / 10;
};

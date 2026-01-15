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

// Appends "..." if truncated.
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    
    // Find last space before maxLength to avoid cutting mid-word
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    // If no space found or space is too early, just cut at maxLength
    const cutPoint = lastSpace > maxLength * 0.5 ? lastSpace : maxLength;
    
    return text.slice(0, cutPoint).trimEnd() + '...';
};

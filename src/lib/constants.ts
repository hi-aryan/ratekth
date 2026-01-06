/**
 * Feed and Pagination Constants
 * Centralized to avoid magic numbers across services/components.
 */

export const FEED_PAGE_SIZE = 10 as const

export const SORT_OPTIONS = ['newest', 'top-rated', 'professor', 'material', 'peers'] as const
export type FeedSortOption = typeof SORT_OPTIONS[number]

export const FILTER_OPTIONS = ['all', 'my-program'] as const
export type FeedFilterOption = typeof FILTER_OPTIONS[number]

/**
 * Rating Constraints
 */
export const RATING_MIN = 1 as const
export const RATING_MAX = 5 as const

/**
 * Tag Constraints
 */
export const MAX_TAGS_PER_REVIEW = 3 as const

/**
 * In-Memory Rate Limiter.
 * Limits: 3 requests per 10 minutes per key.
 */

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (key: string): { allowed: boolean; retryAfterSeconds?: number } => {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Cleanup expired entry
  if (entry && now >= entry.resetAt) {
    rateLimitMap.delete(key);
  }

  const current = rateLimitMap.get(key);

  if (!current) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true };
};

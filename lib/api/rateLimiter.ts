import Bottleneck from 'bottleneck'
import { incrementQuota, getQuota } from '@/lib/cache/redis'
import { logger } from '@/lib/logger'

// Alpha Vantage limits: 5 calls per minute, 500 calls per day
const limiter = new Bottleneck({
  minTime: 12000, // 12 seconds between requests (5 per minute)
  maxConcurrent: 1,
  reservoir: 500, // Max 500 requests
  reservoirRefreshAmount: 500,
  reservoirRefreshInterval: 24 * 60 * 60 * 1000, // Reset daily
})

// Constants for Alpha Vantage quota
const DAILY_QUOTA_LIMIT = 500
const QUOTA_TTL_SECONDS = 24 * 60 * 60 // 24 hours
const QUOTA_KEY = 'alpha_vantage:daily'

export function getRateLimiter() {
  return limiter
}

/**
 * Increment API request count in Redis (distributed counter)
 * Returns the new count and remaining quota
 */
export async function incrementRequestCount(): Promise<number> {
  try {
    const { count, remaining, exceeded } = await incrementQuota(
      QUOTA_KEY,
      DAILY_QUOTA_LIMIT,
      QUOTA_TTL_SECONDS
    )

    if (exceeded) {
      logger.warn({ count, remaining }, 'Alpha Vantage daily quota exceeded or approaching limit')
    }

    return count
  } catch (error) {
    logger.error({ error }, 'Failed to increment Alpha Vantage request count in Redis')
    // Fallback: return 0 to allow request but log the failure
    return 0
  }
}

/**
 * Get current request count from Redis
 */
export async function getRequestCount(): Promise<number> {
  try {
    const { count } = await getQuota(QUOTA_KEY, DAILY_QUOTA_LIMIT)
    return count
  } catch (error) {
    logger.error({ error }, 'Failed to get Alpha Vantage request count from Redis')
    return 0
  }
}

/**
 * Get remaining API quota from Redis
 */
export async function getRemainingRequests(): Promise<number> {
  try {
    const { remaining } = await getQuota(QUOTA_KEY, DAILY_QUOTA_LIMIT)
    return remaining
  } catch (error) {
    logger.error({ error }, 'Failed to get remaining Alpha Vantage quota from Redis')
    return DAILY_QUOTA_LIMIT // Fail open
  }
}

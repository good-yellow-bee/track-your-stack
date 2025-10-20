import { Redis } from '@upstash/redis'
import { getEnv, isRedisConfigured } from '@/lib/env'

/**
 * Redis client singleton for distributed caching and locking
 * Falls back to null if Redis is not configured (development mode)
 */
let redisClient: Redis | null = null

/**
 * Get Redis client instance
 * Returns null if Redis is not configured (development fallback)
 */
export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null
  }

  if (!redisClient) {
    const env = getEnv()
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  return redisClient
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return getRedisClient() !== null
}

/**
 * Redis key prefixes for namespacing
 */
export const REDIS_KEYS = {
  LOCK: 'lock',
  RATE_LIMIT: 'ratelimit',
  PRICE_CACHE: 'price',
  CURRENCY_CACHE: 'currency',
  QUERY_CACHE: 'query',
} as const

/**
 * Generate namespaced Redis key
 */
export function getRedisKey(prefix: keyof typeof REDIS_KEYS, ...parts: string[]): string {
  return `tys:${REDIS_KEYS[prefix]}:${parts.join(':')}`
}

/**
 * Rate limit check using sliding window algorithm
 * @param identifier - Unique identifier for the rate limit (user:id, ip:address)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with success status, remaining requests, and reset timestamp
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const redis = getRedisClient()

  // Fallback for development without Redis
  if (!redis) {
    return {
      success: true,
      remaining: limit,
      reset: Date.now() + windowMs,
    }
  }

  const key = getRedisKey('RATE_LIMIT', identifier)
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // Use Redis sorted set for sliding window
    // Score is timestamp, value is unique request ID
    const requestId = `${now}:${Math.random()}`

    // Remove old requests outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count requests in current window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Rate limit exceeded
      const oldestRequest = (await redis.zrange(key, 0, 0, { withScores: true })) as Array<{
        score: number
        member: string
      }>
      const resetTime =
        oldestRequest.length > 0 && oldestRequest[0]
          ? Number(oldestRequest[0].score) + windowMs
          : now + windowMs

      return {
        success: false,
        remaining: 0,
        reset: resetTime,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: requestId })

    // Set expiry on the key (cleanup)
    await redis.expire(key, Math.ceil(windowMs / 1000))

    return {
      success: true,
      remaining: limit - (count + 1),
      reset: now + windowMs,
    }
  } catch (error) {
    // If Redis fails, allow the request (fail open for availability)
    console.error('Redis rate limit check failed:', error)
    return {
      success: true,
      remaining: limit,
      reset: now + windowMs,
    }
  }
}

/**
 * Increment API quota counter in Redis
 * Used for tracking Alpha Vantage API usage across instances
 * @param quotaKey - Quota identifier (e.g., 'alpha_vantage:daily')
 * @param limit - Maximum quota allowed
 * @param ttlSeconds - Time-to-live for the counter in seconds
 * @returns Current count and remaining quota
 */
export async function incrementQuota(
  quotaKey: string,
  limit: number,
  ttlSeconds: number
): Promise<{ count: number; remaining: number; exceeded: boolean }> {
  const redis = getRedisClient()

  // Fallback for development without Redis
  if (!redis) {
    return {
      count: 0,
      remaining: limit,
      exceeded: false,
    }
  }

  const key = getRedisKey('QUERY_CACHE', 'quota', quotaKey)

  try {
    // Increment counter atomically
    const count = await redis.incr(key)

    // Set TTL on first increment
    if (count === 1) {
      await redis.expire(key, ttlSeconds)
    }

    return {
      count,
      remaining: Math.max(0, limit - count),
      exceeded: count > limit,
    }
  } catch (error) {
    console.error('Redis quota increment failed:', error)
    // Fail open - allow the request
    return {
      count: 0,
      remaining: limit,
      exceeded: false,
    }
  }
}

/**
 * Get current quota count without incrementing
 * @param quotaKey - Quota identifier
 * @param limit - Maximum quota allowed
 * @returns Current count and remaining quota
 */
export async function getQuota(
  quotaKey: string,
  limit: number
): Promise<{ count: number; remaining: number; exceeded: boolean }> {
  const redis = getRedisClient()

  if (!redis) {
    return {
      count: 0,
      remaining: limit,
      exceeded: false,
    }
  }

  const key = getRedisKey('QUERY_CACHE', 'quota', quotaKey)

  try {
    const count = (await redis.get<number>(key)) || 0

    return {
      count,
      remaining: Math.max(0, limit - count),
      exceeded: count > limit,
    }
  } catch (error) {
    console.error('Redis quota check failed:', error)
    return {
      count: 0,
      remaining: limit,
      exceeded: false,
    }
  }
}

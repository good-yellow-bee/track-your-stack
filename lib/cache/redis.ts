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

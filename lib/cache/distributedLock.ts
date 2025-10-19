import { getRedisClient, getRedisKey } from './redis'

/**
 * Distributed lock options
 */
export interface LockOptions {
  /** Lock timeout in milliseconds (default: 10 seconds) */
  timeout?: number
  /** Maximum time to wait for lock acquisition in milliseconds (default: 5 seconds) */
  maxWaitTime?: number
  /** Retry interval in milliseconds (default: 100ms) */
  retryInterval?: number
}

const DEFAULT_OPTIONS: Required<LockOptions> = {
  timeout: 10000, // 10 seconds
  maxWaitTime: 5000, // 5 seconds
  retryInterval: 100, // 100ms
}

/**
 * Acquire a distributed lock using Redis
 * Falls back to in-memory lock if Redis is not available
 *
 * @param key - Unique lock identifier
 * @param options - Lock configuration options
 * @returns Lock release function
 * @throws {Error} If lock cannot be acquired within maxWaitTime
 *
 * @example
 * ```typescript
 * const release = await acquireLock('currency:USD:EUR')
 * try {
 *   // Critical section - only one process can execute this
 *   await fetchAndCacheExchangeRate('USD', 'EUR')
 * } finally {
 *   await release()
 * }
 * ```
 */
export async function acquireLock(
  key: string,
  options: LockOptions = {}
): Promise<() => Promise<void>> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const redis = getRedisClient()

  // Redis-based distributed lock
  if (redis) {
    const lockKey = getRedisKey('LOCK', key)
    const lockValue = `${Date.now()}-${Math.random()}`
    const startTime = Date.now()

    // Try to acquire lock with retries
    while (Date.now() - startTime < opts.maxWaitTime) {
      const acquired = await redis.set(lockKey, lockValue, {
        nx: true, // Only set if not exists
        px: opts.timeout, // Expire after timeout
      })

      if (acquired) {
        // Lock acquired successfully
        return async () => {
          // Only delete if we still own the lock
          const currentValue = await redis.get(lockKey)
          if (currentValue === lockValue) {
            await redis.del(lockKey)
          }
        }
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, opts.retryInterval))
    }

    throw new Error(`Failed to acquire lock for key: ${key} within ${opts.maxWaitTime}ms`)
  }

  // Fallback: In-memory lock for development
  // NOTE: This only works within a single process
  return acquireInMemoryLock(key, opts)
}

/**
 * In-memory lock fallback for development
 * WARNING: Does not work across multiple server instances
 */
const inMemoryLocks = new Map<string, Promise<void>>()

async function acquireInMemoryLock(
  key: string,
  options: Required<LockOptions>
): Promise<() => Promise<void>> {
  const startTime = Date.now()

  // Wait for existing lock to be released
  while (inMemoryLocks.has(key)) {
    if (Date.now() - startTime > options.maxWaitTime) {
      throw new Error(`Failed to acquire in-memory lock for key: ${key}`)
    }
    await new Promise((resolve) => setTimeout(resolve, options.retryInterval))
  }

  // Create lock promise
  let releaseLock: () => void
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve
  })

  inMemoryLocks.set(key, lockPromise)

  // Auto-release after timeout
  const timeoutId = setTimeout(() => {
    inMemoryLocks.delete(key)
    releaseLock!()
  }, options.timeout)

  // Return release function
  return async () => {
    clearTimeout(timeoutId)
    inMemoryLocks.delete(key)
    releaseLock!()
  }
}

/**
 * Execute a function with a distributed lock
 * Automatically handles lock acquisition and release
 *
 * @example
 * ```typescript
 * const result = await withLock('currency:USD:EUR', async () => {
 *   return await fetchAndCacheExchangeRate('USD', 'EUR')
 * })
 * ```
 */
export async function withLock<T>(
  key: string,
  fn: () => Promise<T>,
  options?: LockOptions
): Promise<T> {
  const release = await acquireLock(key, options)
  try {
    return await fn()
  } finally {
    await release()
  }
}

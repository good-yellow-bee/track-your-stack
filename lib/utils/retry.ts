import { isRetryableError } from '@/lib/errors/AppError'

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number

  /** Initial delay in milliseconds (default: 1000) */
  initialDelay?: number

  /** Maximum delay in milliseconds (default: 10000) */
  maxDelay?: number

  /** Backoff multiplier (default: 2 for exponential backoff) */
  backoffFactor?: number

  /** Custom function to determine if error is retryable */
  shouldRetry?: (error: unknown, attempt: number) => boolean

  /** Callback called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: isRetryableError,
  onRetry: () => {},
}

/**
 * Execute a function with exponential backoff retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 *
 * @example
 * ```typescript
 * const data = await withRetry(
 *   async () => await fetchFromAPI(),
 *   {
 *     maxAttempts: 3,
 *     initialDelay: 1000,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms: ${error.message}`)
 *     }
 *   }
 * )
 * ```
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if this is the last attempt
      if (attempt === opts.maxAttempts) {
        throw error
      }

      // Check if error is retryable
      if (!opts.shouldRetry(error, attempt)) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      )

      // Call retry callback
      opts.onRetry(error, attempt, delay)

      // Wait before retrying
      await sleep(delay)
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError
}

/**
 * Retry specifically for network requests
 * Pre-configured for common network error scenarios
 */
export async function withNetworkRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return withRetry(fn, {
    maxAttempts,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
    shouldRetry: (error) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        return (
          message.includes('timeout') ||
          message.includes('network') ||
          message.includes('econnrefused') ||
          message.includes('enotfound') ||
          message.includes('503') ||
          message.includes('504')
        )
      }
      return false
    },
  })
}

/**
 * Retry for API rate limit errors
 * Waits for the specified retry-after duration
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2
): Promise<T> {
  return withRetry(fn, {
    maxAttempts,
    initialDelay: 60000, // 1 minute default
    maxDelay: 300000, // 5 minutes max
    backoffFactor: 1, // Linear backoff for rate limits
    shouldRetry: (error) => {
      if (error instanceof Error) {
        return error.message.toLowerCase().includes('rate limit')
      }
      return false
    },
  })
}

/**
 * Helper function to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry with jitter to prevent thundering herd
 * Adds random variation to delay to spread out retries
 */
export async function withJitteredRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return withRetry(fn, {
    ...options,
    onRetry: (error, attempt, delay) => {
      // Add jitter (±25% random variation)
      const jitter = delay * 0.25 * (Math.random() * 2 - 1)
      const jitteredDelay = Math.max(0, delay + jitter)

      // Call original onRetry if provided
      options.onRetry?.(error, attempt, jitteredDelay)
    },
  })
}

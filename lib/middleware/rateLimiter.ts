import { checkRateLimit } from '@/lib/cache/redis'
import { RateLimitError } from '@/lib/errors/AppError'
import { logger, logRateLimit } from '@/lib/logger'

/**
 * Parse window string to milliseconds
 * Examples: "1 m" = 60000, "1 h" = 3600000, "1 d" = 86400000
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*([mhd])$/)
  if (!match) {
    throw new Error(`Invalid window format: ${window}`)
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 'm':
      return value * 60 * 1000 // minutes to ms
    case 'h':
      return value * 60 * 60 * 1000 // hours to ms
    case 'd':
      return value * 24 * 60 * 60 * 1000 // days to ms
    default:
      throw new Error(`Invalid window unit: ${unit}`)
  }
}

/**
 * Rate limit configuration for different operations
 */
export const RATE_LIMITS = {
  // Portfolio operations
  CREATE_PORTFOLIO: { limit: 10, window: '1 m' }, // 10 portfolios per minute
  UPDATE_PORTFOLIO: { limit: 20, window: '1 m' },
  DELETE_PORTFOLIO: { limit: 5, window: '1 m' },

  // Investment operations
  ADD_INVESTMENT: { limit: 30, window: '1 m' }, // 30 investments per minute
  UPDATE_INVESTMENT: { limit: 50, window: '1 m' },
  DELETE_INVESTMENT: { limit: 20, window: '1 m' },
  REFRESH_PRICE: { limit: 10, window: '1 m' }, // Limited by Alpha Vantage API

  // General operations
  SERVER_ACTION: { limit: 100, window: '1 m' }, // General limit for all actions
  EXTERNAL_API: { limit: 5, window: '1 m' }, // Strict limit for external API calls (Alpha Vantage)
} as const

/**
 * Rate limit a Server Action based on user ID
 * Throws RateLimitError if limit exceeded
 *
 * @param userId - User ID for rate limiting
 * @param operation - Operation name (used for logging and different limits)
 * @param customLimit - Optional custom limit override
 *
 * @example
 * ```typescript
 * export async function createPortfolio(input: CreatePortfolioInput) {
 *   const user = await requireAuth()
 *   await rateLimitServerAction(user.id, 'CREATE_PORTFOLIO')
 *   // ... rest of the action
 * }
 * ```
 */
export async function rateLimitServerAction(
  userId: string,
  operation: keyof typeof RATE_LIMITS = 'SERVER_ACTION',
  customLimit?: { limit: number; window: string }
): Promise<void> {
  const identifier = `user:${userId}:${operation}`
  const config = customLimit || RATE_LIMITS[operation]
  const windowMs = parseWindow(config.window)

  const { success, remaining, reset } = await checkRateLimit(identifier, config.limit, windowMs)

  logRateLimit(userId, operation, success, remaining)

  if (!success) {
    const resetDate = new Date(reset)
    const retryAfter = Math.ceil((reset - Date.now()) / 1000) // seconds

    logger.warn(
      {
        userId,
        operation,
        remaining,
        resetDate,
      },
      `Rate limit exceeded for user ${userId} on ${operation}`
    )

    throw new RateLimitError(
      `Too many requests. Please try again after ${resetDate.toLocaleTimeString()}`,
      retryAfter
    )
  }
}

/**
 * Rate limit decorator for Server Actions
 * Automatically applies rate limiting based on operation type
 *
 * @example
 * ```typescript
 * export const createPortfolio = withRateLimit(
 *   'CREATE_PORTFOLIO',
 *   async (input: CreatePortfolioInput) => {
 *     const user = await requireAuth()
 *     // ... rest of the action
 *   }
 * )
 * ```
 */
export function withRateLimit<TArgs extends unknown[], TReturn>(
  operation: keyof typeof RATE_LIMITS,
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    // Extract userId from first argument if it's an object with userId
    const firstArg = args[0]
    let userId: string | undefined

    if (typeof firstArg === 'object' && firstArg !== null && 'userId' in firstArg) {
      userId = (firstArg as { userId: string }).userId
    }

    // If no userId in args, this will be handled by requireAuth in the function
    // We'll use a generic identifier for now
    const identifier = userId || 'anonymous'

    await rateLimitServerAction(identifier, operation)

    return fn(...args)
  }
}

/**
 * IP-based rate limiting (for unauthenticated endpoints)
 * Uses IP address as identifier
 */
export async function rateLimitByIP(
  ip: string,
  operation: string,
  limit: number = 20,
  window: string = '1 m'
): Promise<void> {
  const identifier = `ip:${ip}:${operation}`
  const windowMs = parseWindow(window)

  const { success, remaining, reset } = await checkRateLimit(identifier, limit, windowMs)

  logRateLimit(ip, operation, success, remaining)

  if (!success) {
    const resetDate = new Date(reset)
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)

    logger.warn(
      {
        ip,
        operation,
        remaining,
        resetDate,
      },
      `Rate limit exceeded for IP ${ip} on ${operation}`
    )

    throw new RateLimitError(
      `Too many requests. Please try again after ${resetDate.toLocaleTimeString()}`,
      retryAfter
    )
  }
}

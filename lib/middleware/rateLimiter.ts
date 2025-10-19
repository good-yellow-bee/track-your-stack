// TODO: Implement Redis-based rate limiting
// import { checkRateLimit } from '@/lib/cache/redis'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RateLimitError } from '@/lib/errors/AppError'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { logger, logRateLimit } from '@/lib/logger'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _customLimit?: { limit: number; window: string }
): Promise<void> {
  // TODO: Implement Redis-based rate limiting
  // For now, this is a no-op until Redis is configured
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const identifier = `user:${userId}:${operation}`

  // Stub implementation - always allow requests
  const success = true
  const remaining = 100

  logRateLimit(userId, operation, success, remaining)

  // When Redis is implemented, use:
  // const { success, remaining, reset } = await checkRateLimit(identifier)
  // if (!success) { throw RateLimitError... }
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _limit: number = 20,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _window: string = '1 m'
): Promise<void> {
  // TODO: Implement Redis-based rate limiting
  // For now, this is a no-op until Redis is configured
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const identifier = `ip:${ip}:${operation}`

  // Stub implementation - always allow requests
  const success = true
  const remaining = 20

  logRateLimit(ip, operation, success, remaining)

  // When Redis is implemented, use:
  // const { success, remaining, reset } = await checkRateLimit(identifier)
  // if (!success) { throw RateLimitError... }
}

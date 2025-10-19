import pino from 'pino'
import { getEnv } from '@/lib/env'

/**
 * Create logger instance with appropriate configuration
 * Uses pretty printing in development, JSON in production
 */
function createLogger() {
  const env = getEnv()
  const isDevelopment = env.NODE_ENV === 'development'
  const isTest = env.NODE_ENV === 'test'

  // Suppress logs in test environment
  if (isTest) {
    return pino({ level: 'silent' })
  }

  return pino({
    level: isDevelopment ? 'debug' : 'info',
    // Pretty print in development
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    // Add default fields
    base: {
      env: env.NODE_ENV,
    },
    // Redact sensitive fields
    redact: {
      paths: [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        '*.password',
        '*.token',
        '*.apiKey',
        '*.secret',
      ],
      remove: true,
    },
  })
}

/**
 * Global logger instance
 */
export const logger = createLogger()

/**
 * Create child logger with additional context
 *
 * @example
 * ```typescript
 * const portfolioLogger = createChildLogger({ module: 'portfolio' })
 * portfolioLogger.info({ portfolioId: '123' }, 'Portfolio created')
 * ```
 */
export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings)
}

/**
 * Log levels for convenience
 */
export const LogLevel = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const

/**
 * Helper functions for common logging patterns
 */

/**
 * Log API request
 */
export function logAPIRequest(method: string, url: string, params?: Record<string, unknown>) {
  logger.info(
    {
      type: 'api_request',
      method,
      url,
      params,
    },
    `API Request: ${method} ${url}`
  )
}

/**
 * Log API response
 */
export function logAPIResponse(method: string, url: string, statusCode: number, duration: number) {
  const level = statusCode >= 400 ? 'warn' : 'info'
  logger[level](
    {
      type: 'api_response',
      method,
      url,
      statusCode,
      duration,
    },
    `API Response: ${method} ${url} ${statusCode} (${duration}ms)`
  )
}

/**
 * Log database query
 */
export function logDatabaseQuery(
  operation: string,
  model: string,
  duration: number,
  error?: Error
) {
  if (error) {
    logger.error(
      {
        type: 'database_query',
        operation,
        model,
        duration,
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
      `Database Error: ${operation} ${model}`
    )
  } else {
    logger.debug(
      {
        type: 'database_query',
        operation,
        model,
        duration,
      },
      `Database Query: ${operation} ${model} (${duration}ms)`
    )
  }
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  event: 'signin' | 'signout' | 'signup' | 'error',
  userId?: string,
  error?: Error
) {
  const level = error ? 'error' : 'info'
  logger[level](
    {
      type: 'auth_event',
      event,
      userId,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    },
    `Auth Event: ${event}${userId ? ` (${userId})` : ''}`
  )
}

/**
 * Log server action execution
 */
export function logServerAction(
  action: string,
  userId: string,
  duration: number,
  success: boolean,
  error?: Error
) {
  const level = error ? 'error' : 'info'
  logger[level](
    {
      type: 'server_action',
      action,
      userId,
      duration,
      success,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    },
    `Server Action: ${action} ${success ? 'succeeded' : 'failed'} (${duration}ms)`
  )
}

/**
 * Log rate limit event
 */
export function logRateLimit(
  identifier: string,
  resource: string,
  allowed: boolean,
  remaining?: number
) {
  logger.warn(
    {
      type: 'rate_limit',
      identifier,
      resource,
      allowed,
      remaining,
    },
    `Rate Limit: ${resource} ${allowed ? 'allowed' : 'exceeded'} for ${identifier}`
  )
}

/**
 * Log cache event
 */
export function logCacheEvent(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  ttl?: number
) {
  logger.debug(
    {
      type: 'cache_event',
      operation,
      key,
      ttl,
    },
    `Cache ${operation}: ${key}`
  )
}

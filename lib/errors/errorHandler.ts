/**
 * Centralized error handling and sanitization
 * Prevents sensitive information leakage in production
 */

import { isSentryConfigured } from '@/lib/env'

/**
 * Sanitize error for client response
 * Removes stack traces and sensitive details in production
 */
export function sanitizeError(error: unknown): {
  message: string
  code?: string
  statusCode: number
} {
  const isProd = process.env.NODE_ENV === 'production'

  // Handle known error types
  if (error instanceof Error) {
    // Rate limit errors
    if (error.constructor.name === 'RateLimitError') {
      return {
        message: error.message,
        code: 'RATE_LIMIT_EXCEEDED',
        statusCode: 429,
      }
    }

    // Prisma errors
    if ('code' in error) {
      const prismaError = error as any
      switch (prismaError.code) {
        case 'P2002':
          return {
            message: 'A record with this information already exists',
            code: 'DUPLICATE_RECORD',
            statusCode: 409,
          }
        case 'P2025':
          return {
            message: 'Record not found',
            code: 'NOT_FOUND',
            statusCode: 404,
          }
        case 'P2003':
          return {
            message: 'Invalid reference',
            code: 'INVALID_REFERENCE',
            statusCode: 400,
          }
        default:
          return {
            message: isProd ? 'Database error occurred' : prismaError.message,
            code: 'DATABASE_ERROR',
            statusCode: 500,
          }
      }
    }

    // Zod validation errors
    if (error.constructor.name === 'ZodError') {
      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      }
    }

    // Generic error
    return {
      message: isProd ? 'An error occurred' : error.message,
      statusCode: 500,
    }
  }

  // Unknown error type
  return {
    message: isProd ? 'An unexpected error occurred' : String(error),
    statusCode: 500,
  }
}

/**
 * Log error to monitoring service (Sentry)
 * Only logs in production if Sentry is configured
 */
export function logError(error: unknown, context?: Record<string, any>) {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error)
    if (context) {
      console.error('Context:', context)
    }
  }

  // Log to Sentry in production if configured
  if (process.env.NODE_ENV === 'production' && isSentryConfigured()) {
    try {
      // Dynamic import to avoid loading Sentry in development
      // void operator explicitly marks this as an intentional floating promise
      void import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error, {
          extra: context,
        })
      })
    } catch (sentryError) {
      console.error('Failed to log to Sentry:', sentryError)
    }
  }
}

/**
 * Sanitize log data to remove PII and sensitive information
 */
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'session',
    'email',
    'phone',
    'ssn',
    'creditCard',
    'credit_card',
  ]

  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()

    // Check if key contains sensitive information
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeLogData(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Safe logger that sanitizes data before logging
 */
export const safeLogger = {
  info: (message: string, data?: Record<string, any>) => {
    const sanitized = data ? sanitizeLogData(data) : undefined
    console.log(`[INFO] ${message}`, sanitized)
  },

  warn: (message: string, data?: Record<string, any>) => {
    const sanitized = data ? sanitizeLogData(data) : undefined
    console.warn(`[WARN] ${message}`, sanitized)
  },

  error: (message: string, error: unknown, data?: Record<string, any>) => {
    const sanitized = data ? sanitizeLogData(data) : undefined
    console.error(`[ERROR] ${message}`, error, sanitized)
    logError(error, sanitized)
  },
}

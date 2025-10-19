/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  /**
   * HTTP status code associated with this error
   */
  public readonly statusCode: number

  /**
   * Error code for client-side handling
   */
  public readonly code: string

  /**
   * Whether this error is operational (expected) or programming error
   */
  public readonly isOperational: boolean

  /**
   * Additional context data
   */
  public readonly context?: Record<string, unknown>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.context = context

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, unknown>) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, context)
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden', context?: Record<string, unknown>) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, context)
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', true, context)
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true, context)
  }
}

/**
 * Rate limit exceeded errors (429)
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    context?: Record<string, unknown>
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, {
      ...context,
      retryAfter,
    })
  }
}

/**
 * External API errors (502/503)
 */
export class ExternalAPIError extends AppError {
  constructor(
    service: string,
    message: string,
    public readonly isRetryable: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(`${service}: ${message}`, isRetryable ? 503 : 502, 'EXTERNAL_API_ERROR', true, {
      ...context,
      service,
      isRetryable,
    })
  }
}

/**
 * Database errors (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, 'DATABASE_ERROR', true, context)
  }
}

/**
 * Configuration errors (500)
 * These are programming errors, not operational errors
 */
export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, 'CONFIGURATION_ERROR', false, context)
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ExternalAPIError) {
    return error.isRetryable
  }

  if (error instanceof RateLimitError) {
    return true
  }

  // Network errors are typically retryable
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    )
  }

  return false
}

import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { fromZodError } from 'zod-validation-error'
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  ExternalAPIError,
  isAppError,
} from './AppError'

import { ActionResult } from '@/lib/types/actions'

/**
 * Convert any error to an AppError
 * Normalizes errors from different sources (Zod, Prisma, Axios, etc.)
 */
export function normalizeError(error: unknown): AppError {
  // Already an AppError
  if (isAppError(error)) {
    return error
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationError = fromZodError(error)
    return new ValidationError(validationError.message, {
      issues: error.issues,
    })
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new ValidationError('A record with this value already exists', {
          field: error.meta?.target,
        })
      case 'P2025':
        return new NotFoundError('Record', { code: error.code })
      case 'P2003':
        return new ValidationError('Invalid reference to related record', {
          field: error.meta?.field_name,
        })
      default:
        return new DatabaseError(`Database error: ${error.message}`, {
          code: error.code,
        })
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data provided', {
      details: error.message,
    })
  }

  // Standard Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
      return new AuthenticationError(error.message)
    }

    if (error.message.includes('Forbidden') || error.message.includes('Authorization')) {
      return new AuthorizationError(error.message)
    }

    if (error.message.includes('not found')) {
      return new NotFoundError(error.message)
    }

    // Network/API errors
    if (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED')
    ) {
      return new ExternalAPIError('Network', error.message, true)
    }

    // Generic error
    return new AppError(error.message, 500, 'INTERNAL_ERROR', true)
  }

  // Unknown error type
  return new AppError('An unexpected error occurred', 500, 'UNKNOWN_ERROR', true, {
    originalError: String(error),
  })
}

/**
 * Convert error to ActionResult format for Server Actions
 * Provides consistent error responses to client components
 */
export function errorToActionResult<T = void>(error: unknown): ActionResult<T> {
  const appError = normalizeError(error)

  return {
    success: false,
    error: appError.message,
  }
}

/**
 * Log error with appropriate level based on error type
 * Should be used with structured logger (Pino)
 */
export function getErrorLogLevel(error: AppError): 'error' | 'warn' | 'info' {
  // Non-operational errors are always logged as errors
  if (!error.isOperational) {
    return 'error'
  }

  // Client errors (4xx) are warnings
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return 'warn'
  }

  // Server errors (5xx) are errors
  return 'error'
}

/**
 * Check if error should be reported to Sentry
 * Filters out expected errors to reduce noise
 */
export function shouldReportError(error: AppError): boolean {
  // Don't report operational errors with 4xx status codes
  if (error.isOperational && error.statusCode >= 400 && error.statusCode < 500) {
    return false
  }

  // Don't report validation errors
  if (error instanceof ValidationError) {
    return false
  }

  // Don't report authentication errors (expected)
  if (error instanceof AuthenticationError) {
    return false
  }

  // Don't report authorization errors (expected)
  if (error instanceof AuthorizationError) {
    return false
  }

  // Don't report not found errors (expected)
  if (error instanceof NotFoundError) {
    return false
  }

  // Report everything else
  return true
}

/**
 * Extract user-safe error message
 * Removes sensitive information and provides friendly messages
 */
export function getUserMessage(error: AppError): string {
  // Use custom message for known error types
  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof AuthenticationError) {
    return 'Please sign in to continue'
  }

  if (error instanceof AuthorizationError) {
    return "You don't have permission to perform this action"
  }

  if (error instanceof NotFoundError) {
    return error.message
  }

  if (error instanceof ExternalAPIError) {
    return 'External service temporarily unavailable. Please try again later.'
  }

  if (error instanceof DatabaseError) {
    return 'A database error occurred. Please try again.'
  }

  // Generic message for other errors
  return 'An unexpected error occurred. Please try again.'
}

# Error Handling Guide

## Overview

Track Your Stack implements a comprehensive error handling system with custom error classes, structured logging, automatic retry logic, and user-friendly error messages.

## Error Classes

All custom errors extend `AppError` base class:

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ExternalAPIError,
  DatabaseError,
  ConfigurationError,
} from '@/lib/errors/AppError'
```

### Error Class Reference

| Error Class           | Status Code | Use Case                  | Retryable          |
| --------------------- | ----------- | ------------------------- | ------------------ |
| `AuthenticationError` | 401         | User not signed in        | No                 |
| `AuthorizationError`  | 403         | User lacks permission     | No                 |
| `ValidationError`     | 400         | Invalid input data        | No                 |
| `NotFoundError`       | 404         | Resource doesn't exist    | No                 |
| `RateLimitError`      | 429         | Too many requests         | Yes (with delay)   |
| `ExternalAPIError`    | 502/503     | External API failure      | Yes (if transient) |
| `DatabaseError`       | 500         | Database operation failed | Sometimes          |
| `ConfigurationError`  | 500         | App misconfiguration      | No                 |

## Server Action Error Handling

### Standard Pattern

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { errorToActionResult, normalizeError } from '@/lib/errors/errorHandler'
import { logger, logServerAction } from '@/lib/logger'
import { rateLimitServerAction } from '@/lib/middleware/rateLimiter'

export async function myServerAction(input: MyInput): Promise<ActionResult<MyOutput>> {
  const startTime = Date.now()
  let userId: string | undefined

  try {
    // 1. Authenticate
    const user = await requireAuth()
    userId = user.id

    // 2. Rate limit
    await rateLimitServerAction(user.id, 'MY_OPERATION')

    // 3. Validate input
    const validated = myInputSchema.parse(input)

    // 4. Perform operation
    const result = await performOperation(validated)

    // 5. Log success
    const duration = Date.now() - startTime
    logServerAction('myServerAction', user.id, duration, true)

    return {
      success: true,
      data: result,
      message: 'Operation completed successfully',
    }
  } catch (error) {
    // 6. Handle error
    const duration = Date.now() - startTime
    const appError = normalizeError(error)

    logger.error(
      {
        error: {
          message: appError.message,
          code: appError.code,
          stack: appError.stack,
        },
        userId,
        duration,
      },
      'Operation failed'
    )

    if (userId) {
      logServerAction('myServerAction', userId, duration, false, appError)
    }

    return errorToActionResult(error)
  }
}
```

### Throwing Custom Errors

```typescript
import { NotFoundError, AuthorizationError } from '@/lib/errors/AppError'

// Resource not found
const portfolio = await prisma.portfolio.findUnique({ where: { id } })
if (!portfolio) {
  throw new NotFoundError('Portfolio')
}

// Authorization check
if (portfolio.userId !== user.id) {
  throw new AuthorizationError('You do not own this portfolio')
}
```

## Client-Side Error Handling

### Handling ActionResult

```typescript
'use client'

import { createPortfolio } from '@/lib/actions/portfolio'
import { toasts } from '@/lib/utils/toast'

async function handleSubmit(formData: FormData) {
  const result = await createPortfolio({
    name: formData.get('name') as string,
    baseCurrency: formData.get('currency') as string,
  })

  if (result.success) {
    toasts.portfolio.created()
    router.push(`/portfolios/${result.data.id}`)
  } else {
    // Handle specific error codes
    switch (result.code) {
      case 'AUTHENTICATION_ERROR':
        toasts.authError()
        router.push('/auth/signin')
        break

      case 'AUTHORIZATION_ERROR':
        toasts.forbidden()
        break

      case 'VALIDATION_ERROR':
        toasts.validation.error(result.error)
        break

      case 'RATE_LIMIT_ERROR':
        toasts.rateLimitError()
        break

      default:
        toasts.error(result.error)
    }
  }
}
```

### Error Code Reference

```typescript
// Authentication & Authorization
'AUTHENTICATION_ERROR' // User not signed in
'AUTHORIZATION_ERROR' // User lacks permission

// Validation
'VALIDATION_ERROR' // Invalid input data

// Resources
'NOT_FOUND' // Resource doesn't exist

// Rate Limiting
'RATE_LIMIT_ERROR' // Too many requests

// External Services
'EXTERNAL_API_ERROR' // Alpha Vantage API failure

// Database
'DATABASE_ERROR' // Database operation failed

// Configuration
'CONFIGURATION_ERROR' // App misconfiguration

// Generic
'INTERNAL_ERROR' // Unexpected error
'UNKNOWN_ERROR' // Unknown error type
```

## Retry Logic

### Automatic Retry with Exponential Backoff

```typescript
import { withRetry, withNetworkRetry } from '@/lib/utils/retry'

// Generic retry
const data = await withRetry(async () => await fetchFromAPI(), {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  onRetry: (error, attempt, delay) => {
    logger.warn({ error, attempt, delay }, 'Retrying operation')
  },
})

// Network-specific retry (pre-configured)
const data = await withNetworkRetry(
  async () => await fetchFromAPI(),
  3 // maxAttempts
)
```

### Custom Retry Logic

```typescript
import { withRetry } from '@/lib/utils/retry'
import { isRetryableError } from '@/lib/errors/AppError'

const data = await withRetry(async () => await performOperation(), {
  maxAttempts: 5,
  initialDelay: 2000,
  maxDelay: 30000,
  backoffFactor: 2,
  shouldRetry: (error, attempt) => {
    // Custom retry logic
    if (attempt > 3) return false
    return isRetryableError(error)
  },
})
```

### Retry with Jitter

Prevents thundering herd problem:

```typescript
import { withJitteredRetry } from '@/lib/utils/retry'

const data = await withJitteredRetry(async () => await fetchFromAPI(), { maxAttempts: 3 })
```

## Error Normalization

### Automatic Error Conversion

The `normalizeError` function converts various error types to `AppError`:

```typescript
import { normalizeError } from '@/lib/errors/errorHandler'

try {
  // Zod validation error
  const validated = schema.parse(input)
} catch (error) {
  const appError = normalizeError(error)
  // Returns ValidationError with user-friendly message
}

try {
  // Prisma error
  await prisma.portfolio.create({ data })
} catch (error) {
  const appError = normalizeError(error)
  // Returns DatabaseError or ValidationError
}
```

### Supported Error Types

- **Zod Errors:** Converted to `ValidationError`
- **Prisma Errors:** Converted to `DatabaseError` or `ValidationError`
- **Axios Errors:** Converted to `ExternalAPIError`
- **Standard Errors:** Analyzed and converted to appropriate type

## Logging

### Structured Error Logging

```typescript
import { logger } from '@/lib/logger'

// Error with context
logger.error(
  {
    error: {
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    userId: user.id,
    portfolioId: portfolio.id,
    operation: 'createPortfolio',
  },
  'Failed to create portfolio'
)

// Warning for expected errors
logger.warn(
  {
    userId: user.id,
    operation: 'CREATE_PORTFOLIO',
  },
  'Rate limit exceeded'
)
```

### Log Levels

- **trace:** Very detailed debugging
- **debug:** Debugging information
- **info:** Informational messages
- **warn:** Warning messages (expected errors)
- **error:** Error messages (unexpected errors)
- **fatal:** Fatal errors (app crash)

## Error Reporting

### Sentry Integration (Future)

When Sentry is configured, errors are automatically reported:

```typescript
import { shouldReportError } from '@/lib/errors/errorHandler'

if (shouldReportError(appError)) {
  // Error will be sent to Sentry
  Sentry.captureException(appError, {
    extra: appError.context,
  })
}
```

### Errors NOT Reported to Sentry

- Authentication errors (expected)
- Authorization errors (expected)
- Validation errors (expected)
- Not found errors (expected)
- 4xx errors in general (client errors)

### Errors Reported to Sentry

- 5xx errors (server errors)
- External API failures
- Database errors
- Unexpected errors

## Best Practices

### 1. Always Use Try-Catch in Server Actions

```typescript
export async function myAction() {
  try {
    // Operation
  } catch (error) {
    return errorToActionResult(error)
  }
}
```

### 2. Throw Specific Errors

```typescript
// Good: Specific error
throw new NotFoundError('Portfolio')

// Bad: Generic error
throw new Error('Not found')
```

### 3. Add Context to Errors

```typescript
throw new DatabaseError('Failed to create portfolio', {
  userId: user.id,
  portfolioName: input.name,
})
```

### 4. Log Before Throwing

```typescript
logger.error({ userId, portfolioId }, 'Portfolio not found')
throw new NotFoundError('Portfolio')
```

### 5. Use Retry for Transient Failures

```typescript
// Good: Retry transient failures
const data = await withNetworkRetry(() => fetchFromAPI())

// Bad: No retry for network errors
const data = await fetchFromAPI()
```

### 6. Provide User-Friendly Messages

```typescript
// Good: User-friendly
throw new ValidationError('Portfolio name must be between 1 and 100 characters')

// Bad: Technical jargon
throw new Error('String length validation failed at path: name')
```

### 7. Handle Errors in Client Components

```typescript
// Good: Specific error handling
if (!result.success) {
  if (result.code === 'RATE_LIMIT_ERROR') {
    toasts.rateLimitError()
  } else {
    toasts.error(result.error)
  }
}

// Bad: Generic error handling
if (!result.success) {
  alert('Error!')
}
```

## Testing Error Handling

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { normalizeError } from '@/lib/errors/errorHandler'
import { ValidationError } from '@/lib/errors/AppError'

describe('Error Handling', () => {
  it('converts Zod errors to ValidationError', () => {
    const zodError = new ZodError([...])
    const appError = normalizeError(zodError)

    expect(appError).toBeInstanceOf(ValidationError)
    expect(appError.statusCode).toBe(400)
  })
})
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest'
import { createPortfolio } from '@/lib/actions/portfolio'

describe('Portfolio Actions', () => {
  it('returns validation error for invalid input', async () => {
    const result = await createPortfolio({
      name: '', // Invalid: empty name
      baseCurrency: 'USD',
    })

    expect(result.success).toBe(false)
    expect(result.code).toBe('VALIDATION_ERROR')
  })
})
```

## Troubleshooting

### Error Not Being Caught

**Problem:** Error bypasses try-catch

**Solution:** Ensure async/await is used correctly:

```typescript
// Wrong: Promise not awaited
try {
  performOperation() // Missing await!
} catch (error) {
  // Never caught
}

// Correct: Promise awaited
try {
  await performOperation()
} catch (error) {
  // Caught correctly
}
```

### Error Lost in Promise Chain

**Problem:** Error not propagated

**Solution:** Always return or await promises:

```typescript
// Wrong: Promise not returned
async function wrapper() {
  performOperation() // Error lost!
}

// Correct: Promise returned
async function wrapper() {
  return await performOperation()
}
```

### Retry Not Working

**Problem:** Operation retried but still fails

**Solution:** Check if error is retryable:

```typescript
import { isRetryableError } from '@/lib/errors/AppError'

if (!isRetryableError(error)) {
  // Error is not retryable, don't retry
  throw error
}
```

## Resources

- [Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)
- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)

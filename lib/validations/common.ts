import { z } from 'zod'

/**
 * Common validation utilities and transformations
 */

/**
 * Trim and normalize string input
 * Removes leading/trailing whitespace and collapses multiple spaces
 */
export const trimmedString = (schema: z.ZodString = z.string()) =>
  schema.transform((val) => val.trim().replace(/\s+/g, ' '))

/**
 * Non-empty trimmed string
 */
export const nonEmptyString = (message: string = 'This field is required') =>
  trimmedString(z.string().min(1, message))

/**
 * Uppercase string (for tickers, currency codes)
 */
export const uppercaseString = (schema: z.ZodString = z.string()) =>
  schema.transform((val) => val.toUpperCase().trim())

/**
 * Positive number validation
 */
export const positiveNumber = (fieldName: string = 'Value') =>
  z.number().positive(`${fieldName} must be greater than 0`)

/**
 * Non-negative number validation
 */
export const nonNegativeNumber = (fieldName: string = 'Value') =>
  z.number().min(0, `${fieldName} cannot be negative`)

/**
 * Currency code validation (ISO 4217)
 */
export const currencyCode = z
  .string()
  .length(3, 'Currency code must be 3 characters')
  .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters')
  .transform((val) => val.toUpperCase())

/**
 * Ticker symbol validation
 * Allows 1-10 alphanumeric characters, dots, and hyphens
 */
export const tickerSymbol = z
  .string()
  .min(1, 'Ticker symbol is required')
  .max(10, 'Ticker symbol must be 10 characters or less')
  .regex(/^[A-Z0-9.-]+$/, 'Ticker symbol must contain only letters, numbers, dots, and hyphens')
  .transform((val) => val.toUpperCase().trim())

/**
 * Date string validation (ISO 8601 or common formats)
 */
export const dateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
  .transform((val) => new Date(val).toISOString())

/**
 * Optional date string
 */
export const optionalDateString = z
  .string()
  .optional()
  .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format')
  .transform((val) => (val ? new Date(val).toISOString() : undefined))

/**
 * Sanitize HTML/script tags from input
 */
export const sanitizedString = (schema: z.ZodString = z.string()) =>
  schema.transform((val) => {
    // Remove HTML tags
    let sanitized = val.replace(/<[^>]*>/g, '')
    // Remove script tags and content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Trim and normalize whitespace
    return sanitized.trim().replace(/\s+/g, ' ')
  })

/**
 * Portfolio name validation
 */
export const portfolioName = z
  .string()
  .min(1, 'Portfolio name is required')
  .max(100, 'Portfolio name must be 100 characters or less')
  .transform((val) => val.trim().replace(/\s+/g, ' '))
  .refine((val: string) => !/^\s*$/.test(val), 'Portfolio name cannot be only whitespace')

/**
 * Asset name validation
 */
export const assetName = z
  .string()
  .min(1, 'Asset name is required')
  .max(200, 'Asset name must be 200 characters or less')
  .transform((val) => val.trim().replace(/\s+/g, ' '))

/**
 * Notes validation (optional, sanitized)
 */
export const notes = z
  .string()
  .max(500, 'Notes must be 500 characters or less')
  .transform((val) => {
    let sanitized = val.replace(/<[^>]*>/g, '')
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    return sanitized.trim().replace(/\s+/g, ' ')
  })
  .optional()

/**
 * CUID validation
 */
export const cuid = z.string().regex(/^c[a-z0-9]{24}$/i, 'Invalid ID format')

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
})

/**
 * Sort order validation
 */
export const sortOrder = z.enum(['asc', 'desc']).default('desc')

/**
 * Financial amount validation
 * Ensures precision and reasonable limits
 */
export const financialAmount = z
  .number()
  .positive('Amount must be greater than 0')
  .finite('Amount must be a finite number')
  .refine((val) => {
    // Check if number has more than 8 decimal places
    const str = val.toString()
    const decimalIndex = str.indexOf('.')
    if (decimalIndex === -1) return true
    return str.length - decimalIndex - 1 <= 8
  }, 'Amount cannot have more than 8 decimal places')
  .refine(
    (val) => val < 1e12, // 1 trillion
    'Amount is too large'
  )

/**
 * Quantity validation (for shares/units)
 */
export const quantity = financialAmount

/**
 * Price validation
 */
export const price = financialAmount

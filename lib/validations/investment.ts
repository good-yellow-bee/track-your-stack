import { z } from 'zod'
import { AssetType } from '@prisma/client'

// Ticker validation: alphanumeric, 1-10 characters, uppercase
const tickerSchema = z
  .string()
  .trim()
  .min(1, 'Ticker is required')
  .max(10, 'Ticker must be 10 characters or less')
  .regex(/^[A-Z0-9]+$/, 'Ticker must contain only letters and numbers')
  .transform((val) => val.toUpperCase())

// Purchase date validation: ISO-8601, not in future, not before 1900
const purchaseDateSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      // Check ISO-8601 format (YYYY-MM-DD)
      return /^\d{4}-\d{2}-\d{2}$/.test(val)
    },
    { message: 'Purchase date must be in YYYY-MM-DD format' }
  )
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      const date = new Date(val)
      const now = new Date()
      now.setHours(23, 59, 59, 999) // End of today
      return date <= now
    },
    { message: 'Purchase date cannot be in the future' }
  )
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      const date = new Date(val)
      const minDate = new Date('1900-01-01')
      return date >= minDate
    },
    { message: 'Purchase date cannot be before 1900' }
  )

export const addInvestmentSchema = z.object({
  ticker: z.preprocess(
    (val) => (val === null || val === undefined ? '' : String(val).toUpperCase()),
    tickerSchema
  ),
  assetName: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string().trim().min(1, 'Asset name is required').max(200)
  ),
  assetType: z.nativeEnum(AssetType),
  quantity: z.coerce.number().positive('Quantity must be a positive number'),
  pricePerUnit: z.coerce.number().positive('Price per unit must be a positive number'),
  currency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: purchaseDateSchema,
  notes: z.string().max(500).optional(),
})

export const updateInvestmentSchema = z.object({
  assetName: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string().trim().min(1, 'Asset name is required').max(200)
  ),
  assetType: z.nativeEnum(AssetType),
})

export type AddInvestmentInput = z.infer<typeof addInvestmentSchema>
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>

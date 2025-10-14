import { z } from 'zod'
import { CURRENCIES } from '@/lib/constants'

// Extract currency codes for validation
const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]]

export const createPortfolioSchema = z.object({
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.enum(CURRENCY_CODES, {
    message: 'Invalid currency code',
  }),
})

export const updatePortfolioSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.enum(CURRENCY_CODES, {
    message: 'Invalid currency code',
  }),
})

export const deletePortfolioSchema = z.object({
  id: z.string().cuid(),
})

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>
export type DeletePortfolioInput = z.infer<typeof deletePortfolioSchema>

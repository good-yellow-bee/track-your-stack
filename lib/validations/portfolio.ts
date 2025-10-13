import { z } from 'zod'

export const createPortfolioSchema = z.object({
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.string().min(3).max(3),
})

export const updatePortfolioSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.string().min(3).max(3),
})

export const deletePortfolioSchema = z.object({
  id: z.string().cuid(),
})

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>
export type DeletePortfolioInput = z.infer<typeof deletePortfolioSchema>

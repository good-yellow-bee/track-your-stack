import { z } from 'zod'
import { AssetType } from '@prisma/client'

export const addInvestmentSchema = z.object({
  ticker: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .trim()
      .min(1, 'Ticker is required')
      .max(20)
      .transform((val) => val.toUpperCase())
  ),
  assetName: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string().trim().min(1, 'Asset name is required').max(200)
  ),
  assetType: z.nativeEnum(AssetType),
  quantity: z.coerce.number().positive('Quantity must be a positive number'),
  pricePerUnit: z.coerce.number().positive('Price per unit must be a positive number'),
  currency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.string().optional(),
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

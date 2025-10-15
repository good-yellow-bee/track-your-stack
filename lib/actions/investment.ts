'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssetType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { z } from 'zod'

type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Validation schemas
const AddInvestmentSchema = z.object({
      .string()
      .trim()
      .min(1, 'Ticker is required')
      .max(20)
  assetType: z.nativeEnum(AssetType),
  currency: z.string().length(3, 'Invalid currency code'),
  purchaseDate: z.string().optional(),
  notes: z.string().max(500).optional(),
})

const UpdateInvestmentSchema = z.object({
  assetName: z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z.string().trim().min(1, 'Asset name is required').max(200)
  ),
  assetType: z.nativeEnum(AssetType),
})

/**
 * Add a new investment to a portfolio
 * If the ticker already exists, aggregates with weighted average cost basis
 */
export async function addInvestment(
  portfolioId: string,
  formData: FormData
): Promise<ActionResult<{ id: string; aggregated: boolean }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify portfolio ownership
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    return { success: false, error: 'Portfolio not found' }
  }

  if (portfolio.userId !== session.user.id) {
    return { success: false, error: 'Forbidden' }
  }

  const validated = AddInvestmentSchema.safeParse({
  })

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input',
    }
  }

  const {
    ticker,
    assetName,
    assetType,
    quantity: validatedQuantity,
    pricePerUnit: validatedPrice,
    currency,
    purchaseDate,
    notes,
  } = validated.data

  try {
    // Check if investment already exists for this ticker
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        portfolioId,
        ticker,
      },
    })

    let investmentId: string
    let aggregated = false

    if (existingInvestment) {
      // Aggregate with weighted average cost basis using Decimal arithmetic
      // to prevent floating-point precision errors
      const existingQty = existingInvestment.totalQuantity
      const existingAvg = existingInvestment.averageCostBasis
      const newQty = new Decimal(validatedQuantity)
      const newPrice = new Decimal(validatedPrice)

      // Calculate: totalQty = existingQty + newQty
      const totalQty = existingQty.plus(newQty)

      // Calculate: totalCost = (existingQty * existingAvg) + (newQty * newPrice)
      const totalCost = existingQty.times(existingAvg).plus(newQty.times(newPrice))

      // Calculate: newAvgCostBasis = totalCost / totalQty
      const newAvgCostBasis = totalCost.dividedBy(totalQty)

      // Use transaction to ensure atomicity: both investment update and
      // purchase transaction creation must succeed or both fail
      await prisma.$transaction([
        prisma.investment.update({
          where: { id: existingInvestment.id },
          data: {
            totalQuantity: totalQty,
            averageCostBasis: newAvgCostBasis,
          },
        }),
        prisma.purchaseTransaction.create({
          data: {
            investmentId: existingInvestment.id,
            quantity: new Decimal(validatedQuantity),
            pricePerUnit: new Decimal(validatedPrice),
            currency,
            purchaseDate: purchaseDate && purchaseDate.trim() ? new Date(purchaseDate) : new Date(),
            notes: notes || null,
          },
        }),
      ])

      investmentId = existingInvestment.id
      aggregated = true
    } else {
      // Create new investment with purchase transaction atomically
      const result = await prisma.$transaction(async (tx) => {
        const newInvestment = await tx.investment.create({
          data: {
            portfolioId,
            ticker,
            assetName,
            assetType,
            totalQuantity: new Decimal(validatedQuantity),
            averageCostBasis: new Decimal(validatedPrice),
            purchaseCurrency: currency,
          },
        })

        await tx.purchaseTransaction.create({
          data: {
            investmentId: newInvestment.id,
            quantity: new Decimal(validatedQuantity),
            pricePerUnit: new Decimal(validatedPrice),
            currency,
            purchaseDate: purchaseDate && purchaseDate.trim() ? new Date(purchaseDate) : new Date(),
            notes: notes || null,
          },
        })

        return newInvestment
      })

      investmentId = result.id
    }

    revalidatePath(`/portfolios/${portfolioId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { id: investmentId, aggregated },
      message: aggregated
        ? `${ticker}: ${validatedQuantity} shares aggregated`
        : `${ticker} added to portfolio`,
    }
  } catch (error) {
    console.error('Failed to add investment:', error)
    return { success: false, error: 'Failed to add investment' }
  }
}

/**
 * Update an existing investment
 */
export async function updateInvestment(
  investmentId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify ownership through portfolio
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { portfolio: { select: { userId: true } } },
  })

  if (!investment) {
    return { success: false, error: 'Investment not found' }
  }

  if (investment.portfolio.userId !== session.user.id) {
    return { success: false, error: 'Forbidden' }
  }


  try {
    await prisma.investment.update({
      where: { id: investmentId },
      data: {
      },
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)
    return {
      success: true,
      message: `${investment.ticker} updated`,
    }
  } catch (error) {
    console.error('Failed to update investment:', error)
    return { success: false, error: 'Failed to update investment' }
  }
}

/**
 * Remove an investment from a portfolio
 */
export async function deleteInvestment(
  investmentId: string
): Promise<ActionResult<{ ticker: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify ownership through portfolio
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { portfolio: { select: { userId: true } } },
  })

  if (!investment) {
    return { success: false, error: 'Investment not found' }
  }

  if (investment.portfolio.userId !== session.user.id) {
    return { success: false, error: 'Forbidden' }
  }

  try {
    await prisma.investment.delete({
      where: { id: investmentId },
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { ticker: investment.ticker },
      message: `${investment.ticker} removed from portfolio`,
    }
  } catch (error) {
    console.error('Failed to delete investment:', error)
    return { success: false, error: 'Failed to remove investment' }
  }
}

/**
 * Refresh current price for an investment
 */
export async function refreshInvestmentPrice(
  investmentId: string
): Promise<ActionResult<{ price: number }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify ownership through portfolio
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: { portfolio: { select: { userId: true } } },
  })

  if (!investment) {
    return { success: false, error: 'Investment not found' }
  }

  if (investment.portfolio.userId !== session.user.id) {
    return { success: false, error: 'Forbidden' }
  }

  try {
    // TODO: Integrate with Alpha Vantage API to fetch real price
    // For now, this is a placeholder that returns the current stored price
    // In production, this would call lib/api/alphaVantage.ts

    // Placeholder: Just update the priceUpdatedAt timestamp
    const updatedInvestment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        priceUpdatedAt: new Date(),
      },
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)

    return {
      success: true,
      data: { price: updatedInvestment.currentPrice?.toNumber() || 0 },
      message: 'Price refreshed',
    }
  } catch (error) {
    console.error('Failed to refresh price:', error)
    return { success: false, error: 'Failed to refresh price' }
  }
}

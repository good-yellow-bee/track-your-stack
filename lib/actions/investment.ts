'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { ActionResult } from '@/lib/types/actions'
import { addInvestmentSchema, updateInvestmentSchema } from '@/lib/validations/investment'
import { getAssetPrice } from '@/lib/services/priceService'

/**
 * Add a new investment to a portfolio
 * If the ticker already exists, aggregates with weighted average cost basis
 * @param portfolioId - The portfolio ID to add investment to
 * @param formData - Form data containing investment details
 * @returns ActionResult with investment ID and aggregation status
 */
export async function addInvestment(
  portfolioId: string,
  formData: FormData
): Promise<ActionResult<{ id: string; aggregated: boolean }>> {
  try {
    const user = await requireAuth()

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { userId: true },
    })

    if (!portfolio) {
      return { success: false, error: 'Portfolio not found' }
    }

    if (portfolio.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    // Extract and validate form data using Zod (handles type coercion and validation)
    const validated = addInvestmentSchema.safeParse({
      ticker: formData.get('ticker'),
      assetName: formData.get('assetName'),
      assetType: formData.get('assetType'),
      quantity: formData.get('quantity'), // Zod will coerce string to number
      pricePerUnit: formData.get('pricePerUnit'), // Zod will coerce string to number
      currency: formData.get('currency') || 'USD',
      purchaseDate: formData.get('purchaseDate') || undefined,
      notes: formData.get('notes') || undefined,
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
    console.error('Failed to add investment:', {
      error,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to add investment' }
  }
}

/**
 * Update an existing investment's metadata
 * @param investmentId - The investment ID to update
 * @param formData - Form data containing updated asset name and type
 * @returns ActionResult indicating success or error
 */
export async function updateInvestment(
  investmentId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth()

    // Verify ownership through portfolio
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { portfolio: { select: { userId: true } } },
    })

    if (!investment) {
      return { success: false, error: 'Investment not found' }
    }

    if (investment.portfolio.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    // Validate form data
    const validated = updateInvestmentSchema.safeParse({
      assetName: formData.get('assetName'),
      assetType: formData.get('assetType'),
    })

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || 'Invalid input',
      }
    }

    const { assetName, assetType } = validated.data

    await prisma.investment.update({
      where: { id: investmentId },
      data: {
        assetName,
        assetType,
      },
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)

    return {
      success: true,
      message: `${investment.ticker} updated`,
    }
  } catch (error) {
    console.error('Failed to update investment:', {
      error,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to update investment' }
  }
}

/**
 * Remove an investment from a portfolio
 * @param investmentId - The investment ID to delete
 * @returns ActionResult with ticker name
 */
export async function deleteInvestment(
  investmentId: string
): Promise<ActionResult<{ ticker: string }>> {
  try {
    const user = await requireAuth()

    // Verify ownership through portfolio
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { portfolio: { select: { userId: true } } },
    })

    if (!investment) {
      return { success: false, error: 'Investment not found' }
    }

    if (investment.portfolio.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

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
    console.error('Failed to delete investment:', {
      error,
      timestamp: new Date().toISOString(),
    })
    return { success: false, error: 'Failed to remove investment' }
  }
}

/**
 * Refresh current price for an investment using Alpha Vantage API
 * @param investmentId - The investment ID to refresh price for
 * @returns ActionResult with updated price
 */
export async function refreshInvestmentPrice(
  investmentId: string
): Promise<ActionResult<{ price: number }>> {
  try {
    const user = await requireAuth()

    // Verify ownership through portfolio
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { portfolio: { select: { userId: true } } },
    })

    if (!investment) {
      return { success: false, error: 'Investment not found' }
    }

    if (investment.portfolio.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    // Fetch real price from Alpha Vantage API
    const currentPrice = await getAssetPrice(investment.ticker, investment.assetType)

    // Update investment with new price
    const updatedInvestment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentPrice: new Decimal(currentPrice),
        priceUpdatedAt: new Date(),
      },
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)

    return {
      success: true,
      data: { price: updatedInvestment.currentPrice?.toNumber() || 0 },
      message: 'Price refreshed successfully',
    }
  } catch (error) {
    console.error('Failed to refresh price:', {
      error,
      timestamp: new Date().toISOString(),
    })

    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return {
        success: false,
        error: 'API rate limit exceeded. Please try again in a few minutes.',
      }
    }

    return { success: false, error: 'Failed to refresh price' }
  }
}

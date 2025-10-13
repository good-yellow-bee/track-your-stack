'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AssetType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

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

  // Extract form data
  const ticker = (formData.get('ticker') as string)?.toUpperCase().trim()
  const assetName = formData.get('assetName') as string
  const assetType = formData.get('assetType') as AssetType
  const quantity = parseFloat(formData.get('quantity') as string)
  const pricePerUnit = parseFloat(formData.get('pricePerUnit') as string)
  const currency = (formData.get('currency') as string) || 'USD'
  const purchaseDate = formData.get('purchaseDate') as string
  const notes = formData.get('notes') as string

  // Validation
  if (!ticker || !assetName || !assetType) {
    return { success: false, error: 'Missing required fields' }
  }

  if (isNaN(quantity) || quantity <= 0) {
    return { success: false, error: 'Quantity must be a positive number' }
  }

  if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
    return {
      success: false,
      error: 'Price per unit must be a positive number',
    }
  }

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
      // Aggregate with weighted average cost basis
      const existingQty = existingInvestment.totalQuantity.toNumber()
      const existingAvg = existingInvestment.averageCostBasis.toNumber()
      const newQty = quantity
      const newPrice = pricePerUnit

      const totalQty = existingQty + newQty
      const totalCost = existingQty * existingAvg + newQty * newPrice
      const newAvgCostBasis = totalCost / totalQty

      await prisma.investment.update({
        where: { id: existingInvestment.id },
        data: {
          totalQuantity: new Decimal(totalQty),
          averageCostBasis: new Decimal(newAvgCostBasis),
        },
      })

      investmentId = existingInvestment.id
      aggregated = true
    } else {
      // Create new investment
      const newInvestment = await prisma.investment.create({
        data: {
          portfolioId,
          ticker,
          assetName,
          assetType,
          totalQuantity: new Decimal(quantity),
          averageCostBasis: new Decimal(pricePerUnit),
          purchaseCurrency: currency,
        },
      })

      investmentId = newInvestment.id
    }

    // Create purchase transaction record
    await prisma.purchaseTransaction.create({
      data: {
        investmentId,
        quantity: new Decimal(quantity),
        pricePerUnit: new Decimal(pricePerUnit),
        currency,
        purchaseDate: new Date(purchaseDate || Date.now()),
        notes,
      },
    })

    revalidatePath(`/portfolios/${portfolioId}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { id: investmentId, aggregated },
      message: aggregated
        ? `${ticker}: ${quantity} shares aggregated`
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

  const assetName = formData.get('assetName') as string
  const assetType = formData.get('assetType') as AssetType

  try {
    await prisma.investment.update({
      where: { id: investmentId },
      data: {
        ...(assetName && { assetName }),
        ...(assetType && { assetType }),
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

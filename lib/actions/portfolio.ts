'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  deletePortfolioSchema,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  DeletePortfolioInput,
} from '@/lib/validations/portfolio'
import { ActionResult } from '@/lib/types/actions'
import { Portfolio } from '@prisma/client'

/**
 * Create a new portfolio
 * @param input - Portfolio creation data (name and base currency)
 * @returns ActionResult with created portfolio or error
 */
export async function createPortfolio(
  input: CreatePortfolioInput
): Promise<ActionResult<Portfolio>> {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Validate input
    const validated = createPortfolioSchema.parse(input)

    // Create portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: validated.name,
        baseCurrency: validated.baseCurrency,
      },
    })

    revalidatePath('/portfolios')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: portfolio,
      message: 'Portfolio created successfully',
    }
  } catch (error) {
    console.error('Error creating portfolio:', {
      error,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: 'Failed to create portfolio',
    }
  }
}

/**
 * Get all portfolios for the authenticated user
 * @returns ActionResult with array of portfolios or error
 */
export async function getPortfolios(): Promise<
  ActionResult<Array<Portfolio & { _count: { investments: number } }>>
> {
  try {
    const user = await requireAuth()

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { investments: true },
        },
      },
    })

    return { success: true, data: portfolios }
  } catch (error) {
    console.error('Error fetching portfolios:', {
      error,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: 'Failed to fetch portfolios',
    }
  }
}

/**
 * Get a single portfolio by ID with all investments and transactions
 * @param id - Portfolio ID
 * @returns ActionResult with portfolio or error
 */
export async function getPortfolio(id: string) {
  try {
    const user = await requireAuth()

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            transactions: true,
          },
        },
      },
    })

    if (!portfolio) {
      return { success: false, error: 'Portfolio not found' }
    }

    // Verify ownership
    if (portfolio.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    return { success: true, data: portfolio }
  } catch (error) {
    console.error('Error fetching portfolio:', {
      error,
      portfolioId: id,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: 'Failed to fetch portfolio',
    }
  }
}

/**
 * Update an existing portfolio
 * @param input - Portfolio update data (id, name, and/or base currency)
 * @returns ActionResult with updated portfolio or error
 */
export async function updatePortfolio(
  input: UpdatePortfolioInput
): Promise<ActionResult<Portfolio>> {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = updatePortfolioSchema.parse(input)

    // Verify ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Portfolio not found' }
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update portfolio
    const portfolio = await prisma.portfolio.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        baseCurrency: validated.baseCurrency,
      },
    })

    revalidatePath('/portfolios')
    revalidatePath(`/portfolios/${portfolio.id}`)

    return {
      success: true,
      data: portfolio,
      message: 'Portfolio updated successfully',
    }
  } catch (error) {
    console.error('Error updating portfolio:', {
      error,
      portfolioId: input.id,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: 'Failed to update portfolio',
    }
  }
}

/**
 * Delete a portfolio and all associated investments (cascade)
 * @param input - Portfolio deletion data (id)
 * @returns ActionResult indicating success or error
 */
export async function deletePortfolio(input: DeletePortfolioInput): Promise<ActionResult> {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = deletePortfolioSchema.parse(input)

    // Verify ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Portfolio not found' }
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete portfolio (cascade deletes investments)
    await prisma.portfolio.delete({
      where: { id: validated.id },
    })

    revalidatePath('/portfolios')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Portfolio deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting portfolio:', {
      error,
      portfolioId: input.id,
      timestamp: new Date().toISOString(),
    })
    return {
      success: false,
      error: 'Failed to delete portfolio',
    }
  }
}

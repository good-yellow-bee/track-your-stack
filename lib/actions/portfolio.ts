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

export async function createPortfolio(input: CreatePortfolioInput) {
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

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create portfolio',
    }
  }
}

export async function getPortfolios() {
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

    return { success: true, portfolios }
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch portfolios',
    }
  }
}

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

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
    }
  }
}

export async function updatePortfolio(input: UpdatePortfolioInput) {
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

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update portfolio',
    }
  }
}

export async function deletePortfolio(input: DeletePortfolioInput) {
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

    return { success: true }
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete portfolio',
    }
  }
}

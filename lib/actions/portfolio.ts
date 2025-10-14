'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Validation schemas
const CreatePortfolioSchema = z.object({
  name: z.string().trim().min(1, 'Portfolio name is required').max(100),
  baseCurrency: z.string().length(3, 'Invalid currency code'),
})

const UpdatePortfolioSchema = z.object({
  name: z.string().trim().min(1, 'Portfolio name is required').max(100),
  baseCurrency: z.string().length(3, 'Invalid currency code').optional(),
})

/**
 * Create a new portfolio for the authenticated user
 */
export async function createPortfolio(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Extract and validate form data
  const nameRaw = formData.get('name')
  const baseCurrencyRaw = formData.get('baseCurrency')

  if (typeof nameRaw !== 'string' || !nameRaw.trim()) {
    return { success: false, error: 'Portfolio name is required' }
  }

  if (typeof baseCurrencyRaw !== 'string' || !baseCurrencyRaw) {
    return { success: false, error: 'Base currency is required' }
  }

  const validated = CreatePortfolioSchema.safeParse({
    name: nameRaw,
    baseCurrency: baseCurrencyRaw,
  })

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { name, baseCurrency } = validated.data

  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        baseCurrency,
        userId: session.user.id,
      },
    })

    revalidatePath('/dashboard')
    return {
      success: true,
      data: { id: portfolio.id },
      message: 'Portfolio created successfully',
    }
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return { success: false, error: 'Failed to create portfolio' }
  }
}

/**
 * Update an existing portfolio
 */
export async function updatePortfolio(
  portfolioId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify ownership
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

  // Extract and validate form data
  const nameRaw = formData.get('name')
  const baseCurrencyRaw = formData.get('baseCurrency')

  if (typeof nameRaw !== 'string' || !nameRaw.trim()) {
    return { success: false, error: 'Portfolio name is required' }
  }

  const validated = UpdatePortfolioSchema.safeParse({
    name: nameRaw,
    baseCurrency: typeof baseCurrencyRaw === 'string' ? baseCurrencyRaw : undefined,
  })

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || 'Invalid input',
    }
  }

  const { name, baseCurrency } = validated.data

  try {
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        name,
        ...(baseCurrency && { baseCurrency }),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/portfolios/${portfolioId}`)
    return { success: true, message: 'Portfolio updated' }
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return { success: false, error: 'Failed to update portfolio' }
  }
}

/**
 * Delete a portfolio and all associated investments
 */
export async function deletePortfolio(portfolioId: string): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Verify ownership
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

  try {
    await prisma.portfolio.delete({
      where: { id: portfolioId },
    })

    revalidatePath('/dashboard')
    return { success: true, message: 'Portfolio deleted' }
  } catch (error) {
    console.error('Failed to delete portfolio:', error)
    return { success: false, error: 'Failed to delete portfolio' }
  }
}

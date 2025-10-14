import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createPortfolio,
  getPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '@/lib/actions/portfolio'
import type {
  CreatePortfolioInput,
  UpdatePortfolioInput,
  DeletePortfolioInput,
} from '@/lib/validations/portfolio'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    portfolio: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

describe('Portfolio Actions', () => {
  // Use valid CUID format for test IDs
  const mockUser = { id: 'cjld2cjxh0000qzrmn831i7rn', email: 'test@example.com' }
  const mockPortfolio = {
    id: 'cjld2cjxh0001qzrmn831i7ro',
    name: 'Test Portfolio',
    baseCurrency: 'USD' as const,
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(requireAuth as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
  })

  describe('createPortfolio', () => {
    it('should create a portfolio with valid input', async () => {
      const input: CreatePortfolioInput = {
        name: 'My Portfolio',
        baseCurrency: 'USD',
      }

      ;(prisma.portfolio.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const result = await createPortfolio(input)

      expect(requireAuth).toHaveBeenCalled()
      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          name: 'My Portfolio',
          baseCurrency: 'USD',
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/portfolios')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(result).toEqual({
        success: true,
        portfolio: mockPortfolio,
      })
    })

    it('should return error when user is not authenticated', async () => {
      ;(requireAuth as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'))

      const input: CreatePortfolioInput = {
        name: 'My Portfolio',
        baseCurrency: 'USD',
      }

      const result = await createPortfolio(input)

      expect(result).toEqual({
        success: false,
        error: 'Failed to create portfolio',
      })
      expect(prisma.portfolio.create).not.toHaveBeenCalled()
    })

    it('should validate portfolio name is not empty', async () => {
      const input: CreatePortfolioInput = {
        name: '',
        baseCurrency: 'USD',
      }

      const result = await createPortfolio(input)

      expect(result.success).toBe(false)
      expect(prisma.portfolio.create).not.toHaveBeenCalled()
    })

    it('should validate currency code length', async () => {
      const input = {
        name: 'Test Portfolio',
        baseCurrency: 'US', // Too short
      } as CreatePortfolioInput

      const result = await createPortfolio(input)

      expect(result.success).toBe(false)
      expect(prisma.portfolio.create).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const input: CreatePortfolioInput = {
        name: 'My Portfolio',
        baseCurrency: 'USD',
      }

      ;(prisma.portfolio.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error')
      )

      const result = await createPortfolio(input)

      expect(result).toEqual({
        success: false,
        error: 'Failed to create portfolio',
      })
    })
  })

  describe('getPortfolios', () => {
    it('should return all user portfolios', async () => {
      const mockPortfolios = [
        mockPortfolio,
        {
          ...mockPortfolio,
          id: 'portfolio-456',
          name: 'Second Portfolio',
        },
      ]

      ;(prisma.portfolio.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockPortfolios.map((p) => ({
          ...p,
          _count: { investments: 5 },
        }))
      )

      const result = await getPortfolios()

      expect(requireAuth).toHaveBeenCalled()
      expect(prisma.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { investments: true },
          },
        },
      })
      expect(result.success).toBe(true)
      expect(result.portfolios).toHaveLength(2)
    })

    it('should return empty array when user has no portfolios', async () => {
      ;(prisma.portfolio.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

      const result = await getPortfolios()

      expect(result).toEqual({
        success: true,
        portfolios: [],
      })
    })

    it('should handle unauthorized access', async () => {
      ;(requireAuth as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Unauthorized'))

      const result = await getPortfolios()

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch portfolios',
      })
    })
  })

  describe('getPortfolio', () => {
    it('should return portfolio with investments', async () => {
      const mockPortfolioWithInvestments = {
        ...mockPortfolio,
        investments: [
          {
            id: 'inv-1',
            ticker: 'AAPL',
            assetName: 'Apple Inc.',
            totalQuantity: 10,
            averageCostBasis: 150.0,
            transactions: [],
          },
        ],
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockPortfolioWithInvestments
      )

      const result = await getPortfolio('portfolio-123')

      expect(requireAuth).toHaveBeenCalled()
      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: 'portfolio-123' },
        include: {
          investments: {
            include: {
              transactions: true,
            },
          },
        },
      })
      expect(result).toEqual({
        success: true,
        portfolio: mockPortfolioWithInvestments,
      })
    })

    it('should return error when portfolio not found', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await getPortfolio('nonexistent-id')

      expect(result).toEqual({
        success: false,
        error: 'Portfolio not found',
      })
    })

    it('should verify user ownership', async () => {
      const otherUserPortfolio = {
        ...mockPortfolio,
        userId: 'other-user-456',
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
        otherUserPortfolio
      )

      const result = await getPortfolio('portfolio-123')

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
    })
  })

  describe('updatePortfolio', () => {
    it('should update portfolio with valid input', async () => {
      const input: UpdatePortfolioInput = {
        id: mockPortfolio.id,
        name: 'Updated Portfolio',
        baseCurrency: 'EUR',
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: mockUser.id,
      })
      ;(prisma.portfolio.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockPortfolio,
        name: 'Updated Portfolio',
        baseCurrency: 'EUR',
      })

      const result = await updatePortfolio(input)

      expect(requireAuth).toHaveBeenCalled()
      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        select: { userId: true },
      })
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        data: {
          name: 'Updated Portfolio',
          baseCurrency: 'EUR',
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/portfolios')
      expect(revalidatePath).toHaveBeenCalledWith(`/portfolios/${mockPortfolio.id}`)
      expect(result.success).toBe(true)
    })

    it('should verify ownership before update', async () => {
      const input: UpdatePortfolioInput = {
        id: mockPortfolio.id,
        name: 'Updated Portfolio',
        baseCurrency: 'EUR',
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 'cjld2cjxh0099qzrmn831aaaa',
      })

      const result = await updatePortfolio(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
      expect(prisma.portfolio.update).not.toHaveBeenCalled()
    })

    it('should return error when portfolio not found', async () => {
      const input: UpdatePortfolioInput = {
        id: 'cjld2cjxh9999qzrmn831zzzz',
        name: 'Updated Portfolio',
        baseCurrency: 'EUR',
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await updatePortfolio(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Portfolio not found')
      expect(prisma.portfolio.update).not.toHaveBeenCalled()
    })
  })

  describe('deletePortfolio', () => {
    it('should delete portfolio with valid input', async () => {
      const input: DeletePortfolioInput = { id: mockPortfolio.id }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: mockUser.id,
      })
      ;(prisma.portfolio.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const result = await deletePortfolio(input)

      expect(requireAuth).toHaveBeenCalled()
      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        select: { userId: true },
      })
      expect(prisma.portfolio.delete).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
      })
      expect(revalidatePath).toHaveBeenCalledWith('/portfolios')
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(result).toEqual({ success: true })
    })

    it('should verify ownership before deletion', async () => {
      const input: DeletePortfolioInput = { id: mockPortfolio.id }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 'cjld2cjxh0099qzrmn831aaaa',
      })

      const result = await deletePortfolio(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unauthorized')
      expect(prisma.portfolio.delete).not.toHaveBeenCalled()
    })

    it('should return error when portfolio not found', async () => {
      const input: DeletePortfolioInput = { id: 'cjld2cjxh9999qzrmn831zzzz' }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await deletePortfolio(input)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Portfolio not found')
      expect(prisma.portfolio.delete).not.toHaveBeenCalled()
    })

    it('should cascade delete investments', async () => {
      // This is handled by Prisma schema with onDelete: Cascade
      // We verify that delete is called, which will trigger cascade
      const input: DeletePortfolioInput = { id: mockPortfolio.id }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: mockUser.id,
      })
      ;(prisma.portfolio.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      await deletePortfolio(input)

      expect(prisma.portfolio.delete).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
      })
    })
  })

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      ;(prisma.portfolio.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Test error')
      )

      await createPortfolio({ name: 'Test', baseCurrency: 'USD' })

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should not leak sensitive information in error messages', async () => {
      ;(prisma.portfolio.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection string: postgresql://...')
      )

      const result = await createPortfolio({ name: 'Test', baseCurrency: 'USD' })

      expect(result.error).toBe('Failed to create portfolio')
      expect(result.error).not.toContain('postgresql')
    })
  })
})

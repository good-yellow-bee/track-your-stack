import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import {
  addInvestment,
  updateInvestment,
  deleteInvestment,
  refreshInvestmentPrice,
} from '@/lib/actions/investment'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    portfolio: {
      findUnique: vi.fn(),
    },
    investment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    purchaseTransaction: {
      create: vi.fn(),
    },
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AssetType } from '@prisma/client'

describe('Investment Actions', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockPortfolio = {
    id: 'portfolio-123',
    userId: mockUser.id,
  }
  const mockInvestment = {
    id: 'investment-123',
    portfolioId: mockPortfolio.id,
    ticker: 'AAPL',
    assetName: 'Apple Inc.',
    assetType: AssetType.STOCK,
    totalQuantity: new Decimal(10),
    averageCostBasis: new Decimal(150),
    purchaseCurrency: 'USD',
    currentPrice: new Decimal(155),
    priceUpdatedAt: new Date(),
    portfolio: { userId: mockUser.id },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue({ user: mockUser })
  })

  describe('addInvestment', () => {
    it('should add a new investment with valid input', async () => {
      const formData = new FormData()
      formData.append('ticker', 'aapl')
      formData.append('assetName', 'Apple Inc.')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      // Mock $transaction to execute the callback with a mock transaction object
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const mockTx = {
          investment: {
            create: vi.fn().mockResolvedValue(mockInvestment),
          },
          purchaseTransaction: {
            create: vi.fn().mockResolvedValue({ id: 'transaction-123' }),
          },
        }
        return callback(mockTx)
      })

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(auth).toHaveBeenCalled()
      expect(prisma.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: mockPortfolio.id },
        select: { userId: true },
      })
      expect(prisma.investment.findFirst).toHaveBeenCalledWith({
        where: { portfolioId: mockPortfolio.id, ticker: 'AAPL' },
      })
      expect(prisma.$transaction).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith(`/portfolios/${mockPortfolio.id}`)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(result).toEqual({
        success: true,
        data: { id: mockInvestment.id, aggregated: false },
        message: 'AAPL added to portfolio',
      })
    })

    it('should aggregate existing investment with weighted average', async () => {
      const formData = new FormData()
      formData.append('ticker', 'aapl')
      formData.append('assetName', 'Apple Inc.')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '5')
      formData.append('pricePerUnit', '160')
      formData.append('currency', 'USD')

      const existingInvestment = {
        ...mockInvestment,
        totalQuantity: new Decimal(10),
        averageCostBasis: new Decimal(150),
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        existingInvestment
      )

      // Mock $transaction to execute the array of operations
      let actualUpdateData: any
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
        async (operations: any[]) => {
          // Execute each operation (they are promises) and collect results
          const results = await Promise.all(
            operations.map(async (op: any) => {
              // The operations are the return values of prisma.investment.update() etc.
              // which are promises that resolve when the Prisma method mocks are called
              return op
            })
          )
          return results
        }
      )

      // Mock the Prisma operations that will be passed to $transaction
      prisma.investment.update = vi.fn().mockImplementation((args) => {
        actualUpdateData = args.data
        return Promise.resolve({
          ...existingInvestment,
          ...args.data,
        })
      }) as any

      prisma.purchaseTransaction.create = vi.fn().mockResolvedValue({
        id: 'transaction-123',
      }) as any

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(prisma.$transaction).toHaveBeenCalled()

      // Verify weighted average calculation from captured data
      expect(actualUpdateData).toBeDefined()
      const totalQty = actualUpdateData.totalQuantity as Decimal
      const avgCost = actualUpdateData.averageCostBasis as Decimal

      expect(totalQty.toNumber()).toBe(15) // 10 + 5
      // (10 * 150 + 5 * 160) / 15 = 2300 / 15 = 153.333...
      expect(avgCost.toNumber()).toBeCloseTo(153.333333, 5)

      expect(result).toEqual({
        success: true,
        data: { id: existingInvestment.id, aggregated: true },
        message: 'AAPL: 5 shares aggregated',
      })
    })

    it('should uppercase ticker symbol', async () => {
      const formData = new FormData()
      formData.append('ticker', 'msft')
      formData.append('assetName', 'Microsoft')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '300')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
      ;(prisma.investment.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        ticker: 'MSFT',
      })
      ;(prisma.purchaseTransaction.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'transaction-123',
      })

      await addInvestment(mockPortfolio.id, formData)

      expect(prisma.investment.findFirst).toHaveBeenCalledWith({
        where: { portfolioId: mockPortfolio.id, ticker: 'MSFT' },
      })
    })

    it('should return error when user is not authenticated', async () => {
      ;(auth as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      })
      expect(prisma.portfolio.findUnique).not.toHaveBeenCalled()
    })

    it('should return error when portfolio not found', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')

      const result = await addInvestment('nonexistent-id', formData)

      expect(result).toEqual({
        success: false,
        error: 'Portfolio not found',
      })
    })

    it('should verify portfolio ownership', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 'other-user-456',
      })

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result).toEqual({
        success: false,
        error: 'Forbidden',
      })
      expect(prisma.investment.findFirst).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const formData = new FormData()
      // Missing required fields

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('required')
    })

    it('should validate quantity is positive', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '-10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('positive')
    })

    it('should validate price is positive', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '-150')
      formData.append('currency', 'USD')

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('positive')
    })

    it('should validate currency code length', async () => {
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'US') // Too short

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result.success).toBe(false)
      expect(result.error).toContain('currency')
    })

    it('should handle database errors gracefully', async () => {
      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error')
      )

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result).toEqual({
        success: false,
        error: 'Failed to add investment',
      })
    })

    it('should use Decimal for precise financial calculations', async () => {
      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10.5')
      formData.append('pricePerUnit', '150.25')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      // Capture the data passed to create for verification
      let capturedCreateData: any
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (callback) => {
        const mockTx = {
          investment: {
            create: vi.fn().mockImplementation((args: any) => {
              capturedCreateData = args.data
              return Promise.resolve(mockInvestment)
            }),
          },
          purchaseTransaction: {
            create: vi.fn().mockResolvedValue({ id: 'transaction-123' }),
          },
        }
        return callback(mockTx)
      })

      await addInvestment(mockPortfolio.id, formData)

      expect(prisma.$transaction).toHaveBeenCalled()
      expect(capturedCreateData).toBeDefined()
      expect(capturedCreateData.totalQuantity).toBeInstanceOf(Decimal)
      expect(capturedCreateData.averageCostBasis).toBeInstanceOf(Decimal)
      expect(capturedCreateData.totalQuantity.toNumber()).toBe(10.5)
      expect(capturedCreateData.averageCostBasis.toNumber()).toBe(150.25)
    })
  })

  describe('updateInvestment', () => {
    it('should update investment with valid input', async () => {
      const formData = new FormData()
      formData.append('assetName', 'Apple Inc. Updated')
      formData.append('assetType', AssetType.ETF)
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)
      ;(prisma.investment.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        assetName: 'Apple Inc. Updated',
        assetType: AssetType.ETF,
      })

      const result = await updateInvestment(mockInvestment.id, formData)

      expect(auth).toHaveBeenCalled()
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
        include: { portfolio: { select: { userId: true } } },
      })
      expect(prisma.investment.update).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
        data: {
          assetName: 'Apple Inc. Updated',
          assetType: AssetType.ETF,
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith(`/portfolios/${mockInvestment.portfolioId}`)
      expect(result.success).toBe(true)
    })

    it('should verify ownership before update', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        portfolio: { userId: 'other-user-456' },
      })

      const formData = new FormData()
      formData.append('assetName', 'Updated')

      const result = await updateInvestment(mockInvestment.id, formData)

      expect(result).toEqual({
        success: false,
        error: 'Forbidden',
      })
      expect(prisma.investment.update).not.toHaveBeenCalled()
    })

    it('should return error when investment not found', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const formData = new FormData()
      formData.append('assetName', 'Updated')

      const result = await updateInvestment('nonexistent-id', formData)

      expect(result).toEqual({
        success: false,
        error: 'Investment not found',
      })
    })
  })

  describe('deleteInvestment', () => {
    it('should delete investment with valid input', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)
      ;(prisma.investment.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)

      const result = await deleteInvestment(mockInvestment.id)

      expect(auth).toHaveBeenCalled()
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
        include: { portfolio: { select: { userId: true } } },
      })
      expect(prisma.investment.delete).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
      })
      expect(revalidatePath).toHaveBeenCalledWith(`/portfolios/${mockInvestment.portfolioId}`)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(result).toEqual({
        success: true,
        data: { ticker: mockInvestment.ticker },
        message: `${mockInvestment.ticker} removed from portfolio`,
      })
    })

    it('should verify ownership before deletion', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        portfolio: { userId: 'other-user-456' },
      })

      const result = await deleteInvestment(mockInvestment.id)

      expect(result).toEqual({
        success: false,
        error: 'Forbidden',
      })
      expect(prisma.investment.delete).not.toHaveBeenCalled()
    })

    it('should return error when investment not found', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await deleteInvestment('nonexistent-id')

      expect(result).toEqual({
        success: false,
        error: 'Investment not found',
      })
    })

    it('should cascade delete purchase transactions', async () => {
      // This is handled by Prisma schema with onDelete: Cascade
      // We verify that delete is called, which will trigger cascade
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)
      ;(prisma.investment.delete as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)

      await deleteInvestment(mockInvestment.id)

      expect(prisma.investment.delete).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
      })
    })
  })

  describe('refreshInvestmentPrice', () => {
    it('should refresh price and update timestamp', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment)
      ;(prisma.investment.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        priceUpdatedAt: new Date(),
      })

      const result = await refreshInvestmentPrice(mockInvestment.id)

      expect(auth).toHaveBeenCalled()
      expect(prisma.investment.findUnique).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
        include: { portfolio: { select: { userId: true } } },
      })
      expect(prisma.investment.update).toHaveBeenCalledWith({
        where: { id: mockInvestment.id },
        data: {
          priceUpdatedAt: expect.any(Date),
        },
      })
      expect(revalidatePath).toHaveBeenCalledWith(`/portfolios/${mockInvestment.portfolioId}`)
      expect(result.success).toBe(true)
    })

    it('should verify ownership before refresh', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        ...mockInvestment,
        portfolio: { userId: 'other-user-456' },
      })

      const result = await refreshInvestmentPrice(mockInvestment.id)

      expect(result).toEqual({
        success: false,
        error: 'Forbidden',
      })
      expect(prisma.investment.update).not.toHaveBeenCalled()
    })

    it('should return error when investment not found', async () => {
      ;(prisma.investment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await refreshInvestmentPrice('nonexistent-id')

      expect(result).toEqual({
        success: false,
        error: 'Investment not found',
      })
    })
  })

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Test error'))

      await addInvestment(mockPortfolio.id, formData)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should not leak sensitive information in error messages', async () => {
      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '10')
      formData.append('pricePerUnit', '150')
      formData.append('currency', 'USD')
      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
      ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection string: postgresql://...')
      )

      const result = await addInvestment(mockPortfolio.id, formData)

      expect(result.error).toBe('Failed to add investment')
      expect(result.error).not.toContain('postgresql')
    })
  })

  describe('Decimal Precision', () => {
    it('should maintain precision with complex weighted average', async () => {
      const formData = new FormData()
      formData.append('ticker', 'AAPL')
      formData.append('assetName', 'Apple')
      formData.append('assetType', AssetType.STOCK)
      formData.append('quantity', '3.7')
      formData.append('pricePerUnit', '147.89')
      formData.append('currency', 'USD')

      const existingInvestment = {
        ...mockInvestment,
        totalQuantity: new Decimal('7.3'),
        averageCostBasis: new Decimal('152.45'),
      }

      ;(prisma.portfolio.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolio)
      ;(prisma.investment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        existingInvestment
      )
      ;(prisma.investment.update as ReturnType<typeof vi.fn>).mockResolvedValue(existingInvestment)
      ;(prisma.purchaseTransaction.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'transaction-123',
      })

      await addInvestment(mockPortfolio.id, formData)

      const updateCall = (prisma.investment.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
      const totalQty = updateCall.data.totalQuantity as Decimal
      const avgCost = updateCall.data.averageCostBasis as Decimal

      // Verify calculations:
      // Total quantity: 7.3 + 3.7 = 11.0
      expect(totalQty.toNumber()).toBe(11.0)

      // Weighted average: (7.3 * 152.45 + 3.7 * 147.89) / 11.0
      // Manual calculation with Decimal precision would be:
      // The actual calculated value depends on Decimal.js implementation
      // We verify it's in the reasonable range around 150.91
      expect(avgCost.toNumber()).toBeGreaterThan(150.9)
      expect(avgCost.toNumber()).toBeLessThan(150.92)
    })
  })
})

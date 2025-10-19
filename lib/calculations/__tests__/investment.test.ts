import { describe, it, expect, vi } from 'vitest'
import {
  calculateInvestmentMetrics,
  convertToBaseCurrency,
  calculateAverageCostBasis,
} from '../investment'
import { Investment, AssetType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Mock the price service
vi.mock('@/lib/services/priceService', () => ({
  getCurrencyRate: vi.fn((from: string, to: string) => {
    // Mock exchange rates for testing
    if (from === 'USD' && to === 'USD') return Promise.resolve(1)
    if (from === 'EUR' && to === 'USD') return Promise.resolve(1.1)
    if (from === 'GBP' && to === 'USD') return Promise.resolve(1.25)
    return Promise.resolve(1)
  }),
}))

describe('calculateInvestmentMetrics', () => {
  it('calculates gain correctly for profitable investment', () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'AAPL',
      assetName: 'Apple Inc.',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(10),
      averageCostBasis: new Decimal(100),
      purchaseCurrency: 'USD',
      currentPrice: new Decimal(110),
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.currentValue).toBe(1100) // 10 * 110
    expect(metrics.totalCost).toBe(1000) // 10 * 100
    expect(metrics.gainLossDollar).toBe(100)
    expect(metrics.gainLossPercent).toBe(10) // (100 / 1000) * 100
  })

  it('calculates loss correctly for unprofitable investment', () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'TSLA',
      assetName: 'Tesla Inc.',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(10),
      averageCostBasis: new Decimal(100),
      purchaseCurrency: 'USD',
      currentPrice: new Decimal(90),
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.currentValue).toBe(900)
    expect(metrics.totalCost).toBe(1000)
    expect(metrics.gainLossDollar).toBe(-100)
    expect(metrics.gainLossPercent).toBe(-10)
  })

  it('handles zero current price', () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'ZERO',
      assetName: 'Zero Corp',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(10),
      averageCostBasis: new Decimal(100),
      purchaseCurrency: 'USD',
      currentPrice: null,
      currentPriceCurrency: null,
      priceUpdatedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.currentValue).toBe(0)
    expect(metrics.totalCost).toBe(1000)
    expect(metrics.gainLossDollar).toBe(-1000)
    expect(metrics.gainLossPercent).toBe(-100)
  })

  it('handles fractional shares', () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'VOO',
      assetName: 'Vanguard S&P 500 ETF',
      assetType: AssetType.ETF,
      totalQuantity: new Decimal(15.5),
      averageCostBasis: new Decimal(400.25),
      purchaseCurrency: 'USD',
      currentPrice: new Decimal(425.5),
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = calculateInvestmentMetrics(investment)

    expect(metrics.currentValue).toBeCloseTo(6595.25, 2) // 15.5 * 425.5
    expect(metrics.totalCost).toBeCloseTo(6203.875, 2) // 15.5 * 400.25
    expect(metrics.gainLossDollar).toBeCloseTo(391.375, 2)
    expect(metrics.gainLossPercent).toBeCloseTo(6.31, 1)
  })
})

describe('convertToBaseCurrency', () => {
  it('returns same metrics when already in base currency', async () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'AAPL',
      assetName: 'Apple Inc.',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(10),
      averageCostBasis: new Decimal(100),
      purchaseCurrency: 'USD',
      currentPrice: new Decimal(110),
      currentPriceCurrency: 'USD',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = await convertToBaseCurrency(investment, 'USD')

    expect(metrics.currentValue).toBe(1100)
    expect(metrics.totalCost).toBe(1000)
    expect(metrics.gainLossDollar).toBe(100)
    expect(metrics.gainLossPercent).toBe(10)
  })

  it('converts from EUR to USD correctly', async () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'SAP',
      assetName: 'SAP SE',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(10),
      averageCostBasis: new Decimal(100),
      purchaseCurrency: 'EUR',
      currentPrice: new Decimal(110),
      currentPriceCurrency: 'EUR',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = await convertToBaseCurrency(investment, 'USD')

    // EUR to USD rate is 1.1 (from mock)
    expect(metrics.currentValue).toBeCloseTo(1210, 2) // 1100 * 1.1
    expect(metrics.totalCost).toBeCloseTo(1100, 2) // 1000 * 1.1
    expect(metrics.gainLossDollar).toBeCloseTo(110, 2) // 100 * 1.1
    expect(metrics.gainLossPercent).toBe(10) // Percentage stays the same
  })

  it('converts from GBP to USD correctly', async () => {
    const investment: Investment = {
      id: '1',
      portfolioId: 'p1',
      ticker: 'HSBC',
      assetName: 'HSBC Holdings',
      assetType: AssetType.STOCK,
      totalQuantity: new Decimal(20),
      averageCostBasis: new Decimal(50),
      purchaseCurrency: 'GBP',
      currentPrice: new Decimal(60),
      currentPriceCurrency: 'GBP',
      priceUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const metrics = await convertToBaseCurrency(investment, 'USD')

    // GBP to USD rate is 1.25 (from mock)
    expect(metrics.currentValue).toBeCloseTo(1500, 2) // 1200 * 1.25
    expect(metrics.totalCost).toBeCloseTo(1250, 2) // 1000 * 1.25
    expect(metrics.gainLossDollar).toBeCloseTo(250, 2) // 200 * 1.25
    expect(metrics.gainLossPercent).toBe(20)
  })
})

describe('calculateAverageCostBasis', () => {
  it('calculates simple average for equal quantities', () => {
    const purchases = [
      { quantity: 10, pricePerUnit: 100 },
      { quantity: 10, pricePerUnit: 120 },
    ]

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBe(110) // (1000 + 1200) / 20
  })

  it('calculates weighted average for different quantities', () => {
    const purchases = [
      { quantity: 10, pricePerUnit: 150 }, // $1,500 total
      { quantity: 5, pricePerUnit: 160 }, // $800 total
    ]

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBeCloseTo(153.33, 2) // 2300 / 15
  })

  it('handles single purchase', () => {
    const purchases = [{ quantity: 10, pricePerUnit: 100 }]

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBe(100)
  })

  it('handles multiple purchases with complex numbers', () => {
    const purchases = [
      { quantity: 15.5, pricePerUnit: 400.25 },
      { quantity: 8.3, pricePerUnit: 425.5 },
      { quantity: 12.2, pricePerUnit: 410.75 },
    ]

    const totalQty = 15.5 + 8.3 + 12.2 // 36
    const totalCost = 15.5 * 400.25 + 8.3 * 425.5 + 12.2 * 410.75

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBeCloseTo(totalCost / totalQty, 2)
  })

  it('returns 0 for empty purchases array', () => {
    const purchases: Array<{ quantity: number; pricePerUnit: number }> = []

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBe(0)
  })

  it('returns 0 for zero total quantity', () => {
    const purchases = [
      { quantity: 0, pricePerUnit: 100 },
      { quantity: 0, pricePerUnit: 120 },
    ]

    const avgCost = calculateAverageCostBasis(purchases)

    expect(avgCost).toBe(0)
  })
})

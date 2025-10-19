import { describe, it, expect, vi } from 'vitest'
import {
  calculatePortfolioSummary,
  calculateAssetAllocation,
  InvestmentWithMetrics,
} from '../portfolio'
import { Portfolio, Investment, AssetType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Mock the price service
vi.mock('@/lib/services/priceService', () => ({
  getCurrencyRate: vi.fn((from: string, to: string) => {
    if (from === 'USD' && to === 'USD') return Promise.resolve(1)
    if (from === 'EUR' && to === 'USD') return Promise.resolve(1.1)
    if (from === 'GBP' && to === 'USD') return Promise.resolve(1.25)
    return Promise.resolve(1)
  }),
}))

describe('calculatePortfolioSummary', () => {
  it('calculates summary for single-currency portfolio', async () => {
    const portfolio: Portfolio & { investments: Investment[] } = {
      id: 'p1',
      userId: 'u1',
      name: 'My Portfolio',
      baseCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      investments: [
        {
          id: 'i1',
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
        },
        {
          id: 'i2',
          portfolioId: 'p1',
          ticker: 'TSLA',
          assetName: 'Tesla Inc.',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(5),
          averageCostBasis: new Decimal(200),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(180),
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    const summary = await calculatePortfolioSummary(portfolio)

    // AAPL: 10 * 110 = 1100 current, 10 * 100 = 1000 cost, +100 gain
    // TSLA: 5 * 180 = 900 current, 5 * 200 = 1000 cost, -100 loss
    expect(summary.totalValue).toBe(2000) // 1100 + 900
    expect(summary.totalCost).toBe(2000) // 1000 + 1000
    expect(summary.totalGainLoss).toBe(0) // 100 - 100
    expect(summary.totalGainLossPercent).toBe(0)
  })

  it('calculates summary for multi-currency portfolio', async () => {
    const portfolio: Portfolio & { investments: Investment[] } = {
      id: 'p1',
      userId: 'u1',
      name: 'Global Portfolio',
      baseCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      investments: [
        {
          id: 'i1',
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
        },
        {
          id: 'i2',
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
        },
      ],
    }

    const summary = await calculatePortfolioSummary(portfolio)

    // AAPL: 1100 current, 1000 cost (USD)
    // SAP: 1100 EUR * 1.1 = 1210 current, 1000 EUR * 1.1 = 1100 cost (converted to USD)
    expect(summary.totalValue).toBeCloseTo(2310, 2) // 1100 + 1210
    expect(summary.totalCost).toBeCloseTo(2100, 2) // 1000 + 1100
    expect(summary.totalGainLoss).toBeCloseTo(210, 2)
    expect(summary.totalGainLossPercent).toBeCloseTo(10, 1)
  })

  it('identifies best and worst performers', async () => {
    const portfolio: Portfolio & { investments: Investment[] } = {
      id: 'p1',
      userId: 'u1',
      name: 'My Portfolio',
      baseCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      investments: [
        {
          id: 'i1',
          portfolioId: 'p1',
          ticker: 'WINNER',
          assetName: 'Winner Corp',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(10),
          averageCostBasis: new Decimal(100),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(150), // +50%
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'i2',
          portfolioId: 'p1',
          ticker: 'LOSER',
          assetName: 'Loser Inc',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(10),
          averageCostBasis: new Decimal(100),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(70), // -30%
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'i3',
          portfolioId: 'p1',
          ticker: 'NEUTRAL',
          assetName: 'Neutral Co',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(10),
          averageCostBasis: new Decimal(100),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(110), // +10%
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    const summary = await calculatePortfolioSummary(portfolio)

    expect(summary.bestPerformer?.ticker).toBe('WINNER')
    expect(summary.worstPerformer?.ticker).toBe('LOSER')
  })

  it('calculates percentage of portfolio correctly', async () => {
    const portfolio: Portfolio & { investments: Investment[] } = {
      id: 'p1',
      userId: 'u1',
      name: 'My Portfolio',
      baseCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      investments: [
        {
          id: 'i1',
          portfolioId: 'p1',
          ticker: 'BIG',
          assetName: 'Big Corp',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(10),
          averageCostBasis: new Decimal(100),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(300), // 3000 value
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'i2',
          portfolioId: 'p1',
          ticker: 'SMALL',
          assetName: 'Small Inc',
          assetType: AssetType.STOCK,
          totalQuantity: new Decimal(10),
          averageCostBasis: new Decimal(100),
          purchaseCurrency: 'USD',
          currentPrice: new Decimal(100), // 1000 value
          currentPriceCurrency: 'USD',
          priceUpdatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    const summary = await calculatePortfolioSummary(portfolio)

    // Total value = 4000 (3000 + 1000)
    const bigInv = summary.investments.find((inv) => inv.investment.ticker === 'BIG')
    const smallInv = summary.investments.find((inv) => inv.investment.ticker === 'SMALL')

    expect(bigInv?.percentOfPortfolio).toBeCloseTo(75, 1) // 3000 / 4000 = 75%
    expect(smallInv?.percentOfPortfolio).toBeCloseTo(25, 1) // 1000 / 4000 = 25%
  })

  it('handles empty portfolio', async () => {
    const portfolio: Portfolio & { investments: Investment[] } = {
      id: 'p1',
      userId: 'u1',
      name: 'Empty Portfolio',
      baseCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      investments: [],
    }

    const summary = await calculatePortfolioSummary(portfolio)

    expect(summary.totalValue).toBe(0)
    expect(summary.totalCost).toBe(0)
    expect(summary.totalGainLoss).toBe(0)
    expect(summary.totalGainLossPercent).toBe(0)
    expect(summary.investments).toHaveLength(0)
    expect(summary.bestPerformer).toBeNull()
    expect(summary.worstPerformer).toBeNull()
  })
})

describe('calculateAssetAllocation', () => {
  it('calculates allocation by asset type', () => {
    const investments = [
      {
        investment: {
          assetType: AssetType.STOCK,
        } as Investment,
        metrics: {
          currentValue: 6000,
          totalCost: 5000,
          gainLossDollar: 1000,
          gainLossPercent: 20,
        },
        percentOfPortfolio: 60,
      },
      {
        investment: {
          assetType: AssetType.STOCK,
        } as Investment,
        metrics: {
          currentValue: 2000,
          totalCost: 2000,
          gainLossDollar: 0,
          gainLossPercent: 0,
        },
        percentOfPortfolio: 20,
      },
      {
        investment: {
          assetType: AssetType.ETF,
        } as Investment,
        metrics: {
          currentValue: 1500,
          totalCost: 1500,
          gainLossDollar: 0,
          gainLossPercent: 0,
        },
        percentOfPortfolio: 15,
      },
      {
        investment: {
          assetType: AssetType.CRYPTO,
        } as Investment,
        metrics: {
          currentValue: 500,
          totalCost: 400,
          gainLossDollar: 100,
          gainLossPercent: 25,
        },
        percentOfPortfolio: 5,
      },
    ]

    const allocation = calculateAssetAllocation(investments)

    expect(allocation[AssetType.STOCK].value).toBe(8000) // 6000 + 2000
    expect(allocation[AssetType.STOCK].percentage).toBeCloseTo(80, 1)
    expect(allocation[AssetType.ETF].value).toBe(1500)
    expect(allocation[AssetType.ETF].percentage).toBeCloseTo(15, 1)
    expect(allocation[AssetType.CRYPTO].value).toBe(500)
    expect(allocation[AssetType.CRYPTO].percentage).toBeCloseTo(5, 1)
  })

  it('handles empty investments array', () => {
    const investments: InvestmentWithMetrics[] = []

    const allocation = calculateAssetAllocation(investments)

    expect(Object.keys(allocation)).toHaveLength(0)
  })

  it('handles single asset type', () => {
    const investments = [
      {
        investment: {
          assetType: AssetType.STOCK,
        } as Investment,
        metrics: {
          currentValue: 1000,
          totalCost: 900,
          gainLossDollar: 100,
          gainLossPercent: 11.11,
        },
        percentOfPortfolio: 100,
      },
    ]

    const allocation = calculateAssetAllocation(investments)

    expect(allocation[AssetType.STOCK].value).toBe(1000)
    expect(allocation[AssetType.STOCK].percentage).toBe(100)
    expect(Object.keys(allocation)).toHaveLength(1)
  })
})

/**
 * Test Fixtures for Investment Data
 *
 * Mock investment data for use in unit tests, integration tests, and E2E tests.
 * These fixtures represent realistic investment scenarios for testing calculations,
 * currency conversion, and UI components.
 */

import type { Investment, Portfolio, AssetType } from '@prisma/client'

/**
 * Base mock investments with various scenarios
 */
export const mockInvestments: Investment[] = [
  {
    id: 'inv-1',
    portfolioId: 'portfolio-1',
    ticker: 'AAPL',
    assetType: 'STOCK' as AssetType,
    totalQuantity: 10,
    averageCostBasis: 150.0,
    purchaseCurrency: 'USD',
    currentPrice: 175.0,
    priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
    createdAt: new Date('2025-01-15T10:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'inv-2',
    portfolioId: 'portfolio-1',
    ticker: 'GOOGL',
    assetType: 'STOCK' as AssetType,
    totalQuantity: 5,
    averageCostBasis: 140.0,
    purchaseCurrency: 'USD',
    currentPrice: 138.0,
    priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
    createdAt: new Date('2025-02-20T10:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'inv-3',
    portfolioId: 'portfolio-1',
    ticker: 'BTC',
    assetType: 'CRYPTO' as AssetType,
    totalQuantity: 0.5,
    averageCostBasis: 45000.0,
    purchaseCurrency: 'USD',
    currentPrice: 52000.0,
    priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
    createdAt: new Date('2025-03-10T10:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'inv-4',
    portfolioId: 'portfolio-1',
    ticker: 'VOO',
    assetType: 'ETF' as AssetType,
    totalQuantity: 20,
    averageCostBasis: 420.0,
    purchaseCurrency: 'USD',
    currentPrice: 435.0,
    priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
    createdAt: new Date('2025-04-05T10:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'inv-5',
    portfolioId: 'portfolio-2',
    ticker: 'VTSAX',
    assetType: 'MUTUAL_FUND' as AssetType,
    totalQuantity: 100,
    averageCostBasis: 115.0,
    purchaseCurrency: 'USD',
    currentPrice: 118.0,
    priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
    createdAt: new Date('2025-05-15T10:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
]

/**
 * Mock investment with gain
 */
export const mockInvestmentWithGain: Investment = {
  id: 'inv-gain',
  portfolioId: 'portfolio-1',
  ticker: 'NVDA',
  assetType: 'STOCK' as AssetType,
  totalQuantity: 15,
  averageCostBasis: 200.0,
  purchaseCurrency: 'USD',
  currentPrice: 280.0,
  priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
  createdAt: new Date('2025-06-01T10:00:00Z'),
  updatedAt: new Date('2025-10-09T14:30:00Z'),
}

/**
 * Mock investment with loss
 */
export const mockInvestmentWithLoss: Investment = {
  id: 'inv-loss',
  portfolioId: 'portfolio-1',
  ticker: 'TDOC',
  assetType: 'STOCK' as AssetType,
  totalQuantity: 50,
  averageCostBasis: 75.0,
  purchaseCurrency: 'USD',
  currentPrice: 45.0,
  priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
  createdAt: new Date('2025-07-10T10:00:00Z'),
  updatedAt: new Date('2025-10-09T14:30:00Z'),
}

/**
 * Mock investment with multi-currency scenario
 */
export const mockInvestmentEUR: Investment = {
  id: 'inv-eur',
  portfolioId: 'portfolio-3',
  ticker: 'SAP',
  assetType: 'STOCK' as AssetType,
  totalQuantity: 25,
  averageCostBasis: 120.0,
  purchaseCurrency: 'EUR',
  currentPrice: 135.0,
  priceUpdatedAt: new Date('2025-10-09T14:30:00Z'),
  createdAt: new Date('2025-08-20T10:00:00Z'),
  updatedAt: new Date('2025-10-09T14:30:00Z'),
}

/**
 * Mock portfolio data
 */
export const mockPortfolios: Portfolio[] = [
  {
    id: 'portfolio-1',
    userId: 'user-1',
    name: 'Tech Growth Portfolio',
    baseCurrency: 'USD',
    description: 'High-growth tech stocks and crypto',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'portfolio-2',
    userId: 'user-1',
    name: 'Retirement Fund',
    baseCurrency: 'USD',
    description: 'Low-risk index funds and bonds',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
  {
    id: 'portfolio-3',
    userId: 'user-1',
    name: 'European Portfolio',
    baseCurrency: 'EUR',
    description: 'European stocks',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-10-09T14:30:00Z'),
  },
]

/**
 * Helper function to calculate investment metrics for testing
 */
export function calculateInvestmentMetrics(investment: Investment) {
  const totalCost = investment.averageCostBasis * investment.totalQuantity
  const currentValue = investment.currentPrice * investment.totalQuantity
  const gainLoss = currentValue - totalCost
  const gainLossPercent = (gainLoss / totalCost) * 100

  return {
    totalCost,
    currentValue,
    gainLoss,
    gainLossPercent,
  }
}

/**
 * Mock investment with calculated metrics
 */
export function mockInvestmentWithMetrics(investment: Investment = mockInvestments[0]) {
  return {
    ...investment,
    ...calculateInvestmentMetrics(investment),
  }
}

/**
 * Generate array of investments with metrics
 */
export function mockInvestmentsWithMetrics() {
  return mockInvestments.map((inv) => mockInvestmentWithMetrics(inv))
}

/**
 * Mock portfolio with investments
 */
export const mockPortfolioWithInvestments = {
  ...mockPortfolios[0],
  investments: mockInvestments.filter((inv) => inv.portfolioId === 'portfolio-1'),
}

/**
 * Mock empty portfolio (for testing edge cases)
 */
export const mockEmptyPortfolio: Portfolio = {
  id: 'portfolio-empty',
  userId: 'user-1',
  name: 'Empty Portfolio',
  baseCurrency: 'USD',
  description: 'Portfolio with no investments',
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-10-09T14:30:00Z'),
}

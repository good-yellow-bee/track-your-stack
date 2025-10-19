import { Portfolio, Investment } from '@prisma/client'
import { convertToBaseCurrency, InvestmentMetrics } from './investment'

/**
 * Investment with calculated metrics
 */
export interface InvestmentWithMetrics {
  investment: Investment
  metrics: InvestmentMetrics
  percentOfPortfolio: number
}

/**
 * Portfolio summary with aggregated metrics
 */
export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  investments: InvestmentWithMetrics[]
  bestPerformer: Investment | null
  worstPerformer: Investment | null
}

/**
 * Calculate complete portfolio summary with all investments converted to base currency
 */
export async function calculatePortfolioSummary(
  portfolio: Portfolio & { investments: Investment[] }
): Promise<PortfolioSummary> {
  // Convert all investments to base currency in parallel
  const convertedInvestments = await Promise.all(
    portfolio.investments.map(async (inv) => ({
      investment: inv,
      metrics: await convertToBaseCurrency(inv, portfolio.baseCurrency),
    }))
  )

  // Calculate portfolio totals
  const totalValue = convertedInvestments.reduce(
    (sum, { metrics }) => sum + metrics.currentValue,
    0
  )

  const totalCost = convertedInvestments.reduce((sum, { metrics }) => sum + metrics.totalCost, 0)

  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Calculate percentage of portfolio for each investment
  const investmentsWithPercentage: InvestmentWithMetrics[] = convertedInvestments.map((item) => ({
    ...item,
    percentOfPortfolio: totalValue > 0 ? (item.metrics.currentValue / totalValue) * 100 : 0,
  }))

  // Find best and worst performers by gain/loss percentage
  const sorted = [...convertedInvestments].sort(
    (a, b) => b.metrics.gainLossPercent - a.metrics.gainLossPercent
  )

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    investments: investmentsWithPercentage,
    bestPerformer: sorted[0]?.investment || null,
    worstPerformer: sorted[sorted.length - 1]?.investment || null,
  }
}

/**
 * Calculate allocation by asset type
 */
export function calculateAssetAllocation(
  investments: InvestmentWithMetrics[]
): Record<string, { value: number; percentage: number }> {
  const totalValue = investments.reduce((sum, inv) => sum + inv.metrics.currentValue, 0)

  const allocation: Record<string, { value: number; percentage: number }> = {}

  investments.forEach((inv) => {
    const assetType = inv.investment.assetType
    if (!allocation[assetType]) {
      allocation[assetType] = { value: 0, percentage: 0 }
    }
    allocation[assetType].value += inv.metrics.currentValue
  })

  // Calculate percentages
  Object.keys(allocation).forEach((type) => {
    allocation[type].percentage = totalValue > 0 ? (allocation[type].value / totalValue) * 100 : 0
  })

  return allocation
}

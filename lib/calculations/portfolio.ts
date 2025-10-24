import { Portfolio, Investment } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
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
 * Uses Decimal arithmetic for precision in aggregations
 */
export async function calculatePortfolioSummary(
  portfolio: Portfolio & { investments: Investment[] }
): Promise<PortfolioSummary> {
  // Filter out investments without current prices for best/worst performer calculation
  const investmentsWithPrices = portfolio.investments.filter((inv) => inv.currentPrice !== null)

  // Convert all investments to base currency in parallel
  const convertedInvestments = await Promise.all(
    portfolio.investments.map(async (inv) => ({
      investment: inv,
      metrics: await convertToBaseCurrency(inv, portfolio.baseCurrency),
    }))
  )

  // Calculate portfolio totals using Decimal for precision
  let totalValueDecimal = new Decimal(0)
  let totalCostDecimal = new Decimal(0)

  for (const { metrics } of convertedInvestments) {
    totalValueDecimal = totalValueDecimal.plus(metrics.currentValue)
    totalCostDecimal = totalCostDecimal.plus(metrics.totalCost)
  }

  const totalValue = totalValueDecimal.toNumber()
  const totalCost = totalCostDecimal.toNumber()
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0

  // Calculate percentage of portfolio for each investment
  const investmentsWithPercentage: InvestmentWithMetrics[] = convertedInvestments.map((item) => ({
    ...item,
    percentOfPortfolio: totalValue > 0 ? (item.metrics.currentValue / totalValue) * 100 : 0,
  }))

  // Find best and worst performers by gain/loss percentage (only investments with prices)
  const investmentsWithPricesAndMetrics = convertedInvestments.filter((item) =>
    investmentsWithPrices.some((inv) => inv.id === item.investment.id)
  )

  const sorted = [...investmentsWithPricesAndMetrics].sort((a, b) => {
    // Deterministic tie-breaking: if percentages are equal, sort by ticker alphabetically
    const diff = b.metrics.gainLossPercent - a.metrics.gainLossPercent
    if (Math.abs(diff) < 0.001) {
      // Within 0.001% difference, consider equal
      return a.investment.ticker.localeCompare(b.investment.ticker)
    }
    return diff
  })

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

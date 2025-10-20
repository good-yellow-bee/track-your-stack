import { Investment } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { getCurrencyRate } from '@/lib/services/priceService'

/**
 * Metrics for a single investment
 */
export interface InvestmentMetrics {
  currentValue: number
  totalCost: number
  gainLossDollar: number
  gainLossPercent: number
}

/**
 * Calculate metrics for a single investment in its purchase currency
 */
export function calculateInvestmentMetrics(investment: Investment): InvestmentMetrics {
  const currentPrice = investment.currentPrice?.toNumber() || 0
  const totalQuantity = investment.totalQuantity.toNumber()
  const averageCostBasis = investment.averageCostBasis.toNumber()

  const currentValue = currentPrice * totalQuantity
  const totalCost = averageCostBasis * totalQuantity
  const gainLossDollar = currentValue - totalCost
  const gainLossPercent = totalCost > 0 ? (gainLossDollar / totalCost) * 100 : 0

  return {
    currentValue,
    totalCost,
    gainLossDollar,
    gainLossPercent,
  }
}

/**
 * Calculate investment metrics converted to a target currency
 */
export async function convertToBaseCurrency(
  investment: Investment,
  baseCurrency: string
): Promise<InvestmentMetrics> {
  const metrics = calculateInvestmentMetrics(investment)

  // If already in base currency, return as-is
  if (investment.purchaseCurrency === baseCurrency) {
    return metrics
  }

  // Get exchange rate and convert
  const rate = await getCurrencyRate(investment.purchaseCurrency, baseCurrency)

  return {
    currentValue: metrics.currentValue * rate,
    totalCost: metrics.totalCost * rate,
    gainLossDollar: metrics.gainLossDollar * rate,
    gainLossPercent: metrics.gainLossPercent, // Percentage stays the same
  }
}

/**
 * Calculate weighted average cost basis for multiple purchases
 */
export function calculateAverageCostBasis(
  purchases: Array<{ quantity: number; pricePerUnit: number }>
): number {
  if (purchases.length === 0) return 0

  const totalQuantity = purchases.reduce((sum, p) => sum + p.quantity, 0)
  const totalCost = purchases.reduce((sum, p) => sum + p.quantity * p.pricePerUnit, 0)

  return totalQuantity > 0 ? totalCost / totalQuantity : 0
}

/**
 * Calculate aggregated investment metrics with weighted average
 * Uses Decimal arithmetic for precision in financial calculations
 *
 * @param existingQty - Current total quantity (Decimal)
 * @param existingAvg - Current average cost basis (Decimal)
 * @param newQty - New quantity to add (number)
 * @param newPrice - New price per unit (number)
 * @returns Object with new total quantity and average cost basis
 */
export function calculateAggregatedInvestment(
  existingQty: Decimal,
  existingAvg: Decimal,
  newQty: number,
  newPrice: number
): { totalQuantity: Decimal; averageCostBasis: Decimal } {
  const newQtyDecimal = new Decimal(newQty)
  const newPriceDecimal = new Decimal(newPrice)

  // Calculate: totalQty = existingQty + newQty
  const totalQuantity = existingQty.plus(newQtyDecimal)

  // Calculate: totalCost = (existingQty * existingAvg) + (newQty * newPrice)
  const totalCost = existingQty.times(existingAvg).plus(newQtyDecimal.times(newPriceDecimal))

  // Calculate: newAvgCostBasis = totalCost / totalQty
  const averageCostBasis = totalCost.dividedBy(totalQuantity)

  return {
    totalQuantity,
    averageCostBasis,
  }
}

import { Prisma } from '@prisma/client'

// Portfolio with all relations
export type PortfolioWithInvestments = Prisma.PortfolioGetPayload<{
  include: {
    investments: {
      include: {
        transactions: true
      }
    }
  }
}>

// Investment with transactions
export type InvestmentWithTransactions = Prisma.InvestmentGetPayload<{
  include: {
    transactions: true
  }
}>

// User with portfolios
export type UserWithPortfolios = Prisma.UserGetPayload<{
  include: {
    portfolios: true
  }
}>

// Portfolio snapshot type
export type PortfolioSnapshot = Prisma.PortfolioSnapshotGetPayload<Record<string, never>>

// Currency rate type
export type CurrencyRate = Prisma.CurrencyRateGetPayload<Record<string, never>>

// Transaction type
export type PurchaseTransaction = Prisma.PurchaseTransactionGetPayload<Record<string, never>>

// Investment summary (for dashboard)
export interface InvestmentSummary {
  ticker: string
  assetName: string
  assetType: string
  totalQuantity: number
  averageCostBasis: number
  currentPrice: number | null
  totalCost: number
  currentValue: number | null
  gainLoss: number | null
  gainLossPercentage: number | null
  currency: string
}

// Portfolio summary (for dashboard)
export interface PortfolioSummary {
  id: string
  name: string
  baseCurrency: string
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercentage: number
  investmentCount: number
  lastUpdated: Date
}

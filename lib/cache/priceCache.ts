import { prisma } from '@/lib/prisma'
import { PRICE_CACHE_TTL } from '@/lib/constants'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Check if cached price is still fresh
 */
export function isCacheFresh(lastUpdated: Date | null, ttl: number): boolean {
  if (!lastUpdated) return false
  const now = Date.now()
  const cacheAge = now - lastUpdated.getTime()
  return cacheAge < ttl
}

/**
 * Get cached stock price from investment record
 */
export async function getCachedStockPrice(ticker: string) {
  const investment = await prisma.investment.findFirst({
    where: { ticker: ticker.toUpperCase() },
    select: {
      currentPrice: true,
      priceUpdatedAt: true,
    },
    orderBy: {
      priceUpdatedAt: 'desc',
    },
  })

  if (!investment || !investment.currentPrice) {
    return null
  }

  const isFresh = isCacheFresh(investment.priceUpdatedAt, PRICE_CACHE_TTL.STOCK)

  return {
    price: investment.currentPrice,
    lastUpdated: investment.priceUpdatedAt,
    isFresh,
  }
}

/**
 * Get cached currency rate
 */
export async function getCachedCurrencyRate(from: string, to: string) {
  if (from === to) {
    return { rate: new Decimal(1), lastUpdated: new Date(), isFresh: true }
  }

  const cached = await prisma.currencyRate.findUnique({
    where: {
      fromCurrency_toCurrency: {
        fromCurrency: from.toUpperCase(),
        toCurrency: to.toUpperCase(),
      },
    },
  })

  if (!cached) {
    return null
  }

  const isFresh = isCacheFresh(cached.fetchedAt, PRICE_CACHE_TTL.CURRENCY)

  return {
    rate: cached.rate,
    lastUpdated: cached.fetchedAt,
    isFresh,
  }
}

/**
 * Update cached currency rate
 */
export async function updateCachedCurrencyRate(from: string, to: string, rate: number) {
  await prisma.currencyRate.upsert({
    where: {
      fromCurrency_toCurrency: {
        fromCurrency: from.toUpperCase(),
        toCurrency: to.toUpperCase(),
      },
    },
    create: {
      fromCurrency: from.toUpperCase(),
      toCurrency: to.toUpperCase(),
      rate,
      fetchedAt: new Date(),
    },
    update: {
      rate,
      fetchedAt: new Date(),
    },
  })
}

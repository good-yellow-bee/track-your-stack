import { prisma } from '@/lib/prisma'
import { PRICE_CACHE_TTL } from '@/lib/constants'
import { Decimal } from '@prisma/client/runtime/library'

// In-memory lock to prevent duplicate API calls for the same currency pair
// TODO: PRODUCTION LIMITATION - This is an in-memory lock that doesn't work across
// server instances in distributed environments. For production, consider using:
// - Redis locks (recommended): SET key value NX EX ttl
// - PostgreSQL advisory locks: pg_try_advisory_lock()
// - Distributed lock service (e.g., AWS DynamoDB, Consul)
const currencyRateLocks = new Map<string, Promise<void>>()

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
 * Update cached currency rate with lock to prevent race conditions
 */
export async function updateCachedCurrencyRate(from: string, to: string, rate: number) {
  const lockKey = `${from.toUpperCase()}_${to.toUpperCase()}`

  // Check if an update is already in progress for this currency pair
  const existingLock = currencyRateLocks.get(lockKey)
  if (existingLock) {
    // Wait for the existing update to complete
    await existingLock
    return
  }

  // Create a new lock
  const updatePromise = (async () => {
    try {
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
    } finally {
      // Always remove the lock when done
      currencyRateLocks.delete(lockKey)
    }
  })()

  // Store the lock
  currencyRateLocks.set(lockKey, updatePromise)

  // Wait for completion
  await updatePromise
}

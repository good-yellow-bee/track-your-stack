import { alphaVantageClient } from '@/lib/api/alphaVantage'
import {
  getCachedStockPrice,
  getCachedCurrencyRate,
  updateCachedCurrencyRate,
} from '@/lib/cache/priceCache'
import { AssetType } from '@prisma/client'

/**
 * Price data with currency information
 */
export interface PriceData {
  price: number
  currency: string
}

/**
 * Get current price for any asset (with caching)
 */
export async function getAssetPrice(ticker: string, assetType: AssetType): Promise<PriceData> {
  // Check cache first
  const cached = await getCachedStockPrice(ticker)
  if (cached && cached.isFresh) {
    return {
      price: cached.price.toNumber(),
      currency: 'USD', // Default currency for cached prices
    }
  }

  // Fetch fresh price
  if (assetType === 'CRYPTO') {
    const cryptoPrice = await alphaVantageClient.getCryptoPrice(ticker, 'USD')
    return {
      price: cryptoPrice.price,
      currency: cryptoPrice.currency,
    }
  } else {
    const stockQuote = await alphaVantageClient.getStockQuote(ticker)
    return {
      price: stockQuote.price,
      currency: 'USD', // Stock prices are in USD
    }
  }
}

/**
 * Get currency exchange rate (with caching)
 */
export async function getCurrencyRate(from: string, to: string): Promise<number> {
  if (from === to) return 1

  // Check cache first
  const cached = await getCachedCurrencyRate(from, to)
  if (cached && cached.isFresh) {
    return cached.rate.toNumber()
  }

  // Fetch fresh rate
  const exchangeRate = await alphaVantageClient.getExchangeRate(from, to)

  // Update cache
  await updateCachedCurrencyRate(from, to, exchangeRate.rate)

  return exchangeRate.rate
}

/**
 * Search for ticker symbols
 */
export async function searchTickers(query: string) {
  if (!query || query.trim().length < 1) {
    return []
  }

  return await alphaVantageClient.searchSymbol(query)
}

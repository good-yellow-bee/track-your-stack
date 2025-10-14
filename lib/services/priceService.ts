import { alphaVantageClient } from '@/lib/api/alphaVantage'
import {
  getCachedStockPrice,
  getCachedCurrencyRate,
  updateCachedCurrencyRate,
} from '@/lib/cache/priceCache'
import { AssetType } from '@prisma/client'

/**
 * Get current price for any asset (with caching)
 */
export async function getAssetPrice(ticker: string, assetType: AssetType): Promise<number> {
  // Check cache first
  const cached = await getCachedStockPrice(ticker)
  if (cached && cached.isFresh) {
    return cached.price.toNumber()
  }

  // Fetch fresh price
  if (assetType === 'CRYPTO') {
    const cryptoPrice = await alphaVantageClient.getCryptoPrice(ticker, 'USD')
    return cryptoPrice.price
  } else {
    const stockQuote = await alphaVantageClient.getStockQuote(ticker)
    return stockQuote.price
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

import axios, { AxiosError } from 'axios'
import { getRateLimiter, incrementRequestCount } from './rateLimiter'
import {
  GlobalQuoteResponse,
  CryptoExchangeRateResponse,
  SymbolSearchResponse,
  StockQuote,
  CryptoPrice,
  ExchangeRate,
  SymbolMatch,
  AlphaVantageError,
} from '@/types/alpha-vantage'

const BASE_URL = 'https://www.alphavantage.co/query'
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY

if (!API_KEY) {
  console.warn('⚠️ ALPHA_VANTAGE_API_KEY not set')
}

export class AlphaVantageClient {
  private limiter = getRateLimiter()

  /**
   * Make rate-limited API request
   */
  private async request<T>(params: Record<string, string>): Promise<T> {
    return this.limiter.schedule(async () => {
      try {
        incrementRequestCount()

        const response = await axios.get<T>(BASE_URL, {
          params: {
            ...params,
            apikey: API_KEY,
          },
          timeout: 10000,
        })

        // Runtime type check and API error validation
        const data = response.data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid API response: expected object')
        }

        const dataObj = data as Record<string, unknown>
        if (dataObj['Error Message'] || dataObj['Note'] || dataObj['Information']) {
          const error = dataObj as AlphaVantageError
          throw new Error(
            error['Error Message'] || error['Note'] || error['Information'] || 'API Error'
          )
        }

        return data as T
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - Alpha Vantage API not responding')
          }
          if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded - please try again later')
          }
        }
        throw error
      }
    })
  }

  /**
   * Get real-time stock/ETF quote
   */
  async getStockQuote(symbol: string): Promise<StockQuote> {
    const data = await this.request<GlobalQuoteResponse>({
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
    })

    const quote = data['Global Quote']

    // Runtime validation of required fields
    if (
      !quote ||
      typeof quote !== 'object' ||
      !quote['05. price'] ||
      !quote['01. symbol']
    ) {
      throw new Error(`No data found for symbol: ${symbol}`)
    }

    // Safe parsing with fallbacks
    const price = parseFloat(quote['05. price'])
    if (isNaN(price)) {
      throw new Error(`Invalid price data for symbol: ${symbol}`)
    }

    return {
      symbol: quote['01. symbol'],
      price,
      previousClose: parseFloat(quote['08. previous close'] || '0'),
      change: parseFloat(quote['09. change'] || '0'),
      changePercent: parseFloat((quote['10. change percent'] || '0%').replace('%', '')),
      volume: parseInt(quote['06. volume'] || '0'),
      lastUpdated: new Date(quote['07. latest trading day']),
    }
  }

  /**
   * Get cryptocurrency price
   */
  async getCryptoPrice(symbol: string, currency: string = 'USD'): Promise<CryptoPrice> {
    const data = await this.request<CryptoExchangeRateResponse>({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: symbol.toUpperCase(),
      to_currency: currency.toUpperCase(),
    })

    const rate = data['Realtime Currency Exchange Rate']

    // Runtime validation of required fields
    if (
      !rate ||
      typeof rate !== 'object' ||
      !rate['5. Exchange Rate'] ||
      !rate['1. From_Currency Code']
    ) {
      throw new Error(`No data found for crypto: ${symbol}`)
    }

    const price = parseFloat(rate['5. Exchange Rate'])
    if (isNaN(price)) {
      throw new Error(`Invalid price data for crypto: ${symbol}`)
    }

    return {
      symbol: rate['1. From_Currency Code'],
      price,
      currency: rate['3. To_Currency Code'],
      lastUpdated: new Date(rate['6. Last Refreshed']),
    }
  }

  /**
   * Get currency exchange rate
   */
  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    const data = await this.request<CryptoExchangeRateResponse>({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: from.toUpperCase(),
      to_currency: to.toUpperCase(),
    })

    const rate = data['Realtime Currency Exchange Rate']

    // Runtime validation of required fields
    if (
      !rate ||
      typeof rate !== 'object' ||
      !rate['5. Exchange Rate'] ||
      !rate['1. From_Currency Code'] ||
      !rate['3. To_Currency Code']
    ) {
      throw new Error(`No exchange rate found for ${from}/${to}`)
    }

    const exchangeRate = parseFloat(rate['5. Exchange Rate'])
    if (isNaN(exchangeRate)) {
      throw new Error(`Invalid exchange rate for ${from}/${to}`)
    }

    return {
      from: rate['1. From_Currency Code'],
      to: rate['3. To_Currency Code'],
      rate: exchangeRate,
      lastUpdated: new Date(rate['6. Last Refreshed']),
    }
  }

  /**
   * Search for ticker symbols
   */
  async searchSymbol(keywords: string): Promise<SymbolMatch[]> {
    const data = await this.request<SymbolSearchResponse>({
      function: 'SYMBOL_SEARCH',
      keywords: keywords.trim(),
    })

    if (!data.bestMatches || data.bestMatches.length === 0) {
      return []
    }

    return data.bestMatches.map((match) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
      matchScore: parseFloat(match['9. matchScore']),
    }))
  }
}

// Singleton instance
export const alphaVantageClient = new AlphaVantageClient()

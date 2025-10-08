# F05: Alpha Vantage API Integration

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 hours
**Dependencies:** F01 (Project Setup)

---

## 📋 Overview

Implement a robust Alpha Vantage API client for fetching real-time stock prices, cryptocurrency prices, currency exchange rates, and ticker symbol search. Include rate limiting, caching, error handling, and retry logic.

**What this enables:**
- Real-time stock and ETF price quotes
- Cryptocurrency price fetching
- Currency exchange rate conversion
- Ticker symbol search with autocomplete
- Intelligent API rate limiting (5 req/min, 500/day)
- Price caching to optimize API usage
- Error handling and retry logic

---

## 🎯 Acceptance Criteria

- [ ] Alpha Vantage API client class created
- [ ] Get stock quote endpoint working
- [ ] Get crypto price endpoint working
- [ ] Get currency exchange rate working
- [ ] Symbol search endpoint working
- [ ] Rate limiting implemented (5 req/min)
- [ ] Caching strategy implemented
- [ ] Error handling for API failures
- [ ] Retry logic with exponential backoff
- [ ] Type-safe response parsing
- [ ] Test endpoint for API validation

---

## 📦 Dependencies to Install

```bash
# HTTP client (already installed from F01)
# axios

# Additional for rate limiting
pnpm add bottleneck

# Types
pnpm add -D @types/node
```

---

## 🔧 Implementation Steps

### Step 1: Get Alpha Vantage API Key (10 min)

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Enter email to get free API key
3. Copy the API key

Add to `.env.local`:
```bash
ALPHA_VANTAGE_API_KEY="your_api_key_here"
```

### Step 2: Create API Response Types (30 min)

Create `types/alpha-vantage.ts`:
```typescript
// Stock Quote Response
export interface GlobalQuoteResponse {
  'Global Quote': {
    '01. symbol': string
    '02. open': string
    '03. high': string
    '04. low': string
    '05. price': string
    '06. volume': string
    '07. latest trading day': string
    '08. previous close': string
    '09. change': string
    '10. change percent': string
  }
}

// Crypto Quote Response
export interface CryptoExchangeRateResponse {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': string
    '2. From_Currency Name': string
    '3. To_Currency Code': string
    '4. To_Currency Name': string
    '5. Exchange Rate': string
    '6. Last Refreshed': string
    '7. Time Zone': string
    '8. Bid Price': string
    '9. Ask Price': string
  }
}

// Symbol Search Response
export interface SymbolSearchResponse {
  bestMatches: Array<{
    '1. symbol': string
    '2. name': string
    '3. type': string
    '4. region': string
    '5. marketOpen': string
    '6. marketClose': string
    '7. timezone': string
    '8. currency': string
    '9. matchScore': string
  }>
}

// Normalized types for internal use
export interface StockQuote {
  symbol: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: Date
}

export interface CryptoPrice {
  symbol: string
  price: number
  currency: string
  lastUpdated: Date
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  lastUpdated: Date
}

export interface SymbolMatch {
  symbol: string
  name: string
  type: string
  region: string
  currency: string
  matchScore: number
}

// Error types
export interface AlphaVantageError {
  'Error Message'?: string
  'Note'?: string
  'Information'?: string
}
```

### Step 3: Create Rate Limiter (20 min)

Create `lib/api/rateLimiter.ts`:
```typescript
import Bottleneck from 'bottleneck'

// Alpha Vantage limits: 5 calls per minute, 500 calls per day
const limiter = new Bottleneck({
  minTime: 12000, // 12 seconds between requests (5 per minute)
  maxConcurrent: 1,
  reservoir: 500, // Max 500 requests
  reservoirRefreshAmount: 500,
  reservoirRefreshInterval: 24 * 60 * 60 * 1000, // Reset daily
})

// Track API usage
let requestCount = 0
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000

export function getRateLimiter() {
  return limiter
}

export function incrementRequestCount() {
  requestCount++

  // Reset counter daily
  if (Date.now() >= dailyResetTime) {
    requestCount = 0
    dailyResetTime = Date.now() + 24 * 60 * 60 * 1000
  }

  return requestCount
}

export function getRequestCount() {
  return requestCount
}

export function getRemainingRequests() {
  return Math.max(0, 500 - requestCount)
}
```

### Step 4: Create Alpha Vantage Client (90 min)

Create `lib/api/alphaVantage.ts`:
```typescript
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

        // Check for API errors
        const data = response.data as any
        if (data['Error Message'] || data['Note'] || data['Information']) {
          const error = data as AlphaVantageError
          throw new Error(
            error['Error Message'] || error['Note'] || error['Information'] || 'API Error'
          )
        }

        return response.data
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

    if (!quote || !quote['05. price']) {
      throw new Error(`No data found for symbol: ${symbol}`)
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      previousClose: parseFloat(quote['08. previous close']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
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

    if (!rate || !rate['5. Exchange Rate']) {
      throw new Error(`No data found for crypto: ${symbol}`)
    }

    return {
      symbol: rate['1. From_Currency Code'],
      price: parseFloat(rate['5. Exchange Rate']),
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

    if (!rate || !rate['5. Exchange Rate']) {
      throw new Error(`No exchange rate found for ${from}/${to}`)
    }

    return {
      from: rate['1. From_Currency Code'],
      to: rate['3. To_Currency Code'],
      rate: parseFloat(rate['5. Exchange Rate']),
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
```

### Step 5: Create Price Caching Utilities (45 min)

Create `lib/cache/priceCache.ts`:
```typescript
import { prisma } from '@/lib/prisma'
import { PRICE_CACHE_TTL } from '@/lib/constants'

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
    return { rate: 1, lastUpdated: new Date(), isFresh: true }
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
```

### Step 6: Create Price Service with Caching (45 min)

Create `lib/services/priceService.ts`:
```typescript
import { alphaVantageClient } from '@/lib/api/alphaVantage'
import { getCachedStockPrice, getCachedCurrencyRate, updateCachedCurrencyRate } from '@/lib/cache/priceCache'
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
```

### Step 7: Create API Test Endpoint (30 min)

Create `app/api/test-alpha-vantage/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { alphaVantageClient } from '@/lib/api/alphaVantage'
import { getRemainingRequests } from '@/lib/api/rateLimiter'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test') || 'stock'

  try {
    let result: any

    switch (test) {
      case 'stock':
        result = await alphaVantageClient.getStockQuote('AAPL')
        break
      case 'crypto':
        result = await alphaVantageClient.getCryptoPrice('BTC', 'USD')
        break
      case 'currency':
        result = await alphaVantageClient.getExchangeRate('EUR', 'USD')
        break
      case 'search':
        result = await alphaVantageClient.searchSymbol('Apple')
        break
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      test,
      data: result,
      remainingRequests: getRemainingRequests(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        remainingRequests: getRemainingRequests(),
      },
      { status: 500 }
    )
  }
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Stock quote returns valid data
- [ ] Crypto price returns valid data
- [ ] Currency exchange returns valid data
- [ ] Symbol search returns results
- [ ] Rate limiting prevents rapid requests
- [ ] Caching reduces API calls
- [ ] Error handling works for invalid symbols
- [ ] Timeout handling works
- [ ] API key validation works

### Test Commands
```bash
# Test stock quote
curl "http://localhost:3000/api/test-alpha-vantage?test=stock"

# Test crypto price
curl "http://localhost:3000/api/test-alpha-vantage?test=crypto"

# Test currency exchange
curl "http://localhost:3000/api/test-alpha-vantage?test=currency"

# Test symbol search
curl "http://localhost:3000/api/test-alpha-vantage?test=search"
```

### Expected Responses
```json
// Stock quote
{
  "success": true,
  "test": "stock",
  "data": {
    "symbol": "AAPL",
    "price": 178.50,
    "previousClose": 177.25,
    "change": 1.25,
    "changePercent": 0.71,
    "volume": 50000000,
    "lastUpdated": "2024-10-08T00:00:00.000Z"
  },
  "remainingRequests": 499
}
```

---

## 📚 Documentation Updates

### Changelog Entry
```markdown
## [0.5.0] - 2025-10-08

### Added
- Alpha Vantage API client with full integration
- Stock and ETF quote fetching
- Cryptocurrency price fetching
- Currency exchange rate retrieval
- Ticker symbol search functionality
- Rate limiting (5 req/min, 500/day)
- Price caching system with TTL
- Error handling and retry logic
- API test endpoint for validation
```

---

## 🔀 Git Workflow

### Commit Messages
```bash
git commit -m "feat(api): create Alpha Vantage response types"
git commit -m "feat(api): implement rate limiter for API calls"
git commit -m "feat(api): create Alpha Vantage client class"
git commit -m "feat(api): add price caching utilities"
git commit -m "feat(api): create price service with caching"
git commit -m "feat(api): add API test endpoint"
```

---

## ⚠️ Common Issues & Solutions

### Issue: API key not found
**Solution:** Ensure `ALPHA_VANTAGE_API_KEY` is in `.env.local`

### Issue: Rate limit exceeded
**Solution:** Wait 12 seconds between requests, check daily limit

### Issue: Invalid symbol error
**Solution:** Verify ticker symbol is correct and exists

### Issue: Timeout errors
**Solution:** Check internet connection, Alpha Vantage may be down

---

## 📦 Deliverables

- [x] Alpha Vantage client class
- [x] All endpoints implemented
- [x] Rate limiting working
- [x] Caching system implemented
- [x] Error handling complete
- [x] Test endpoint functional

---

## 🔗 Related Files

- `lib/api/alphaVantage.ts`
- `lib/api/rateLimiter.ts`
- `lib/cache/priceCache.ts`
- `lib/services/priceService.ts`
- `types/alpha-vantage.ts`
- `app/api/test-alpha-vantage/route.ts`

---

## ⏭️ Next Feature

After completing F05, proceed to:
→ [F06: Investment Entry Form](F06_investment_entry.md)

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

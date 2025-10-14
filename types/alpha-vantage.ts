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
  Note?: string
  Information?: string
}

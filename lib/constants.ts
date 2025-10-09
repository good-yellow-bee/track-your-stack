export const APP_NAME = 'Track Your Stack'
export const APP_DESCRIPTION = 'Investment Portfolio Tracker'

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
] as const

export const ASSET_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'ETF', label: 'ETF' },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
] as const

export const PRICE_CACHE_TTL = {
  STOCK: 15 * 60 * 1000, // 15 minutes
  CRYPTO: 5 * 60 * 1000, // 5 minutes
  CURRENCY: 60 * 60 * 1000, // 1 hour
} as const

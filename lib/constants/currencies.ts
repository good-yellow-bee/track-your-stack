/**
 * Shared currency constants for Track Your Stack
 * Used across portfolio and investment forms for consistency
 */

export interface Currency {
  value: string
  label: string
  symbol?: string
}

/**
 * Supported fiat currencies with full labels
 */
export const FIAT_CURRENCIES: Currency[] = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
]

/**
 * Supported cryptocurrencies
 */
export const CRYPTO_CURRENCIES: Currency[] = [
  { value: 'BTC', label: 'BTC - Bitcoin', symbol: '₿' },
  { value: 'ETH', label: 'ETH - Ethereum', symbol: 'Ξ' },
  { value: 'USDT', label: 'USDT - Tether', symbol: '₮' },
  { value: 'USDC', label: 'USDC - USD Coin', symbol: 'USDC' },
]

/**
 * All supported currencies (fiat + crypto)
 */
export const ALL_CURRENCIES: Currency[] = [...FIAT_CURRENCIES, ...CRYPTO_CURRENCIES]

/**
 * Currency codes only (for simple dropdowns)
 */
export const CURRENCY_CODES = ALL_CURRENCIES.map((c) => c.value)

/**
 * Default currency for new portfolios
 */
export const DEFAULT_CURRENCY = 'USD'

/**
 * Get currency symbol by code
 */
export function getCurrencySymbol(code: string): string {
  const currency = ALL_CURRENCIES.find((c) => c.value === code)
  return currency?.symbol || code
}

/**
 * Get currency label by code
 */
export function getCurrencyLabel(code: string): string {
  const currency = ALL_CURRENCIES.find((c) => c.value === code)
  return currency?.label || code
}

/**
 * Check if currency is a cryptocurrency
 */
export function isCryptoCurrency(code: string): boolean {
  return CRYPTO_CURRENCIES.some((c) => c.value === code)
}

/**
 * Check if currency is a fiat currency
 */
export function isFiatCurrency(code: string): boolean {
  return FIAT_CURRENCIES.some((c) => c.value === code)
}

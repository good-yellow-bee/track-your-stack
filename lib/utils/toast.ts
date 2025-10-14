import { toast } from 'sonner'

/**
 * Centralized toast notification utilities for Track Your Stack.
 * Provides type-safe, consistent messaging across the application.
 */
export const toasts = {
  // Portfolio operations
  portfolio: {
    created: () => toast.success('Portfolio created successfully'),
    updated: () => toast.success('Portfolio updated'),
    deleted: () => toast.success('Portfolio deleted'),
    createError: () => toast.error('Failed to create portfolio'),
    updateError: () => toast.error('Failed to update portfolio'),
    deleteError: () => toast.error('Failed to delete portfolio'),
    notFound: () => toast.error('Portfolio not found'),
  },

  // Investment operations
  investment: {
    added: (ticker: string) => toast.success(`${ticker} added to portfolio`),
    updated: (ticker: string) => toast.success(`${ticker} updated`),
    removed: (ticker: string) => toast.success(`${ticker} removed from portfolio`),
    aggregated: (ticker: string, qty: number) =>
      toast.success(`${ticker}: ${qty} ${qty === 1 ? 'share' : 'shares'} aggregated`),
    addError: (ticker?: string) =>
      toast.error(ticker ? `Failed to add ${ticker} to portfolio` : 'Failed to add investment'),
    updateError: (ticker?: string) =>
      toast.error(ticker ? `Failed to update ${ticker}` : 'Failed to update investment'),
    removeError: (ticker?: string) =>
      toast.error(
        ticker ? `Failed to remove ${ticker} from portfolio` : 'Failed to remove investment'
      ),
    notFound: () => toast.error('Investment not found'),
    invalidTicker: () => toast.error('Invalid ticker symbol. Please check and try again.'),
  },

  // Price refresh operations
  prices: {
    refreshing: (portfolioId?: string) =>
      toast.loading('Refreshing prices...', {
        id: portfolioId ? `price-refresh-${portfolioId}` : 'price-refresh',
      }),
    refreshed: (count: number, portfolioId?: string) =>
      toast.success(`${count} ${count === 1 ? 'price' : 'prices'} updated`, {
        id: portfolioId ? `price-refresh-${portfolioId}` : 'price-refresh',
      }),
    failed: (portfolioId?: string) =>
      toast.error('Price refresh failed', {
        id: portfolioId ? `price-refresh-${portfolioId}` : 'price-refresh',
      }),
    partialSuccess: (success: number, total: number, portfolioId?: string) =>
      toast.warning(`${success} of ${total} prices updated. Some prices may be stale.`, {
        id: portfolioId ? `price-refresh-${portfolioId}` : 'price-refresh',
      }),
  },

  // Currency conversion
  currency: {
    converting: (from: string, to: string, investmentId?: string) =>
      toast.loading(`Converting ${from} to ${to}...`, {
        id: investmentId ? `currency-conversion-${investmentId}` : 'currency-conversion',
      }),
    converted: (from: string, to: string, rate: number, investmentId?: string) =>
      toast.success(`Converted at rate: 1 ${from} = ${rate.toFixed(4)} ${to}`, {
        id: investmentId ? `currency-conversion-${investmentId}` : 'currency-conversion',
      }),
    conversionError: (investmentId?: string) =>
      toast.error('Currency conversion failed', {
        id: investmentId ? `currency-conversion-${investmentId}` : 'currency-conversion',
      }),
  },

  // Generic operations
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  warning: (message: string) => toast.warning(message),
  info: (message: string) => toast.info(message),
  loading: (message: string) => toast.loading(message),

  // API/Auth errors
  apiError: () => toast.error('API request failed. Please try again.'),
  authError: () => toast.error('Authentication required. Please sign in.'),
  forbidden: () => toast.error("You don't have permission to perform this action."),
  rateLimitError: () => toast.error('API rate limit exceeded. Please wait a moment and try again.'),
  networkError: () => toast.error('Network error. Please check your connection.'),

  // Form validation
  validation: {
    required: (field: string) => toast.error(`${field} is required`),
    invalid: (field: string) => toast.error(`${field} is invalid`),
    tooShort: (field: string, min: number) =>
      toast.error(`${field} must be at least ${min} characters`),
    tooLong: (field: string, max: number) =>
      toast.error(`${field} must be no more than ${max} characters`),
    mustBePositive: (field: string) => toast.error(`${field} must be a positive number`),
  },

  // Async operations with promise
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return toast.promise(promise, messages)
  },
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock sonner before importing our toast utilities
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
  },
}))

// Import after mocking
import { toasts } from '@/lib/utils/toast'
import { toast } from 'sonner'

describe('Toast Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Portfolio Toasts', () => {
    it('should call toast.success with correct message for created portfolio', () => {
      toasts.portfolio.created()
      expect(toast.success).toHaveBeenCalledWith('Portfolio created successfully')
    })

    it('should call toast.success with correct message for updated portfolio', () => {
      toasts.portfolio.updated()
      expect(toast.success).toHaveBeenCalledWith('Portfolio updated')
    })

    it('should call toast.success with correct message for deleted portfolio', () => {
      toasts.portfolio.deleted()
      expect(toast.success).toHaveBeenCalledWith('Portfolio deleted')
    })

    it('should call toast.error with correct message for portfolio creation error', () => {
      toasts.portfolio.createError()
      expect(toast.error).toHaveBeenCalledWith('Failed to create portfolio')
    })

    it('should call toast.error with correct message for portfolio update error', () => {
      toasts.portfolio.updateError()
      expect(toast.error).toHaveBeenCalledWith('Failed to update portfolio')
    })

    it('should call toast.error with correct message for portfolio deletion error', () => {
      toasts.portfolio.deleteError()
      expect(toast.error).toHaveBeenCalledWith('Failed to delete portfolio')
    })
  })

  describe('Investment Toasts', () => {
    it('should call toast.success with ticker when investment is added', () => {
      toasts.investment.added('AAPL')
      expect(toast.success).toHaveBeenCalledWith('AAPL added to portfolio')
    })

    it('should use ticker as-is without case conversion', () => {
      toasts.investment.added('aapl')
      expect(toast.success).toHaveBeenCalledWith('aapl added to portfolio')
    })

    it('should call toast.success with correct message for single share aggregation', () => {
      toasts.investment.aggregated('TSLA', 1)
      expect(toast.success).toHaveBeenCalledWith('TSLA: 1 share aggregated')
    })

    it('should call toast.success with correct pluralization for multiple shares', () => {
      toasts.investment.aggregated('MSFT', 10)
      expect(toast.success).toHaveBeenCalledWith('MSFT: 10 shares aggregated')
    })

    it('should call toast.success with correct message for investment update', () => {
      toasts.investment.updated('GOOGL')
      expect(toast.success).toHaveBeenCalledWith('GOOGL updated')
    })

    it('should call toast.success with correct message for investment removal', () => {
      toasts.investment.removed('AMZN')
      expect(toast.success).toHaveBeenCalledWith('AMZN removed from portfolio')
    })

    it('should call toast.error with correct message for add error', () => {
      toasts.investment.addError()
      expect(toast.error).toHaveBeenCalledWith('Failed to add investment')
    })

    it('should call toast.error with correct message for update error', () => {
      toasts.investment.updateError()
      expect(toast.error).toHaveBeenCalledWith('Failed to update investment')
    })

    it('should call toast.error with correct message for remove error', () => {
      toasts.investment.removeError()
      expect(toast.error).toHaveBeenCalledWith('Failed to remove investment')
    })
  })

  describe('Price Refresh Toasts', () => {
    it('should call toast.loading with id option for refreshing state', () => {
      const mockId = 'price-refresh-123'
      ;(toast.loading as ReturnType<typeof vi.fn>).mockReturnValue(mockId)

      const result = toasts.prices.refreshing()

      expect(toast.loading).toHaveBeenCalledWith('Refreshing prices...', { id: 'price-refresh' })
      expect(result).toBe(mockId)
    })

    it('should call toast.success with singular price count and id option', () => {
      toasts.prices.refreshed(1)
      expect(toast.success).toHaveBeenCalledWith('1 price updated', { id: 'price-refresh' })
    })

    it('should call toast.success with plural price count and id option', () => {
      toasts.prices.refreshed(5)
      expect(toast.success).toHaveBeenCalledWith('5 prices updated', { id: 'price-refresh' })
    })

    it('should call toast.error with correct message for refresh failure', () => {
      toasts.prices.failed()
      expect(toast.error).toHaveBeenCalledWith('Price refresh failed', { id: 'price-refresh' })
    })
  })

  describe('Currency Conversion Toasts', () => {
    it('should call toast.loading with correct message for currency conversion', () => {
      toasts.currency.converting('EUR', 'USD')
      expect(toast.loading).toHaveBeenCalledWith('Converting EUR to USD...', {
        id: 'currency-conversion',
      })
    })

    it('should call toast.success with conversion rate', () => {
      toasts.currency.converted('GBP', 'USD', 1.27)
      expect(toast.success).toHaveBeenCalledWith('Converted at rate: 1 GBP = 1.2700 USD', {
        id: 'currency-conversion',
      })
    })

    it('should call toast.error with correct message for conversion failure', () => {
      toasts.currency.conversionError()
      expect(toast.error).toHaveBeenCalledWith('Currency conversion failed', {
        id: 'currency-conversion',
      })
    })
  })

  describe('Generic Toasts', () => {
    it('should call toast.success with custom message', () => {
      toasts.success('Custom success message')
      expect(toast.success).toHaveBeenCalledWith('Custom success message')
    })

    it('should call toast.error with custom message', () => {
      toasts.error('Custom error message')
      expect(toast.error).toHaveBeenCalledWith('Custom error message')
    })

    it('should call toast.loading with custom message and return ID', () => {
      const mockId = 'loading-123'
      ;(toast.loading as ReturnType<typeof vi.fn>).mockReturnValue(mockId)

      const result = toasts.loading('Processing...')

      expect(toast.loading).toHaveBeenCalledWith('Processing...')
      expect(result).toBe(mockId)
    })

    it('should call toast.info with custom message', () => {
      toasts.info('Information message')
      expect(toast.info).toHaveBeenCalledWith('Information message')
    })
  })

  describe('Common Error Toasts', () => {
    it('should call toast.error with auth error message', () => {
      toasts.authError()
      expect(toast.error).toHaveBeenCalledWith('Authentication required. Please sign in.')
    })

    it('should call toast.error with forbidden message', () => {
      toasts.forbidden()
      expect(toast.error).toHaveBeenCalledWith("You don't have permission to perform this action.")
    })

    it('should call toast.error with rate limit message', () => {
      toasts.rateLimitError()
      expect(toast.error).toHaveBeenCalledWith(
        'API rate limit exceeded. Please wait a moment and try again.'
      )
    })
  })

  describe('Form Validation Toasts', () => {
    it('should call toast.error with required field message', () => {
      toasts.validation.required('Portfolio name')
      expect(toast.error).toHaveBeenCalledWith('Portfolio name is required')
    })

    it('should call toast.error with positive number validation', () => {
      toasts.validation.mustBePositive('Quantity')
      expect(toast.error).toHaveBeenCalledWith('Quantity must be a positive number')
    })

    it('should call toast.error with invalid field message', () => {
      toasts.validation.invalid('Email')
      expect(toast.error).toHaveBeenCalledWith('Email is invalid')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty ticker gracefully', () => {
      toasts.investment.added('')
      expect(toast.success).toHaveBeenCalledWith(' added to portfolio')
    })

    it('should handle zero quantity in aggregation', () => {
      toasts.investment.aggregated('AAPL', 0)
      expect(toast.success).toHaveBeenCalledWith('AAPL: 0 shares aggregated')
    })

    it('should handle negative quantity in price refresh (edge case)', () => {
      toasts.prices.refreshed(-1)
      expect(toast.success).toHaveBeenCalledWith('-1 prices updated', { id: 'price-refresh' })
    })

    it('should handle very large numbers in aggregation', () => {
      toasts.investment.aggregated('BRK.A', 1000000)
      expect(toast.success).toHaveBeenCalledWith('BRK.A: 1000000 shares aggregated')
    })

    it('should handle decimal quantities', () => {
      toasts.investment.aggregated('BTC', 0.5)
      expect(toast.success).toHaveBeenCalledWith('BTC: 0.5 shares aggregated')
    })
  })

  describe('Type Safety', () => {
    it('should accept valid ticker strings', () => {
      expect(() => toasts.investment.added('AAPL')).not.toThrow()
      expect(() => toasts.investment.added('BRK.A')).not.toThrow()
      expect(() => toasts.investment.added('BTC-USD')).not.toThrow()
    })

    it('should accept valid quantity numbers', () => {
      expect(() => toasts.investment.aggregated('AAPL', 1)).not.toThrow()
      expect(() => toasts.investment.aggregated('AAPL', 100.5)).not.toThrow()
      expect(() => toasts.investment.aggregated('AAPL', 0)).not.toThrow()
    })

    it('should accept valid currency codes', () => {
      expect(() => toasts.currency.converting('USD', 'EUR')).not.toThrow()
      expect(() => toasts.currency.converted('GBP', 'JPY', 180.5)).not.toThrow()
    })
  })
})

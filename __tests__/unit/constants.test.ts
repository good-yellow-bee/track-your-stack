import { describe, it, expect } from 'vitest'
import { CURRENCIES, ASSET_TYPES, PRICE_CACHE_TTL } from '@/lib/constants'

describe('Constants', () => {
  describe('CURRENCIES', () => {
    it('should have valid currency definitions', () => {
      expect(CURRENCIES.length).toBeGreaterThan(0)
      CURRENCIES.forEach((currency) => {
        expect(currency).toHaveProperty('code')
        expect(currency).toHaveProperty('symbol')
        expect(currency).toHaveProperty('name')
      })
    })

    it('should include major currencies', () => {
      const codes = CURRENCIES.map((c) => c.code)
      expect(codes).toContain('USD')
      expect(codes).toContain('EUR')
      expect(codes).toContain('GBP')
    })
  })

  describe('ASSET_TYPES', () => {
    it('should have valid asset type definitions', () => {
      expect(ASSET_TYPES.length).toBeGreaterThan(0)
      ASSET_TYPES.forEach((type) => {
        expect(type).toHaveProperty('value')
        expect(type).toHaveProperty('label')
      })
    })
  })

  describe('PRICE_CACHE_TTL', () => {
    it('should have positive TTL values', () => {
      expect(PRICE_CACHE_TTL.STOCK).toBeGreaterThan(0)
      expect(PRICE_CACHE_TTL.CRYPTO).toBeGreaterThan(0)
      expect(PRICE_CACHE_TTL.CURRENCY).toBeGreaterThan(0)
    })
  })
})

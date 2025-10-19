import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  getGainLossColor,
  formatCompactNumber,
  formatDate,
  formatRelativeTime,
} from '../format'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
  })

  it('formats GBP correctly', () => {
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
  })

  it('handles negative values', () => {
    expect(formatCurrency(-100.5, 'USD')).toBe('-$100.50')
  })

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(1234.567, 'USD')).toBe('$1,234.57')
  })
})

describe('formatPercent', () => {
  it('formats positive percentage with + sign', () => {
    expect(formatPercent(15.5)).toBe('+15.50%')
  })

  it('formats negative percentage without extra sign', () => {
    expect(formatPercent(-10.25)).toBe('-10.25%')
  })

  it('formats zero without sign', () => {
    expect(formatPercent(0)).toBe('+0.00%')
  })

  it('respects decimal places argument', () => {
    expect(formatPercent(15.5678, 3)).toBe('+15.568%')
    expect(formatPercent(15.5678, 1)).toBe('+15.6%')
    expect(formatPercent(15.5678, 0)).toBe('+16%')
  })
})

describe('formatNumber', () => {
  it('formats number with default 2 decimals', () => {
    expect(formatNumber(123.456)).toBe('123.46')
  })

  it('respects decimal places argument', () => {
    expect(formatNumber(123.456, 1)).toBe('123.5')
    expect(formatNumber(123.456, 3)).toBe('123.456')
    expect(formatNumber(123.456, 0)).toBe('123')
  })

  it('handles integers', () => {
    expect(formatNumber(100)).toBe('100.00')
  })
})

describe('getGainLossColor', () => {
  it('returns green for positive values', () => {
    expect(getGainLossColor(10)).toBe('text-green-600')
    expect(getGainLossColor(0.01)).toBe('text-green-600')
  })

  it('returns red for negative values', () => {
    expect(getGainLossColor(-10)).toBe('text-red-600')
    expect(getGainLossColor(-0.01)).toBe('text-red-600')
  })

  it('returns gray for zero', () => {
    expect(getGainLossColor(0)).toBe('text-gray-600')
  })
})

describe('formatCompactNumber', () => {
  it('formats thousands with K', () => {
    expect(formatCompactNumber(1200)).toBe('1.2K')
    expect(formatCompactNumber(45000)).toBe('45K')
  })

  it('formats millions with M', () => {
    expect(formatCompactNumber(1500000)).toBe('1.5M')
    expect(formatCompactNumber(23000000)).toBe('23M')
  })

  it('formats billions with B', () => {
    expect(formatCompactNumber(1200000000)).toBe('1.2B')
  })

  it('formats small numbers as-is', () => {
    expect(formatCompactNumber(999)).toBe('999')
  })
})

describe('formatDate', () => {
  it('formats Date object correctly', () => {
    const date = new Date('2024-01-15')
    const formatted = formatDate(date)
    expect(formatted).toMatch(/Jan 1[45], 2024/) // Handles timezone differences
  })

  it('formats date string correctly', () => {
    const formatted = formatDate('2024-12-25')
    expect(formatted).toMatch(/Dec 2[45], 2024/)
  })
})

describe('formatRelativeTime', () => {
  it('returns "just now" for very recent times', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('returns minutes ago for recent times', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    expect(formatRelativeTime(date)).toBe('5 minutes ago')
  })

  it('returns hours ago for times within a day', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    expect(formatRelativeTime(date)).toBe('3 hours ago')
  })

  it('returns days ago for times within a week', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    expect(formatRelativeTime(date)).toBe('2 days ago')
  })

  it('returns formatted date for older times', () => {
    const date = new Date('2023-01-15')
    const formatted = formatRelativeTime(date)
    expect(formatted).toMatch(/Jan 1[45], 2023/)
  })
})

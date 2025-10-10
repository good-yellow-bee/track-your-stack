import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should handle conditional classes', () => {
      expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
      expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
    })

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2')
    })
  })
})

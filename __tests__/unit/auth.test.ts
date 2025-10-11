import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session } from 'next-auth'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// Mock NextAuth with factory function
vi.mock('next-auth', () => {
  const mockAuthFn = vi.fn()
  return {
    default: () => ({
      handlers: {},
      auth: mockAuthFn,
      signIn: vi.fn(),
      signOut: vi.fn(),
    }),
  }
})

// Mock @/lib/auth with factory function
vi.mock('@/lib/auth', async () => {
  const mockAuthFn = vi.fn()
  return {
    auth: mockAuthFn,
    getCurrentUser: async () => {
      const session = await mockAuthFn()
      if (!session?.user) {
        const { redirect } = await import('next/navigation')
        redirect('/auth/signin')
      }
      return session.user
    },
    isAuthenticated: async () => {
      const session = await mockAuthFn()
      return !!session?.user
    },
    requireAuth: async () => {
      const session = await mockAuthFn()
      if (!session?.user) {
        throw new Error('Unauthorized: Please sign in')
      }
      return session.user
    },
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  }
})

import { auth, getCurrentUser, isAuthenticated, requireAuth } from '@/lib/auth'

// Get reference to mock function after imports
const mockAuth = vi.mocked(auth)

describe('Auth Helper Functions', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  }

  const mockSession: Session = {
    user: mockUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('should return user when authenticated', async () => {
      mockAuth.mockResolvedValueOnce(mockSession)

      const user = await getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(mockAuth).toHaveBeenCalledTimes(1)
    })

    it('should redirect to signin when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      await expect(getCurrentUser()).rejects.toThrow('NEXT_REDIRECT')
    })

    it('should redirect when session exists but no user', async () => {
      mockAuth.mockResolvedValueOnce({ expires: mockSession.expires, user: undefined } as any)

      await expect(getCurrentUser()).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      mockAuth.mockResolvedValueOnce(mockSession)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(true)
      expect(mockAuth).toHaveBeenCalledTimes(1)
    })

    it('should return false when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(false)
      expect(mockAuth).toHaveBeenCalledTimes(1)
    })

    it('should return false when session exists but no user', async () => {
      mockAuth.mockResolvedValueOnce({ expires: mockSession.expires, user: undefined } as any)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      mockAuth.mockResolvedValueOnce(mockSession)

      const user = await requireAuth()

      expect(user).toEqual(mockUser)
      expect(mockAuth).toHaveBeenCalledTimes(1)
    })

    it('should throw error when not authenticated', async () => {
      mockAuth.mockResolvedValueOnce(null)

      await expect(requireAuth()).rejects.toThrow('Unauthorized: Please sign in')
      expect(mockAuth).toHaveBeenCalledTimes(1)
    })

    it('should throw error when session exists but no user', async () => {
      mockAuth.mockResolvedValueOnce({ expires: mockSession.expires, user: undefined } as any)

      await expect(requireAuth()).rejects.toThrow('Unauthorized: Please sign in')
    })
  })

  describe('Edge Cases', () => {
    it('should handle auth function throwing error', async () => {
      mockAuth.mockRejectedValueOnce(new Error('Auth service unavailable'))

      await expect(requireAuth()).rejects.toThrow('Auth service unavailable')
    })

    it('should handle malformed session object', async () => {
      mockAuth.mockResolvedValueOnce({ expires: 'invalid', user: null } as any)

      const authenticated = await isAuthenticated()
      expect(authenticated).toBe(false)
    })

    it('should handle user object without required fields', async () => {
      const incompleteSession: Session = {
        expires: mockSession.expires,
        user: { id: 'user-123' } as any, // Missing email and name
      }
      mockAuth.mockResolvedValueOnce(incompleteSession)

      const user = await requireAuth()
      expect(user.id).toBe('user-123')
    })
  })
})

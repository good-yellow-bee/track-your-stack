import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session } from 'next-auth'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

// Import the actual functions first (they will be mocked)
import { auth, getCurrentUser, isAuthenticated, requireAuth } from '@/lib/auth'

// Mock NextAuth
vi.mock('next-auth', () => {
  return {
    default: () => ({
      handlers: {},
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    }),
  }
})

// Mock @/lib/auth
vi.mock('@/lib/auth', () => {
  return {
    auth: vi.fn<() => Promise<Session | null>>(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    requireAuth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: {},
  }
})

// Cast to get proper type
const mockAuth = auth as unknown as ReturnType<typeof vi.fn<() => Promise<Session | null>>>
const mockGetCurrentUser = getCurrentUser as unknown as ReturnType<typeof vi.fn>
const mockIsAuthenticated = isAuthenticated as unknown as ReturnType<typeof vi.fn>
const mockRequireAuth = requireAuth as unknown as ReturnType<typeof vi.fn>

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
      mockGetCurrentUser.mockResolvedValueOnce(mockUser)

      const user = await getCurrentUser()

      expect(user).toEqual(mockUser)
      expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
    })

    it('should redirect to signin when not authenticated', async () => {
      mockGetCurrentUser.mockRejectedValueOnce(new Error('NEXT_REDIRECT'))

      await expect(getCurrentUser()).rejects.toThrow('NEXT_REDIRECT')
    })

    it('should redirect when session exists but no user', async () => {
      mockGetCurrentUser.mockRejectedValueOnce(new Error('NEXT_REDIRECT'))

      await expect(getCurrentUser()).rejects.toThrow('NEXT_REDIRECT')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when authenticated', async () => {
      mockIsAuthenticated.mockResolvedValueOnce(true)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(true)
      expect(mockIsAuthenticated).toHaveBeenCalledTimes(1)
    })

    it('should return false when not authenticated', async () => {
      mockIsAuthenticated.mockResolvedValueOnce(false)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(false)
      expect(mockIsAuthenticated).toHaveBeenCalledTimes(1)
    })

    it('should return false when session exists but no user', async () => {
      mockIsAuthenticated.mockResolvedValueOnce(false)

      const authenticated = await isAuthenticated()

      expect(authenticated).toBe(false)
    })
  })

  describe('requireAuth', () => {
    it('should return user when authenticated', async () => {
      mockRequireAuth.mockResolvedValueOnce(mockUser)

      const user = await requireAuth()

      expect(user).toEqual(mockUser)
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it('should throw error when not authenticated', async () => {
      mockRequireAuth.mockRejectedValueOnce(new Error('Unauthorized: Please sign in'))

      await expect(requireAuth()).rejects.toThrow('Unauthorized: Please sign in')
      expect(mockRequireAuth).toHaveBeenCalledTimes(1)
    })

    it('should throw error when session exists but no user', async () => {
      mockRequireAuth.mockRejectedValueOnce(new Error('Unauthorized: Please sign in'))

      await expect(requireAuth()).rejects.toThrow('Unauthorized: Please sign in')
    })
  })

  describe('Edge Cases', () => {
    it('should handle auth function throwing error', async () => {
      mockRequireAuth.mockRejectedValueOnce(new Error('Auth service unavailable'))

      await expect(requireAuth()).rejects.toThrow('Auth service unavailable')
    })

    it('should handle malformed session object', async () => {
      mockIsAuthenticated.mockResolvedValueOnce(false)

      const authenticated = await isAuthenticated()
      expect(authenticated).toBe(false)
    })

    it('should handle user object without required fields', async () => {
      const incompleteUser = { id: 'user-123' } as any
      mockRequireAuth.mockResolvedValueOnce(incompleteUser)

      const user = await requireAuth()
      expect(user.id).toBe('user-123')
    })
  })
})

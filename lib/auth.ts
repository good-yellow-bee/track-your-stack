import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
})

/**
 * Get current user or redirect to sign in
 */
export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return session.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await auth()
  return !!session?.user
}

/**
 * Require authentication (for Server Actions)
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session.user
}

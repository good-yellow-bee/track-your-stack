# Authentication API

## Overview

Track Your Stack uses **NextAuth.js v5** with **Google OAuth** for authentication and **database-backed sessions** via PostgreSQL.

## Authentication Flow

```
┌─────────┐           ┌──────────────┐           ┌────────────┐
│ User    │           │ Next.js App  │           │ Google     │
│         │           │              │           │ OAuth      │
└────┬────┘           └──────┬───────┘           └─────┬──────┘
     │                       │                         │
     │  1. Click Sign In     │                         │
     ├──────────────────────>│                         │
     │                       │  2. Redirect to Google  │
     │                       ├────────────────────────>│
     │                       │                         │
     │  3. Consent & Login   │                         │
     │<──────────────────────┼─────────────────────────┤
     │                       │                         │
     │  4. Callback with code│                         │
     ├──────────────────────>│                         │
     │                       │  5. Exchange code       │
     │                       ├────────────────────────>│
     │                       │  6. Return user data    │
     │                       │<────────────────────────┤
     │                       │                         │
     │  7. Create session    │                         │
     │  (stored in database) │                         │
     │                       │                         │
     │  8. Set HTTP-only     │                         │
     │     cookie            │                         │
     │<──────────────────────┤                         │
     │                       │                         │
     │  9. Redirect to       │                         │
     │     dashboard         │                         │
     │<──────────────────────┤                         │
     │                       │                         │
```

## Implementation

### NextAuth Configuration

**File:** `lib/auth.ts`

```typescript
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

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
      // Include user.id in session for database queries
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
```

### TypeScript Type Extension

**File:** `types/next-auth.d.ts`

```typescript
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
```

This ensures TypeScript knows that `session.user.id` exists and is type-safe.

### Protected Routes

**Important:** This project uses **layout-based authentication** instead of middleware.

#### Why Layout-Based Authentication?

Next.js 15 middleware runs on edge runtime, which doesn't support Prisma Client without additional configuration. Layout-based authentication:
- ✅ Runs in Node.js runtime (full Prisma support)
- ✅ More granular control per route group
- ✅ Better performance (no middleware overhead for public routes)
- ✅ Easier to debug and maintain

#### Implementation

**File:** `app/(dashboard)/layout.tsx`

```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return <>{children}</>
}
```

All routes under `app/(dashboard)/` are automatically protected.

### Helper Functions

**File:** `lib/auth.ts`

```typescript
/**
 * Get current session on server
 */
export async function getSession() {
  return await auth()
}

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
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session.user
}
```

### Usage in Server Components

```typescript
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
    </div>
  )
}
```

### Usage in Server Actions

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function createPortfolio(data: FormData) {
  // Require authentication
  const user = await requireAuth()

  // Create portfolio for authenticated user
  const portfolio = await prisma.portfolio.create({
    data: {
      name: data.get('name') as string,
      userId: user.id, // From session
    },
  })

  return portfolio
}
```

## Security Considerations

### Database-Backed Sessions

- **Storage:** Sessions stored in PostgreSQL, not JWT
- **Security:** More secure than JWT for sensitive applications
- **Revocation:** Sessions can be revoked from database

### HTTP-Only Cookies

- **Protection:** Cookies not accessible via JavaScript
- **CSRF:** Automatic CSRF protection via NextAuth
- **Secure:** Cookies sent only over HTTPS in production

### Redirect Safety

```typescript
async redirect({ url, baseUrl }) {
  // Prevent open redirect vulnerabilities
  if (url.startsWith('/')) return `${baseUrl}${url}`
  if (new URL(url).origin === baseUrl) return url
  return `${baseUrl}/dashboard` // Safe default
}
```

### Session Expiry

- **Max Age:** 30 days
- **Automatic:** Sessions expire and require re-authentication
- **Configurable:** Can be adjusted in `lib/auth.ts`

## Environment Variables

Required in `.env.local`:

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Database
DATABASE_URL="postgresql://..."
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

## API Routes

NextAuth automatically creates these routes:

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin/:provider` - Initiate sign in with provider
- `GET/POST /api/auth/callback/:provider` - OAuth callback handler
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out handler
- `GET /api/auth/session` - Get current session (JSON)
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - Get list of configured providers

## Testing

### Manual Testing

1. Navigate to `/auth/signin`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. Verify redirect to `/dashboard`
5. Verify session persists across page reloads
6. Click "Sign out"
7. Verify redirect to homepage

### Programmatic Testing

```typescript
import { auth } from '@/lib/auth'

describe('Authentication', () => {
  it('should require authentication for protected routes', async () => {
    const session = await auth()
    expect(session).toBeNull()
  })

  it('should include user.id in session', async () => {
    // Mock authenticated session
    const session = await auth()
    expect(session?.user?.id).toBeDefined()
  })
})
```

## Troubleshooting

### "Invalid session" errors

- Check `NEXTAUTH_SECRET` is set and matches across environments
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### OAuth redirect errors

- Verify redirect URI matches exactly in Google Cloud Console
- Check `NEXTAUTH_URL` includes correct protocol (http/https)
- Ensure Google OAuth credentials are correct

### Session not persisting

- Check database connection (`DATABASE_URL`)
- Verify Prisma migrations are applied
- Inspect `sessions` table in database

---

**Last Updated:** 2025-10-11
**Related:** [Security Review](../security/authentication-security-review.md) | [Server Actions](./server-actions.md)

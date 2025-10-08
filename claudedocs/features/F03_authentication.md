# F03: Authentication with NextAuth.js

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours
**Dependencies:** F01 (Project Setup), F02 (Database Schema)

---

## 📋 Overview

Implement secure authentication using NextAuth.js v5 (Auth.js) with Google OAuth provider. Setup protected routes, session management, and user authentication flow.

**What this enables:**
- Secure user authentication with Google
- Session management across application
- Protected routes and middleware
- User profile management
- Automatic user creation in database
- Sign in/sign out functionality

---

## 🎯 Acceptance Criteria

- [ ] NextAuth.js configured with Prisma adapter
- [ ] Google OAuth provider working
- [ ] Sign-in page created and functional
- [ ] User sessions persisting correctly
- [ ] Protected routes middleware working
- [ ] Sign-out functionality implemented
- [ ] User profile accessible in app
- [ ] Session data typed correctly
- [ ] Redirects working properly
- [ ] No authentication errors in console

---

## 📦 Dependencies to Install

Dependencies should already be installed from F01:
```bash
# Verify these exist in package.json
next-auth@beta          # NextAuth.js v5
@auth/prisma-adapter   # Prisma adapter for NextAuth
```

If missing:
```bash
pnpm add next-auth@beta @auth/prisma-adapter
```

---

## 🔧 Implementation Steps

### Step 1: Setup Google OAuth (30 min)

**Get Google OAuth Credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Track Your Stack"
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Name: "Track Your Stack - Dev"
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google  (for production)
   ```
8. Copy Client ID and Client Secret

**Update `.env.local`:**
```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret_here"
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 2: Create NextAuth Configuration (45 min)

Create `lib/auth.ts`:
```typescript
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
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
}
```

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Step 3: Extend NextAuth Types (15 min)

Create `types/next-auth.d.ts`:
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

This adds `id` to the session user object for type safety.

### Step 4: Create Authentication Helpers (20 min)

Update `lib/auth.ts` with helpers:
```typescript
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

// ... previous authOptions code ...

/**
 * Get current session on server
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * Get current user or redirect to sign in
 */
export async function getCurrentUser() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return session.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}

/**
 * Require authentication (for Server Actions)
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session.user
}
```

### Step 5: Create Sign In Page (45 min)

Create `app/(auth)/auth/signin/page.tsx`:
```typescript
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignInButton from '@/components/auth/SignInButton'

export const metadata: Metadata = {
  title: 'Sign In - Track Your Stack',
  description: 'Sign in to your investment portfolio tracker',
}

export default async function SignInPage() {
  const session = await getServerSession(authOptions)

  // Redirect if already signed in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Track Your Stack
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your personal investment portfolio tracker
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <SignInButton />

          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Track multiple portfolios
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Real-time price updates
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Multi-currency support
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Gains & loss tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

Create `components/auth/SignInButton.tsx`:
```typescript
'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function SignInButton() {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="w-full"
      size="lg"
    >
      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </Button>
  )
}
```

Create `app/(auth)/auth/layout.tsx`:
```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
```

### Step 6: Create Session Provider (20 min)

Create `components/providers/SessionProvider.tsx`:
```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

Update `app/layout.tsx`:
```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Track Your Stack',
  description: 'Investment Portfolio Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

### Step 7: Create Protected Route Middleware (30 min)

Create `middleware.ts` in project root:
```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolios/:path*',
    '/api/portfolios/:path*',
    '/api/investments/:path*',
  ],
}
```

This protects all dashboard and portfolio routes.

### Step 8: Create User Navigation Component (40 min)

Create `components/layout/UserNav.tsx`:
```typescript
'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings } from 'lucide-react'

export default function UserNav() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Step 9: Create Dashboard Layout (30 min)

Create `app/(dashboard)/layout.tsx`:
```typescript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Header from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={session.user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

Create `components/layout/Header.tsx`:
```typescript
import Link from 'next/link'
import UserNav from './UserNav'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold">
          Track Your Stack
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/portfolios"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Portfolios
          </Link>
          <UserNav />
        </nav>
      </div>
    </header>
  )
}
```

### Step 10: Create Dashboard Landing Page (30 min)

Create `app/(dashboard)/dashboard/page.tsx`:
```typescript
import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - Track Your Stack',
  description: 'Your investment portfolio dashboard',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name || 'Investor'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your investment portfolios and track your returns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Create your first portfolio to start tracking your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/portfolios/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Can access sign-in page at `/auth/signin`
- [ ] Clicking "Sign in with Google" opens Google OAuth
- [ ] After authorizing, redirects to `/dashboard`
- [ ] User appears in database (`User`, `Account`, `Session` tables)
- [ ] Session persists after page refresh
- [ ] User navigation dropdown shows correct info
- [ ] Can sign out successfully
- [ ] After sign out, redirected to home page
- [ ] Cannot access `/dashboard` when logged out (redirects to `/auth/signin`)
- [ ] Middleware protects all `/dashboard` and `/portfolios` routes

### Verification Commands
```bash
# Start dev server
pnpm dev

# Test flow:
# 1. Go to http://localhost:3000/dashboard (should redirect to /auth/signin)
# 2. Click "Sign in with Google"
# 3. Authorize app
# 4. Should redirect to /dashboard
# 5. Check user in Prisma Studio: pnpm db:studio
# 6. Verify Session exists
# 7. Refresh page - should stay signed in
# 8. Click sign out - should redirect to home
```

### Database Verification
```bash
# Open Prisma Studio
pnpm db:studio

# Check tables after sign in:
# - User: Should have 1 record with Google email
# - Account: Should have 1 record with provider: "google"
# - Session: Should have 1 active session
```

---

## 📚 Documentation Updates

### Files to Create/Update
- [ ] `docs/authentication.md` - Authentication flow documentation
- [ ] `docs/changelog.md` - Add F03 entry
- [ ] `README.md` - Add Google OAuth setup instructions

### Changelog Entry
```markdown
## [0.3.0] - 2025-10-08

### Added
- NextAuth.js v5 authentication with Google OAuth
- Prisma adapter for session storage
- Protected routes with middleware
- Sign-in page with Google OAuth button
- User navigation component with profile dropdown
- Session provider for client-side auth
- Type-safe session management
- Dashboard layout with header
- Authentication helper functions

### Security
- HTTP-only session cookies
- CSRF protection enabled
- Secure session management with 30-day expiry
```

---

## 🔀 Git Workflow

### Branch Name
```bash
git checkout -b feature/authentication
```

### Commit Messages
```bash
git commit -m "feat(auth): setup NextAuth.js with Google OAuth

- Configure NextAuth.js v5 with Prisma adapter
- Add Google OAuth provider
- Setup environment variables
- Create auth configuration file"

git commit -m "feat(auth): create sign-in page and components

- Add sign-in page with Google OAuth button
- Create SignInButton component
- Add auth layout
- Style sign-in page with Tailwind"

git commit -m "feat(auth): implement session management

- Add SessionProvider for client-side auth
- Create authentication helper functions
- Add user navigation component
- Implement sign-out functionality"

git commit -m "feat(auth): add protected routes middleware

- Create middleware for route protection
- Protect dashboard and portfolio routes
- Add redirect logic for unauthenticated users
- Configure protected route patterns"

git commit -m "feat(auth): create dashboard layout

- Add dashboard layout with header
- Create user navigation dropdown
- Add dashboard landing page
- Implement server-side session check"
```

### Pull Request Template
```markdown
## F03: Authentication with NextAuth.js

### What does this PR do?
Implements secure authentication using NextAuth.js v5 with Google OAuth, including session management, protected routes, and user interface components.

### Type of change
- [x] New feature (authentication)
- [x] Security enhancement

### Authentication Features
- ✅ Google OAuth sign-in
- ✅ Session management with database
- ✅ Protected routes middleware
- ✅ User profile navigation
- ✅ Sign-out functionality

### Checklist
- [x] NextAuth.js configured
- [x] Google OAuth working
- [x] Sign-in page created
- [x] Session provider implemented
- [x] Protected routes middleware
- [x] User navigation component
- [x] Dashboard layout created
- [x] Type definitions added
- [x] Documentation updated

### Testing performed
- Verified Google OAuth flow
- Tested session persistence
- Confirmed protected routes work
- Validated sign-out functionality
- Checked database records created

### Environment Variables Required
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
```

### Setup Instructions
1. Create Google OAuth credentials
2. Add environment variables to `.env.local`
3. Run migrations: `pnpm db:migrate`
4. Start dev server: `pnpm dev`
5. Test sign-in flow
```
```

---

## ⚠️ Common Issues & Solutions

### Issue: `NEXTAUTH_SECRET` error
**Solution:** Generate a secret: `openssl rand -base64 32` and add to `.env.local`

### Issue: Google OAuth callback error
**Solution:**
- Verify redirect URI in Google Console matches exactly
- Check `NEXTAUTH_URL` is correct
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Issue: Session not persisting
**Solution:**
- Clear browser cookies
- Check database connection
- Verify `Session` table exists
- Run `pnpm db:migrate`

### Issue: Middleware not protecting routes
**Solution:**
- Ensure `middleware.ts` is in project root (not in `app/`)
- Verify matcher patterns are correct
- Check for syntax errors in middleware

### Issue: Type errors with session
**Solution:** Ensure `types/next-auth.d.ts` exists and TypeScript server is restarted

### Issue: "Cannot find module 'next-auth'"
**Solution:**
```bash
pnpm add next-auth@beta
pnpm install
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] NextAuth.js configured and working
- [x] Google OAuth sign-in functional
- [x] Sign-in page created
- [x] Session management working
- [x] Protected routes middleware
- [x] User navigation component
- [x] Sign-out functionality
- [x] Dashboard layout
- [x] Type-safe authentication
- [x] Documentation updated

---

## 🔗 Related Files

- `lib/auth.ts` - NextAuth configuration and helpers
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `app/(auth)/auth/signin/page.tsx` - Sign-in page
- `components/auth/SignInButton.tsx` - Google sign-in button
- `components/providers/SessionProvider.tsx` - Session provider
- `components/layout/UserNav.tsx` - User navigation dropdown
- `components/layout/Header.tsx` - App header
- `app/(dashboard)/layout.tsx` - Dashboard layout
- `middleware.ts` - Protected routes middleware
- `types/next-auth.d.ts` - Type definitions
- `.env.local` - Environment variables

---

## ⏭️ Next Feature

After completing F03, proceed to:
→ [F04: Portfolio CRUD Operations](F04_portfolio_crud.md)

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

# Authentication Feature

## Overview

Track Your Stack uses **NextAuth.js v5 (Auth.js)** with Google OAuth for secure, production-ready authentication. All user data is isolated via session-based authentication with database persistence.

## Key Features

- 🔐 **Google OAuth Integration**: One-click sign-in with Google accounts
- 🗄️ **Database Sessions**: Persistent sessions stored in PostgreSQL via Prisma
- 🛡️ **Protected Routes**: Middleware-based authentication guards for dashboard and portfolio routes
- 🔒 **Type-Safe Sessions**: Full TypeScript support with custom session extensions
- ♻️ **Auto-Redirect**: Authenticated users automatically redirected to dashboard
- 📱 **Responsive Design**: Beautiful sign-in page with feature highlights

## Architecture

### Authentication Flow

```
1. User visits sign-in page (/auth/signin)
2. Clicks "Sign in with Google"
3. Google OAuth consent screen
4. Callback to /api/auth/callback/google
5. Session created in database
6. User redirected to /dashboard
```

### Session Management

- **Strategy**: Database-backed sessions (not JWT)
- **Storage**: PostgreSQL via Prisma adapter
- **Max Age**: 30 days
- **Auto-Refresh**: Session automatically refreshed on activity

### Protected Routes

The following routes require authentication:

- `/dashboard/*` - Main dashboard and overview
- `/portfolios/*` - Portfolio management pages
- `/api/portfolios/*` - Portfolio API endpoints
- `/api/investments/*` - Investment API endpoints

Unauthenticated users are automatically redirected to `/auth/signin`.

## Implementation Details

### Core Configuration

**File**: `lib/auth.ts`

```typescript
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
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign-in
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})
```

### Helper Functions

**`getCurrentUser()`**: Fetches current user or redirects to sign-in

```typescript
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  return session.user
}
```

**`requireAuth()`**: Throws error if not authenticated (for API routes)

```typescript
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }
  return session.user
}
```

### Middleware Protection

**File**: `middleware.ts`

```typescript
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/portfolios') ||
    req.nextUrl.pathname.startsWith('/api/portfolios') ||
    req.nextUrl.pathname.startsWith('/api/investments')

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return NextResponse.next()
})
```

### TypeScript Extensions

**File**: `types/next-auth.d.ts`

Extends the default NextAuth session to include user ID:

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
```

## Components

### Sign-In Button

**File**: `components/auth/SignInButton.tsx`

Client component with Google OAuth button and icon:

```typescript
'use client'

export default function SignInButton() {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="w-full"
      size="lg"
    >
      <GoogleIcon />
      Sign in with Google
    </Button>
  )
}
```

### Session Provider

**File**: `components/providers/SessionProvider.tsx`

Wraps the application to provide session context to client components:

```typescript
'use client'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

### User Navigation

**File**: `components/layout/UserNav.tsx`

Dropdown menu with user profile and sign-out:

```typescript
export default function UserNav() {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar src={session.user.image} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          {session.user.name}
          {session.user.email}
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Environment Variables

Required configuration in `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_with: openssl rand -base64 32"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

## Database Schema

NextAuth uses the following tables (created via Prisma schema):

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  // ... OAuth fields
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  portfolios    Portfolio[]
}
```

## Usage in Components

### Server Components

```typescript
import { auth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Hello, {session.user.name}!</div>
}
```

### Client Components

```typescript
'use client'

import { useSession } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>

  return <div>Hello, {session.user.name}!</div>
}
```

### API Routes

```typescript
import { requireAuth } from '@/lib/auth'

export async function GET(request: Request) {
  const user = await requireAuth()

  // User is authenticated, proceed with logic
  return Response.json({ userId: user.id })
}
```

## Security Considerations

### CSRF Protection

NextAuth.js includes built-in CSRF protection via HTTP-only cookies. No additional configuration required.

### Session Token Storage

Session tokens are stored in HTTP-only cookies, preventing XSS attacks from accessing them.

### User Data Isolation

All portfolio and investment operations **MUST** verify user ownership:

```typescript
// ALWAYS check authorization
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
  select: { userId: true },
})

if (portfolio?.userId !== session.user.id) {
  throw new Error('Forbidden')
}
```

### OAuth Scope

Google OAuth requests minimal scopes:

- `openid` - User identification
- `email` - Email address
- `profile` - Basic profile info (name, picture)

No access to user's Google Drive, Gmail, or other services.

## Troubleshooting

### "Invalid session" errors

**Problem**: NEXTAUTH_SECRET not set or doesn't match across deployments

**Solution**: Ensure NEXTAUTH_SECRET is set in all environments and matches

### Redirect loop on sign-in

**Problem**: NEXTAUTH_URL doesn't match actual deployment URL

**Solution**: Update NEXTAUTH_URL to match your domain (include https:// in production)

### Google OAuth consent screen errors

**Problem**: Redirect URI not authorized in Google Console

**Solution**: Add exact callback URL to authorized redirect URIs in Google Cloud Console

### Session not persisting

**Problem**: Database connection issues or Prisma client not generated

**Solution**:

```bash
pnpm prisma generate
pnpm prisma db push
```

## Migration from v4 to v5

If upgrading from NextAuth.js v4, note these breaking changes:

### Configuration Export

```typescript
// v4 (OLD)
export const authOptions: NextAuthOptions = { ... }

// v5 (NEW)
export const { handlers, auth, signIn, signOut } = NextAuth({ ... })
```

### Server-Side Session Fetching

```typescript
// v4 (OLD)
import { getServerSession } from 'next-auth'
const session = await getServerSession(authOptions)

// v5 (NEW)
import { auth } from '@/lib/auth'
const session = await auth()
```

### Middleware

```typescript
// v4 (OLD)
import { withAuth } from 'next-auth/middleware'
export default withAuth(function middleware(req) { ... })

// v5 (NEW)
import { auth } from '@/lib/auth'
export default auth((req) => { ... })
```

## Testing Authentication

### Manual Testing Checklist

- [ ] Visit sign-in page when not authenticated
- [ ] Click "Sign in with Google" button
- [ ] Complete Google OAuth consent
- [ ] Verify redirect to /dashboard
- [ ] Check user navigation displays profile
- [ ] Test sign-out functionality
- [ ] Verify protected routes redirect when not authenticated
- [ ] Confirm session persists across page refreshes

### Automated Testing (Future)

```typescript
// Example E2E test with Playwright
test('authentication flow', async ({ page }) => {
  await page.goto('/auth/signin')
  await page.click('text=Sign in with Google')
  // Complete OAuth flow
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Welcome back')).toBeVisible()
})
```

## Performance Considerations

### Session Caching

NextAuth.js caches session data client-side. The session is only refetched from the database when:

- User signs in/out
- Session expires
- Explicitly refetched via `update()` method

### Database Queries

Session lookup adds one database query per protected page load. Optimize by:

- Using connection pooling (Prisma default)
- Enabling database indexes on `sessionToken` (already configured)
- Consider Redis session adapter for high-traffic applications

## Future Enhancements

Potential improvements for authentication system:

- [ ] Email/password authentication (in addition to OAuth)
- [ ] Two-factor authentication (2FA)
- [ ] Session management UI (view/revoke active sessions)
- [ ] OAuth provider expansion (GitHub, Apple, Microsoft)
- [ ] Rate limiting on sign-in attempts
- [ ] Audit log for authentication events
- [ ] Remember me functionality
- [ ] Magic link authentication

## Related Documentation

- [User Guide - Getting Started](../user-guide/getting-started.md)
- [Architecture - Database Schema](../architecture/database-schema.md)
- [API - Server Actions](../api/server-actions.md)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

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

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/portfolios/:path*',
    '/api/portfolios/:path*',
    '/api/investments/:path*',
  ],
}

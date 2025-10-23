import { NextResponse } from 'next/server'
import { getDatabaseHealth } from '@/lib/db/utils'
import { rateLimitByIP } from '@/lib/middleware/rateLimiter'
import { headers } from 'next/headers'

/**
 * Health check endpoint
 * GET /api/health
 * Tests database connectivity and returns status
 */
export async function GET() {
  try {
    // Rate limit health checks to prevent abuse
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    await rateLimitByIP(ip, 'health-check', 20, '1 m')

    const dbHealth = await getDatabaseHealth()

    // In production, return minimal information
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          status: dbHealth.status === 'healthy' ? 'ok' : 'error',
        },
        {
          status: dbHealth.status === 'healthy' ? 200 : 503,
        }
      )
    }

    // In development, return detailed information
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbHealth,
      },
      {
        status: dbHealth.status === 'healthy' ? 200 : 503,
      }
    )
  } catch (error) {
    // Check if it's a rate limit error
    if (error instanceof Error && error.constructor.name === 'RateLimitError') {
      return NextResponse.json(
        {
          status: 'error',
          error: 'Too many requests',
        },
        { status: 429 }
      )
    }

    // In production, return minimal error information
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          status: 'error',
        },
        { status: 503 }
      )
    }

    // In development, return detailed error information
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 503 }
    )
  }
}

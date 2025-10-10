import { NextResponse } from 'next/server'
import { getDatabaseHealth } from '@/lib/db/utils'

/**
 * Health check endpoint
 * GET /api/health
 * Tests database connectivity and returns status
 */
export async function GET() {
  try {
    const dbHealth = await getDatabaseHealth()

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

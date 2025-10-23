import { NextResponse } from 'next/server'
import { alphaVantageClient } from '@/lib/api/alphaVantage'
import { getRemainingRequests } from '@/lib/api/rateLimiter'
import { rateLimitByIP } from '@/lib/middleware/rateLimiter'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  try {
    // Rate limit test endpoint to prevent abuse
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    await rateLimitByIP(ip, 'test-api', 5, '1 m')

    const { searchParams } = new URL(request.url)
    const test = searchParams.get('test') || 'stock'

    let result: unknown

    switch (test) {
      case 'stock':
        result = await alphaVantageClient.getStockQuote('AAPL')
        break
      case 'crypto':
        result = await alphaVantageClient.getCryptoPrice('BTC', 'USD')
        break
      case 'currency':
        result = await alphaVantageClient.getExchangeRate('EUR', 'USD')
        break
      case 'search':
        result = await alphaVantageClient.searchSymbol('Apple')
        break
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      test,
      data: result,
      remainingRequests: getRemainingRequests(),
    })
  } catch (error) {
    // Check if it's a rate limit error
    if (error instanceof Error && error.constructor.name === 'RateLimitError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        remainingRequests: getRemainingRequests(),
      },
      { status: 500 }
    )
  }
}

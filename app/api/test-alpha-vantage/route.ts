import { NextResponse } from 'next/server'
import { alphaVantageClient } from '@/lib/api/alphaVantage'
import { getRemainingRequests } from '@/lib/api/rateLimiter'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test') || 'stock'

  try {
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

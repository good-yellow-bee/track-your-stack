# F12: Historical Performance Charts

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 3-4 days
**Dependencies:** F11 (Visualizations)
**Phase:** Phase 2 - Advanced Features

---

## 📋 Overview

Implement historical performance tracking with daily portfolio snapshots and interactive line charts showing portfolio value over time with date range filtering and multiple portfolio comparison.

**What this enables:**
- Track portfolio value changes over time
- View performance across different timeframes (1W, 1M, 3M, 6M, 1Y, ALL)
- Compare multiple portfolios on the same chart
- Benchmark against market performance
- Analyze historical gains/losses trends
- Identify performance patterns and trends

---

## 🎯 Acceptance Criteria

- [ ] Daily cron job captures portfolio snapshots at market close
- [ ] Portfolio snapshots stored with timestamp and value
- [ ] Historical data API endpoint with date range filtering
- [ ] Line chart displays portfolio value over time
- [ ] Date range selector switches between timeframes
- [ ] Multiple portfolios can be compared on same chart
- [ ] Tooltips show exact values and dates on hover
- [ ] Chart responsive on all screen sizes
- [ ] Loading states while fetching historical data
- [ ] Empty state for portfolios with no history
- [ ] Performance metrics displayed (total return, % change)

---

## 🔧 Dependencies to Install

```bash
# Already installed from F11
# recharts should be available

# Install cron job library
pnpm add node-cron
pnpm add -D @types/node-cron

# Install date manipulation library
pnpm add date-fns
```

---

## 🏗️ Key Implementation Steps

### Step 1: Update Database Schema

Add `PortfolioSnapshot` model to `prisma/schema.prisma`:

```prisma
model PortfolioSnapshot {
  id           String   @id @default(cuid())
  portfolioId  String
  portfolio    Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  totalValue   Decimal  @db.Decimal(15, 2)
  baseCurrency String   @db.VarChar(3)

  snapshotDate DateTime @db.Date
  createdAt    DateTime @default(now())

  @@index([portfolioId, snapshotDate])
  @@unique([portfolioId, snapshotDate])
  @@map("portfolio_snapshots")
}

// Add relation to Portfolio model
model Portfolio {
  // ... existing fields
  snapshots    PortfolioSnapshot[]
}
```

Run migration:
```bash
pnpm prisma migrate dev --name add_portfolio_snapshots
```

### Step 2: Create Snapshot Service

Create `lib/services/snapshot-service.ts`:

```typescript
import { db } from '@/lib/db'
import { calculatePortfolioSummary } from '@/lib/services/calculation-service'
import { Decimal } from '@prisma/client/runtime/library'

export async function createDailySnapshot(portfolioId: string) {
  try {
    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        investments: {
          where: { isSold: false },
        },
      },
    })

    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`)
    }

    // Calculate current portfolio value
    const summary = await calculatePortfolioSummary(portfolio)

    // Check if snapshot already exists for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await db.portfolioSnapshot.findUnique({
      where: {
        portfolioId_snapshotDate: {
          portfolioId,
          snapshotDate: today,
        },
      },
    })

    if (existing) {
      // Update existing snapshot
      return await db.portfolioSnapshot.update({
        where: { id: existing.id },
        data: {
          totalValue: new Decimal(summary.totalValue),
        },
      })
    }

    // Create new snapshot
    return await db.portfolioSnapshot.create({
      data: {
        portfolioId,
        totalValue: new Decimal(summary.totalValue),
        baseCurrency: portfolio.baseCurrency,
        snapshotDate: today,
      },
    })
  } catch (error) {
    console.error(`Failed to create snapshot for portfolio ${portfolioId}:`, error)
    throw error
  }
}

export async function createDailySnapshotsForAllPortfolios() {
  try {
    const portfolios = await db.portfolio.findMany({
      select: { id: true },
    })

    console.log(`Creating snapshots for ${portfolios.length} portfolios...`)

    const results = await Promise.allSettled(
      portfolios.map((portfolio) => createDailySnapshot(portfolio.id))
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(`Snapshots complete: ${successful} succeeded, ${failed} failed`)

    return { successful, failed, total: portfolios.length }
  } catch (error) {
    console.error('Failed to create daily snapshots:', error)
    throw error
  }
}

export type DateRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

export function getDateRangeStart(range: DateRange): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  switch (range) {
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case '1M':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case '3M':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    case '6M':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case '1Y':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    case 'ALL':
      return new Date(0) // Beginning of time
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) // Default to 1M
  }
}

export async function getPortfolioHistory(
  portfolioId: string,
  range: DateRange = '1M'
) {
  const startDate = getDateRangeStart(range)

  const snapshots = await db.portfolioSnapshot.findMany({
    where: {
      portfolioId,
      snapshotDate: {
        gte: startDate,
      },
    },
    orderBy: {
      snapshotDate: 'asc',
    },
  })

  return snapshots.map((snapshot) => ({
    date: snapshot.snapshotDate,
    value: snapshot.totalValue.toNumber(),
    currency: snapshot.baseCurrency,
  }))
}

export async function getMultiplePortfolioHistory(
  portfolioIds: string[],
  range: DateRange = '1M'
) {
  const startDate = getDateRangeStart(range)

  const snapshots = await db.portfolioSnapshot.findMany({
    where: {
      portfolioId: {
        in: portfolioIds,
      },
      snapshotDate: {
        gte: startDate,
      },
    },
    include: {
      portfolio: {
        select: {
          name: true,
          baseCurrency: true,
        },
      },
    },
    orderBy: {
      snapshotDate: 'asc',
    },
  })

  // Group by portfolio
  const groupedData = portfolioIds.reduce((acc, portfolioId) => {
    const portfolioSnapshots = snapshots.filter((s) => s.portfolioId === portfolioId)

    if (portfolioSnapshots.length > 0) {
      acc[portfolioId] = {
        name: portfolioSnapshots[0].portfolio.name,
        currency: portfolioSnapshots[0].portfolio.baseCurrency,
        data: portfolioSnapshots.map((s) => ({
          date: s.snapshotDate,
          value: s.totalValue.toNumber(),
        })),
      }
    }

    return acc
  }, {} as Record<string, { name: string; currency: string; data: Array<{ date: Date; value: number }> }>)

  return groupedData
}
```

### Step 3: Create Cron Job for Daily Snapshots

Create `lib/cron/daily-snapshot.ts`:

```typescript
import cron from 'node-cron'
import { createDailySnapshotsForAllPortfolios } from '@/lib/services/snapshot-service'

// Run daily at 4:30 PM ET (after market close)
// Cron format: minute hour day month day-of-week
// '30 16 * * 1-5' = 4:30 PM, Monday-Friday
const SNAPSHOT_SCHEDULE = '30 16 * * 1-5'

export function startDailySnapshotCron() {
  console.log('Starting daily portfolio snapshot cron job...')

  const task = cron.schedule(
    SNAPSHOT_SCHEDULE,
    async () => {
      console.log('Running daily portfolio snapshot...')
      try {
        const result = await createDailySnapshotsForAllPortfolios()
        console.log('Daily snapshot complete:', result)
      } catch (error) {
        console.error('Daily snapshot failed:', error)
      }
    },
    {
      scheduled: true,
      timezone: 'America/New_York',
    }
  )

  // Also run immediately on startup for testing
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Running snapshot immediately...')
    createDailySnapshotsForAllPortfolios()
      .then((result) => console.log('Initial snapshot complete:', result))
      .catch((error) => console.error('Initial snapshot failed:', error))
  }

  return task
}

// Export for manual triggering
export async function runSnapshotNow() {
  console.log('Manual snapshot triggered...')
  return await createDailySnapshotsForAllPortfolios()
}
```

### Step 4: Initialize Cron in Server

Create `lib/server-init.ts`:

```typescript
import { startDailySnapshotCron } from './cron/daily-snapshot'

let isInitialized = false

export function initializeServer() {
  if (isInitialized) {
    console.log('Server already initialized')
    return
  }

  console.log('Initializing server...')

  // Start cron jobs
  startDailySnapshotCron()

  isInitialized = true
  console.log('Server initialization complete')
}
```

Update `app/layout.tsx` to initialize server:

```typescript
import { initializeServer } from '@/lib/server-init'

// Initialize server components
if (typeof window === 'undefined') {
  initializeServer()
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ... existing layout code
}
```

### Step 5: Create History API Routes

Create `app/api/portfolios/[id]/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPortfolioHistory, DateRange } from '@/lib/services/snapshot-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolioId = params.id
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || '1M') as DateRange

    // Verify portfolio ownership
    const portfolio = await db.portfolio.findUnique({
      where: {
        id: portfolioId,
        userId: session.user.id,
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // Get historical data
    const history = await getPortfolioHistory(portfolioId, range)

    return NextResponse.json({
      success: true,
      history,
      range,
      portfolioId,
    })
  } catch (error) {
    console.error('Failed to fetch portfolio history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio history' },
      { status: 500 }
    )
  }
}
```

Create `app/api/portfolios/history/compare/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getMultiplePortfolioHistory, DateRange } from '@/lib/services/snapshot-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const portfolioIdsParam = searchParams.get('portfolios')
    const range = (searchParams.get('range') || '1M') as DateRange

    if (!portfolioIdsParam) {
      return NextResponse.json(
        { error: 'Portfolio IDs required' },
        { status: 400 }
      )
    }

    const portfolioIds = portfolioIdsParam.split(',')

    // Verify all portfolios belong to user
    const portfolios = await db.portfolio.findMany({
      where: {
        id: { in: portfolioIds },
        userId: session.user.id,
      },
    })

    if (portfolios.length !== portfolioIds.length) {
      return NextResponse.json(
        { error: 'One or more portfolios not found' },
        { status: 404 }
      )
    }

    // Get historical data for all portfolios
    const history = await getMultiplePortfolioHistory(portfolioIds, range)

    return NextResponse.json({
      success: true,
      history,
      range,
      portfolioIds,
    })
  } catch (error) {
    console.error('Failed to fetch portfolio comparison:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio comparison' },
      { status: 500 }
    )
  }
}
```

### Step 6: Create Historical Chart Component

Create `components/portfolio/HistoricalChart.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

type DateRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

interface HistoricalDataPoint {
  date: Date
  value: number
  currency: string
}

interface HistoricalChartProps {
  portfolioId: string
  baseCurrency: string
}

const DATE_RANGES: Array<{ label: string; value: DateRange }> = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' },
]

export default function HistoricalChart({ portfolioId, baseCurrency }: HistoricalChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('1M')
  const [data, setData] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/portfolios/${portfolioId}/history?range=${selectedRange}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch history')
        }

        const result = await response.json()
        setData(result.history)
      } catch (err) {
        console.error('Failed to fetch portfolio history:', err)
        setError('Failed to load historical data')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [portfolioId, selectedRange])

  const chartData = data.map((point) => ({
    date: format(new Date(point.date), 'MMM dd'),
    fullDate: new Date(point.date),
    value: point.value,
  }))

  const calculatePerformance = () => {
    if (data.length < 2) return { change: 0, percentChange: 0 }

    const firstValue = data[0].value
    const lastValue = data[data.length - 1].value
    const change = lastValue - firstValue
    const percentChange = (change / firstValue) * 100

    return { change, percentChange }
  }

  const { change, percentChange } = calculatePerformance()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Historical value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Historical value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
          <CardDescription>Historical value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <p>No historical data available yet</p>
            <p className="mt-2 text-sm">Snapshots are captured daily at market close</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Historical value over time</CardDescription>
          </div>
          <div className="flex gap-1">
            {DATE_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        {data.length >= 2 && (
          <div className="mt-4 flex gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Period Change</div>
              <div
                className={`text-lg font-semibold ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {formatCurrency(change, baseCurrency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">% Change</div>
              <div
                className={`text-lg font-semibold ${
                  percentChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {percentChange >= 0 ? '+' : ''}
                {formatPercent(percentChange, 2)}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value, baseCurrency, 0)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">
                      {format(data.fullDate, 'MMM dd, yyyy')}
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatCurrency(data.value, baseCurrency)}
                    </div>
                  </div>
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Step 7: Create Multi-Portfolio Comparison Chart

Create `components/portfolio/ComparisonChart.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/format'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

type DateRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

interface ComparisonChartProps {
  portfolioIds: string[]
}

const DATE_RANGES: Array<{ label: string; value: DateRange }> = [
  { label: '1W', value: '1W' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: 'ALL', value: 'ALL' },
]

const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
]

export default function ComparisonChart({ portfolioIds }: ComparisonChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('1M')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/portfolios/history/compare?portfolios=${portfolioIds.join(',')}&range=${selectedRange}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch comparison data')
        }

        const result = await response.json()
        setData(result.history)
      } catch (err) {
        console.error('Failed to fetch portfolio comparison:', err)
        setError('Failed to load comparison data')
      } finally {
        setLoading(false)
      }
    }

    if (portfolioIds.length > 0) {
      fetchComparison()
    }
  }, [portfolioIds, selectedRange])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-destructive">
            {error || 'No data available'}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for chart
  const allDates = new Set<string>()
  Object.values(data).forEach((portfolio: any) => {
    portfolio.data.forEach((point: any) => {
      allDates.add(point.date)
    })
  })

  const chartData = Array.from(allDates)
    .sort()
    .map((dateStr) => {
      const dataPoint: any = {
        date: format(new Date(dateStr), 'MMM dd'),
        fullDate: new Date(dateStr),
      }

      portfolioIds.forEach((portfolioId) => {
        const portfolio = data[portfolioId]
        if (portfolio) {
          const point = portfolio.data.find(
            (p: any) => new Date(p.date).toISOString() === new Date(dateStr).toISOString()
          )
          dataPoint[portfolioId] = point?.value || null
        }
      })

      return dataPoint
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Portfolio Comparison</CardTitle>
            <CardDescription>Compare performance across portfolios</CardDescription>
          </div>
          <div className="flex gap-1">
            {DATE_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="text-sm text-muted-foreground">
                      {format(data.fullDate, 'MMM dd, yyyy')}
                    </div>
                    <div className="mt-2 space-y-1">
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <div className="text-sm">
                            {data[entry.dataKey] !== null
                              ? formatCurrency(data[entry.dataKey], 'USD')
                              : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
            />
            <Legend
              content={({ payload }) => (
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {payload?.map((entry, index) => {
                    const portfolioData = data[entry.dataKey]
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{portfolioData?.name || entry.dataKey}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            />
            {portfolioIds.map((portfolioId, index) => (
              <Line
                key={portfolioId}
                type="monotone"
                dataKey={portfolioId}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Step 8: Add Historical Chart to Portfolio Page

Update `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
import HistoricalChart from '@/components/portfolio/HistoricalChart'

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  // ... existing code

  return (
    <div className="space-y-8">
      {/* ... existing summary and charts */}

      {/* Historical Performance */}
      <HistoricalChart portfolioId={portfolio.id} baseCurrency={portfolio.baseCurrency} />

      {/* ... existing investment table */}
    </div>
  )
}
```

### Step 9: Create Manual Snapshot Trigger (Development)

Create `app/api/admin/snapshot/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createDailySnapshotsForAllPortfolios } from '@/lib/services/snapshot-service'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or for admin users
    if (process.env.NODE_ENV === 'production') {
      const session = await getServerSession(authOptions)

      // TODO: Add admin check
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('Manual snapshot triggered via API')
    const result = await createDailySnapshotsForAllPortfolios()

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('Manual snapshot failed:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshots' },
      { status: 500 }
    )
  }
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] Database migration runs successfully
- [ ] Cron job starts on server initialization
- [ ] Manual snapshot trigger creates records in database
- [ ] Historical API endpoint returns correct data for all date ranges
- [ ] Line chart renders with historical data
- [ ] Date range selector switches timeframes correctly
- [ ] Chart shows correct values on hover
- [ ] Performance metrics calculate correctly
- [ ] Empty state displays when no history exists
- [ ] Loading states display during data fetch
- [ ] Multiple portfolio comparison works
- [ ] Chart responsive on mobile devices

### API Testing

```bash
# Create manual snapshot
curl -X POST http://localhost:3000/api/admin/snapshot

# Fetch 1M history
curl http://localhost:3000/api/portfolios/{id}/history?range=1M

# Fetch comparison
curl "http://localhost:3000/api/portfolios/history/compare?portfolios=id1,id2&range=3M"
```

### Database Verification

```sql
-- Check snapshots created
SELECT * FROM portfolio_snapshots ORDER BY snapshot_date DESC LIMIT 10;

-- Verify snapshot uniqueness
SELECT portfolio_id, snapshot_date, COUNT(*)
FROM portfolio_snapshots
GROUP BY portfolio_id, snapshot_date
HAVING COUNT(*) > 1;
```

---

## 📚 Documentation Updates

### Update README.md

Add Historical Charts section:
```markdown
## Historical Performance Tracking

- Daily portfolio value snapshots
- Historical line charts with multiple timeframes
- Portfolio comparison charts
- Performance metrics (total return, % change)
- Automated daily snapshot capture at market close
```

### Update CHANGELOG.md

```markdown
## [0.2.0] - Phase 2: Historical Charts

### Added
- Daily portfolio snapshot cron job
- Portfolio historical data API endpoints
- Interactive line charts with date range selector
- Multi-portfolio comparison charts
- Performance metrics display
- Historical data visualization with Recharts

### Technical
- Added PortfolioSnapshot model to database
- Implemented snapshot service with cron scheduling
- Created history API routes with date range filtering
- Built HistoricalChart and ComparisonChart components
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Cron Job Not Running

**Problem:** Daily snapshots not being created

**Solution:**
```typescript
// Check server logs
console.log('Cron job status')

// Verify cron is initialized
// Check lib/server-init.ts is being called

// Test manual trigger
await createDailySnapshotsForAllPortfolios()
```

### Issue 2: Duplicate Snapshots

**Problem:** Multiple snapshots for same date

**Solution:** Unique constraint in schema prevents this, but verify:
```prisma
@@unique([portfolioId, snapshotDate])
```

### Issue 3: No Historical Data Showing

**Problem:** Chart shows empty state

**Solution:**
```typescript
// Create initial snapshots
POST /api/admin/snapshot

// Check database
SELECT COUNT(*) FROM portfolio_snapshots WHERE portfolio_id = 'xxx'

// Verify date range calculation
console.log(getDateRangeStart('1M'))
```

### Issue 4: Chart Performance Issues

**Problem:** Slow rendering with large datasets

**Solution:**
```typescript
// Limit data points for large date ranges
const MAX_POINTS = 365

// Sample data if necessary
if (snapshots.length > MAX_POINTS) {
  const interval = Math.ceil(snapshots.length / MAX_POINTS)
  snapshots = snapshots.filter((_, index) => index % interval === 0)
}
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] PortfolioSnapshot database model and migration
- [x] Snapshot service with daily cron job
- [x] Historical data API endpoints
- [x] HistoricalChart component with date range selector
- [x] ComparisonChart component for multiple portfolios
- [x] Server initialization with cron scheduling
- [x] Manual snapshot trigger for development
- [x] Performance metrics calculation
- [x] Responsive chart design
- [x] Loading and error states
- [x] Updated portfolio page with historical chart
- [x] Documentation and changelog updates

---

## 🔗 Related Files

### Created Files
- `lib/services/snapshot-service.ts`
- `lib/cron/daily-snapshot.ts`
- `lib/server-init.ts`
- `components/portfolio/HistoricalChart.tsx`
- `components/portfolio/ComparisonChart.tsx`
- `app/api/portfolios/[id]/history/route.ts`
- `app/api/portfolios/history/compare/route.ts`
- `app/api/admin/snapshot/route.ts`

### Modified Files
- `prisma/schema.prisma` (added PortfolioSnapshot model)
- `app/layout.tsx` (server initialization)
- `app/(dashboard)/portfolios/[id]/page.tsx` (added historical chart)

---

## ⏭️ Next Feature

**[F13: CSV Import/Export](F13_csv_import_export.md)** - Bulk import/export functionality with CSV and PDF support

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

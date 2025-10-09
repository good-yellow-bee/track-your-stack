# F14: Portfolio Comparison

**Status:** ⬜ Not Started
**Priority:** 🟡 Important
**Estimated Time:** 2 days
**Dependencies:** F10 (Portfolio Summary)
**Phase:** Phase 2 - Advanced Features

---

## 📋 Overview

Implement side-by-side portfolio comparison allowing users to compare 2-4 portfolios across multiple metrics including total value, gains/losses, asset allocation, and best/worst performers.

**What this enables:**

- Compare multiple portfolios simultaneously
- Side-by-side metric comparison
- Asset allocation comparison with pie charts
- Best/worst performer comparison
- Export comparison report
- Reuse existing calculation logic (no new data model)
- Visual comparison grid layout

---

## 🎯 Acceptance Criteria

- [ ] Select 2-4 portfolios for comparison
- [ ] Side-by-side comparison grid layout
- [ ] Compare total value across portfolios
- [ ] Compare gain/loss metrics ($ and %)
- [ ] Display asset allocation pie charts side-by-side
- [ ] Show top 3 performers for each portfolio
- [ ] Show worst 3 performers for each portfolio
- [ ] Export comparison as PDF report
- [ ] Responsive design for mobile/tablet
- [ ] Empty state when fewer than 2 portfolios exist
- [ ] Loading states during calculation

---

## 🔧 Dependencies

No new dependencies required - reuses existing libraries:

- Recharts (already installed in F11)
- jsPDF (already installed in F13)

---

## 🏗️ Key Implementation Steps

### Step 1: Create Comparison Service

Create `lib/services/comparison-service.ts`:

```typescript
import { db } from '@/lib/db'
import { calculatePortfolioSummary, PortfolioSummary } from './calculation-service'

export interface PortfolioComparison {
  id: string
  name: string
  baseCurrency: string
  summary: PortfolioSummary
  topPerformers: Array<{
    ticker: string
    name: string
    gainLossPercent: number
    gainLoss: number
    value: number
  }>
  worstPerformers: Array<{
    ticker: string
    name: string
    gainLossPercent: number
    gainLoss: number
    value: number
  }>
}

export async function comparePortfolios(
  portfolioIds: string[],
  userId: string
): Promise<PortfolioComparison[]> {
  if (portfolioIds.length < 2 || portfolioIds.length > 4) {
    throw new Error('Must compare between 2 and 4 portfolios')
  }

  // Fetch all portfolios
  const portfolios = await db.portfolio.findMany({
    where: {
      id: { in: portfolioIds },
      userId,
    },
    include: {
      investments: {
        where: { isSold: false },
      },
    },
  })

  if (portfolios.length !== portfolioIds.length) {
    throw new Error('One or more portfolios not found')
  }

  // Calculate summaries for each portfolio
  const comparisons: PortfolioComparison[] = []

  for (const portfolio of portfolios) {
    const summary = await calculatePortfolioSummary(portfolio)

    // Sort by performance
    const sortedByPerformance = [...summary.investments].sort(
      (a, b) => b.metrics.gainLossPercent - a.metrics.gainLossPercent
    )

    const topPerformers = sortedByPerformance.slice(0, 3).map((inv) => ({
      ticker: inv.investment.ticker,
      name: inv.investment.assetName,
      gainLossPercent: inv.metrics.gainLossPercent,
      gainLoss: inv.metrics.totalGainLoss,
      value: inv.metrics.currentValue,
    }))

    const worstPerformers = sortedByPerformance
      .slice(-3)
      .reverse()
      .map((inv) => ({
        ticker: inv.investment.ticker,
        name: inv.investment.assetName,
        gainLossPercent: inv.metrics.gainLossPercent,
        gainLoss: inv.metrics.totalGainLoss,
        value: inv.metrics.currentValue,
      }))

    comparisons.push({
      id: portfolio.id,
      name: portfolio.name,
      baseCurrency: portfolio.baseCurrency,
      summary,
      topPerformers,
      worstPerformers,
    })
  }

  return comparisons
}

export function calculateComparisonMetrics(comparisons: PortfolioComparison[]) {
  // Find best portfolio by different metrics
  const bestByValue = [...comparisons].sort(
    (a, b) => b.summary.totalValue - a.summary.totalValue
  )[0]

  const bestByGainPercent = [...comparisons].sort(
    (a, b) => b.summary.totalGainLossPercent - a.summary.totalGainLossPercent
  )[0]

  const bestByGainAmount = [...comparisons].sort(
    (a, b) => b.summary.totalGainLoss - a.summary.totalGainLoss
  )[0]

  const totalValueAcrossAll = comparisons.reduce((sum, comp) => sum + comp.summary.totalValue, 0)

  const totalGainAcrossAll = comparisons.reduce((sum, comp) => sum + comp.summary.totalGainLoss, 0)

  const avgGainPercent =
    comparisons.reduce((sum, comp) => sum + comp.summary.totalGainLossPercent, 0) /
    comparisons.length

  return {
    bestByValue,
    bestByGainPercent,
    bestByGainAmount,
    totalValueAcrossAll,
    totalGainAcrossAll,
    avgGainPercent,
  }
}
```

### Step 2: Create Comparison API Route

Create `app/api/portfolios/compare/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { comparePortfolios, calculateComparisonMetrics } from '@/lib/services/comparison-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const portfolioIdsParam = searchParams.get('portfolios')

    if (!portfolioIdsParam) {
      return NextResponse.json(
        { error: 'Portfolio IDs required (portfolios=id1,id2,...)' },
        { status: 400 }
      )
    }

    const portfolioIds = portfolioIdsParam.split(',').filter(Boolean)

    if (portfolioIds.length < 2 || portfolioIds.length > 4) {
      return NextResponse.json(
        { error: 'Must compare between 2 and 4 portfolios' },
        { status: 400 }
      )
    }

    // Get comparison data
    const comparisons = await comparePortfolios(portfolioIds, session.user.id)
    const metrics = calculateComparisonMetrics(comparisons)

    return NextResponse.json({
      success: true,
      comparisons,
      metrics,
    })
  } catch (error) {
    console.error('Comparison failed:', error)
    return NextResponse.json(
      {
        error: 'Comparison failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

### Step 3: Create Comparison Page

Create `app/(dashboard)/compare/page.tsx`:

```typescript
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import PortfolioSelector from '@/components/comparison/PortfolioSelector'
import ComparisonView from '@/components/comparison/ComparisonView'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { portfolios?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Get user's portfolios
  const portfolios = await db.portfolio.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      baseCurrency: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const selectedIds = searchParams.portfolios?.split(',').filter(Boolean) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Comparison</h1>
          <p className="text-muted-foreground">
            Compare up to 4 portfolios side-by-side
          </p>
        </div>
        <TrendingUp className="h-8 w-8 text-muted-foreground" />
      </div>

      <PortfolioSelector portfolios={portfolios} selectedIds={selectedIds} />

      {selectedIds.length < 2 ? (
        <Card>
          <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
            Select at least 2 portfolios to compare
          </CardContent>
        </Card>
      ) : (
        <Suspense fallback={<ComparisonLoadingSkeleton />}>
          <ComparisonView portfolioIds={selectedIds} />
        </Suspense>
      )}
    </div>
  )
}

function ComparisonLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="h-64 animate-pulse bg-muted" />
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Step 4: Create Portfolio Selector Component

Create `components/comparison/PortfolioSelector.tsx`:

```typescript
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Portfolio {
  id: string
  name: string
  baseCurrency: string
  createdAt: Date
}

interface PortfolioSelectorProps {
  portfolios: Portfolio[]
  selectedIds: string[]
}

export default function PortfolioSelector({ portfolios, selectedIds }: PortfolioSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleToggle(portfolioId: string) {
    const currentIds = new Set(selectedIds)

    if (currentIds.has(portfolioId)) {
      currentIds.delete(portfolioId)
    } else {
      if (currentIds.size >= 4) {
        alert('Maximum 4 portfolios can be compared')
        return
      }
      currentIds.add(portfolioId)
    }

    const params = new URLSearchParams(searchParams)

    if (currentIds.size > 0) {
      params.set('portfolios', Array.from(currentIds).join(','))
    } else {
      params.delete('portfolios')
    }

    router.push(`/compare?${params.toString()}`)
  }

  function handleClear() {
    router.push('/compare')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Select Portfolios</CardTitle>
            <CardDescription>
              Choose 2-4 portfolios to compare (selected: {selectedIds.length})
            </CardDescription>
          </div>
          {selectedIds.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear Selection
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {portfolios.map((portfolio) => {
            const isSelected = selectedIds.includes(portfolio.id)

            return (
              <div
                key={portfolio.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:bg-muted'
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(portfolio.id)}
                  disabled={!isSelected && selectedIds.length >= 4}
                />
                <div className="flex-1">
                  <div className="font-medium">{portfolio.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="mt-1">
                      {portfolio.baseCurrency}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {portfolios.length === 0 && (
          <div className="text-center text-muted-foreground">
            No portfolios available. Create some portfolios first.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Step 5: Create Comparison View Component

Create `components/comparison/ComparisonView.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import { Loader2, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Button } from '@/components/ui/button'
import { PortfolioComparison } from '@/lib/services/comparison-service'

interface ComparisonViewProps {
  portfolioIds: string[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function ComparisonView({ portfolioIds }: ComparisonViewProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/portfolios/compare?portfolios=${portfolioIds.join(',')}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch comparison data')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Comparison failed:', err)
        setError('Failed to load comparison data')
      } finally {
        setLoading(false)
      }
    }

    if (portfolioIds.length >= 2) {
      fetchComparison()
    }
  }, [portfolioIds])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center text-destructive">
          {error || 'No data available'}
        </CardContent>
      </Card>
    )
  }

  const { comparisons, metrics } = data

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Combined Value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalValueAcrossAll, 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Combined Gain/Loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.totalGainAcrossAll >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.totalGainAcrossAll >= 0 ? '+' : ''}
              {formatCurrency(metrics.totalGainAcrossAll, 'USD')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Gain %</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                metrics.avgGainPercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {metrics.avgGainPercent >= 0 ? '+' : ''}
              {formatPercent(metrics.avgGainPercent, 2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Best Performer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{metrics.bestByGainPercent.name}</div>
            <div className="text-sm text-green-600">
              +{formatPercent(metrics.bestByGainPercent.summary.totalGainLossPercent, 2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Comparison Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {comparisons.map((comparison: PortfolioComparison, index: number) => (
          <Card key={comparison.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                {comparison.name}
              </CardTitle>
              <CardDescription>Base Currency: {comparison.baseCurrency}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(comparison.summary.totalValue, comparison.baseCurrency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gain/Loss</div>
                  <div
                    className={`text-xl font-bold ${
                      comparison.summary.totalGainLoss >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {comparison.summary.totalGainLoss >= 0 ? '+' : ''}
                    {formatCurrency(comparison.summary.totalGainLoss, comparison.baseCurrency)}
                  </div>
                  <div
                    className={`text-sm ${
                      comparison.summary.totalGainLossPercent >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {comparison.summary.totalGainLossPercent >= 0 ? '+' : ''}
                    {formatPercent(comparison.summary.totalGainLossPercent, 2)}
                  </div>
                </div>
              </div>

              {/* Asset Allocation Pie Chart */}
              <div>
                <div className="mb-2 text-sm font-medium">Asset Allocation</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={comparison.summary.investments.slice(0, 5).map((inv) => ({
                        name: inv.investment.ticker,
                        value: inv.metrics.currentValue,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => entry.name}
                    >
                      {comparison.summary.investments.slice(0, 5).map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(value, comparison.baseCurrency)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performers */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Top Performers
                </div>
                <div className="space-y-2">
                  {comparison.topPerformers.map((perf) => (
                    <div
                      key={perf.ticker}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">{perf.ticker}</span>
                      <span className="text-green-600">
                        +{formatPercent(perf.gainLossPercent, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worst Performers */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Worst Performers
                </div>
                <div className="space-y-2">
                  {comparison.worstPerformers.map((perf) => (
                    <div
                      key={perf.ticker}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-medium">{perf.ticker}</span>
                      <span className="text-red-600">
                        {formatPercent(perf.gainLossPercent, 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            alert('Export comparison report feature coming soon!')
          }}
        >
          Export Comparison
        </Button>
      </div>
    </div>
  )
}
```

### Step 6: Add Navigation Link

Update `components/layout/MainNav.tsx`:

```typescript
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Portfolios', href: '/portfolios' },
  { name: 'Compare', href: '/compare' }, // Add this
]

export default function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
```

### Step 7: Create Comparison Export Service (Optional)

Create `lib/pdf/comparison-export.ts`:

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { PortfolioComparison } from '@/lib/services/comparison-service'

export function exportComparisonPDF(comparisons: PortfolioComparison[]) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.text('Portfolio Comparison Report', 14, 22)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
  doc.text(`Portfolios: ${comparisons.map((c) => c.name).join(', ')}`, 14, 36)

  // Summary Table
  const summaryData = comparisons.map((c) => [
    c.name,
    `${c.summary.totalValue.toFixed(2)} ${c.baseCurrency}`,
    `${c.summary.totalGainLoss >= 0 ? '+' : ''}${c.summary.totalGainLoss.toFixed(2)}`,
    `${c.summary.totalGainLossPercent >= 0 ? '+' : ''}${c.summary.totalGainLossPercent.toFixed(2)}%`,
  ])

  autoTable(doc, {
    startY: 44,
    head: [['Portfolio', 'Total Value', 'Gain/Loss', '%']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Individual Portfolio Details
  let currentY = (doc as any).lastAutoTable.finalY + 10

  comparisons.forEach((comparison) => {
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(14)
    doc.text(comparison.name, 14, currentY)
    currentY += 8

    const investmentData = comparison.summary.investments
      .slice(0, 10)
      .map((inv) => [
        inv.investment.ticker,
        inv.investment.assetName,
        inv.metrics.currentValue.toFixed(2),
        `${inv.metrics.gainLossPercent >= 0 ? '+' : ''}${inv.metrics.gainLossPercent.toFixed(2)}%`,
      ])

    autoTable(doc, {
      startY: currentY,
      head: [['Ticker', 'Name', 'Value', 'Gain/Loss %']],
      body: investmentData,
      theme: 'striped',
      styles: { fontSize: 8 },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10
  })

  return doc.output('arraybuffer')
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] Portfolio selector displays all portfolios
- [ ] Can select/deselect portfolios with checkbox
- [ ] Maximum 4 portfolios enforced
- [ ] Comparison view loads correctly
- [ ] Metrics calculated accurately
- [ ] Pie charts display for each portfolio
- [ ] Top/worst performers show correctly
- [ ] Overall metrics calculated correctly
- [ ] Responsive design works on mobile
- [ ] Navigation link works
- [ ] Empty state shows when <2 portfolios selected

### API Testing

```bash
# Test comparison with 2 portfolios
curl "http://localhost:3000/api/portfolios/compare?portfolios=id1,id2"

# Test comparison with 4 portfolios
curl "http://localhost:3000/api/portfolios/compare?portfolios=id1,id2,id3,id4"

# Test error handling
curl "http://localhost:3000/api/portfolios/compare?portfolios=id1"
```

---

## 📚 Documentation Updates

### Update README.md

Add Portfolio Comparison section:

```markdown
## Portfolio Comparison

- Compare 2-4 portfolios side-by-side
- Compare total value, gains/losses, allocation
- View top and worst performers
- Visual comparison with pie charts
- Export comparison reports
```

### Update CHANGELOG.md

```markdown
## [0.4.0] - Phase 2: Portfolio Comparison

### Added

- Portfolio comparison page
- Side-by-side comparison of 2-4 portfolios
- Asset allocation comparison charts
- Top/worst performer comparison
- Overall comparison metrics
- Responsive comparison grid layout

### Technical

- Created comparison service
- Built comparison API endpoint
- Implemented portfolio selector component
- Created comparison view component
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Performance with Many Investments

**Problem:** Slow comparison with large portfolios

**Solution:** Limit displayed investments:

```typescript
// Show top 10 investments per portfolio
const topInvestments = comparison.summary.investments.slice(0, 10)
```

### Issue 2: Currency Mismatch

**Problem:** Comparing portfolios with different base currencies

**Solution:** Add currency conversion or warning:

```typescript
const currencies = new Set(comparisons.map((c) => c.baseCurrency))
if (currencies.size > 1) {
  // Show warning about currency differences
}
```

### Issue 3: Layout Issues on Mobile

**Problem:** Comparison grid not responsive

**Solution:** Use responsive grid:

```typescript
<div className="grid gap-6 lg:grid-cols-2">
  {/* Stacks vertically on mobile, side-by-side on desktop */}
</div>
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] Comparison service (comparePortfolios, calculateComparisonMetrics)
- [x] Comparison API endpoint
- [x] Compare page with portfolio selector
- [x] PortfolioSelector component
- [x] ComparisonView component with metrics and charts
- [x] Navigation link to comparison page
- [x] Responsive grid layout
- [x] Loading and error states
- [x] Overall metrics display
- [x] Individual portfolio comparison cards
- [x] Documentation updates

---

## 🔗 Related Files

### Created Files

- `lib/services/comparison-service.ts`
- `app/api/portfolios/compare/route.ts`
- `app/(dashboard)/compare/page.tsx`
- `components/comparison/PortfolioSelector.tsx`
- `components/comparison/ComparisonView.tsx`
- `lib/pdf/comparison-export.ts` (optional)

### Modified Files

- `components/layout/MainNav.tsx` (added Compare link)

---

## ⏭️ Next Feature

**[F15: PWA Setup](F15_pwa_setup.md)** - Progressive Web App configuration for mobile experience

---

**Status Legend:**

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

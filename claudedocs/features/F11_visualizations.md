# F11: Visualizations (Pie Charts)

**Status:** ✅ Completed (2025-10-21)
**Priority:** 🟡 Important
**Estimated Time:** 3-4 hours
**Dependencies:** F10 (Portfolio Summary)

---

## 📋 Overview

Create interactive pie charts showing portfolio allocation by investment using Recharts, with click-to-highlight functionality and responsive design.

**What this enables:**

- Visual portfolio allocation
- Color-coded segments per investment
- Interactive hover effects
- Click to highlight in table
- Responsive chart sizing
- Legend with percentages

---

## 🎯 Acceptance Criteria

- [x] Pie chart displays portfolio allocation
- [x] Each investment has unique color
- [x] Shows percentage labels
- [x] Hover shows tooltip with details
- [x] Click highlights investment in table (infrastructure ready)
- [x] Legend displays below chart
- [x] Responsive on all screen sizes
- [x] Handles empty portfolio gracefully

---

## 🔧 Key Implementation Steps

### Install Recharts (if not already)

```bash
pnpm add recharts
```

### Portfolio Pie Chart Component

Create `components/portfolio/PortfolioPieChart.tsx`:

```typescript
'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils/format'

interface ChartData {
  name: string
  value: number
  ticker: string
  percentage: number
  color: string
}

interface PortfolioPieChartProps {
  investments: Array<{
    ticker: string
    assetName: string
    currentValue: number
    percentOfPortfolio: number
  }>
  baseCurrency: string
  onSliceClick?: (ticker: string) => void
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
]

export default function PortfolioPieChart({
  investments,
  baseCurrency,
  onSliceClick,
}: PortfolioPieChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    return investments.map((inv, index) => ({
      name: inv.assetName,
      value: inv.currentValue,
      ticker: inv.ticker,
      percentage: inv.percentOfPortfolio,
      color: COLORS[index % COLORS.length],
    }))
  }, [investments])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>No investments to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Add investments to see portfolio allocation
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>Distribution of investments by current value</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.ticker} ${formatPercent(entry.percentage, 1)}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={(data) => onSliceClick?.(data.ticker)}
              style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload as ChartData

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-semibold">{data.ticker}</div>
                    <div className="text-sm text-muted-foreground">{data.name}</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        Value: {formatCurrency(data.value, baseCurrency)}
                      </div>
                      <div className="text-sm">
                        Allocation: {formatPercent(data.percentage, 2)}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {payload?.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Asset Type Distribution Chart

Create `components/portfolio/AssetTypeChart.tsx`:

```typescript
'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import { AssetType } from '@prisma/client'

interface AssetTypeData {
  type: AssetType
  value: number
  count: number
  percentage: number
}

interface AssetTypeChartProps {
  investments: Array<{
    assetType: AssetType
    currentValue: number
  }>
  baseCurrency: string
}

const TYPE_COLORS: Record<AssetType, string> = {
  STOCK: '#3b82f6',
  ETF: '#10b981',
  MUTUAL_FUND: '#f59e0b',
  CRYPTO: '#8b5cf6',
}

const TYPE_LABELS: Record<AssetType, string> = {
  STOCK: 'Stocks',
  ETF: 'ETFs',
  MUTUAL_FUND: 'Mutual Funds',
  CRYPTO: 'Crypto',
}

export default function AssetTypeChart({ investments, baseCurrency }: AssetTypeChartProps) {
  const chartData = useMemo<AssetTypeData[]>(() => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)

    const typeMap = investments.reduce((acc, inv) => {
      if (!acc[inv.assetType]) {
        acc[inv.assetType] = { value: 0, count: 0 }
      }
      acc[inv.assetType].value += inv.currentValue
      acc[inv.assetType].count += 1
      return acc
    }, {} as Record<AssetType, { value: number; count: number }>)

    return Object.entries(typeMap).map(([type, data]) => ({
      type: type as AssetType,
      value: data.value,
      count: data.count,
      percentage: (data.value / totalValue) * 100,
    }))
  }, [investments])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Type Distribution</CardTitle>
        <CardDescription>Portfolio breakdown by asset class</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${TYPE_LABELS[entry.type]} ${formatPercent(entry.percentage, 0)}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload as AssetTypeData

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-semibold">{TYPE_LABELS[data.type]}</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        Value: {formatCurrency(data.value, baseCurrency)}
                      </div>
                      <div className="text-sm">Count: {data.count} investment(s)</div>
                      <div className="text-sm">
                        Allocation: {formatPercent(data.percentage, 2)}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

### Update Portfolio Page with Charts

Update `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
import PortfolioSummary from '@/components/portfolio/PortfolioSummary'
import PortfolioPieChart from '@/components/portfolio/PortfolioPieChart'
import AssetTypeChart from '@/components/portfolio/AssetTypeChart'
import AllocationList from '@/components/portfolio/AllocationList'
import InvestmentTable from '@/components/investment/InvestmentTable'
import RefreshPricesButton from '@/components/investment/RefreshPricesButton'

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result
  const summary = await calculatePortfolioSummary(portfolio)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
          <p className="text-muted-foreground">Base Currency: {portfolio.baseCurrency}</p>
        </div>
        <RefreshPricesButton portfolioId={portfolio.id} />
      </div>

      {/* Summary Cards */}
      <PortfolioSummary portfolio={portfolio} />

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioPieChart
          investments={summary.investments.map((i) => ({
            ticker: i.investment.ticker,
            assetName: i.investment.assetName,
            currentValue: i.metrics.currentValue,
            percentOfPortfolio: i.percentOfPortfolio,
          }))}
          baseCurrency={portfolio.baseCurrency}
        />

        <AssetTypeChart
          investments={portfolio.investments.map((i) => ({
            assetType: i.assetType,
            currentValue: i.currentPrice?.toNumber() || 0 * i.totalQuantity.toNumber(),
          }))}
          baseCurrency={portfolio.baseCurrency}
        />
      </div>

      {/* Investment Table */}
      <InvestmentTable investments={portfolio.investments} portfolioId={portfolio.id} />
    </div>
  )
}
```

### Interactive Chart with Table Highlighting

Create `hooks/useTableHighlight.ts`:

```typescript
'use client'

import { create } from 'zustand'

interface TableHighlightState {
  highlightedTicker: string | null
  setHighlightedTicker: (ticker: string | null) => void
}

export const useTableHighlight = create<TableHighlightState>((set) => ({
  highlightedTicker: null,
  setHighlightedTicker: (ticker) => set({ highlightedTicker: ticker }),
}))
```

Update `InvestmentTable.tsx` to use highlighting:

```typescript
import { useTableHighlight } from '@/hooks/useTableHighlight'

export default function InvestmentTable({ investments }) {
  const { highlightedTicker } = useTableHighlight()

  return (
    <Table>
      <TableBody>
        {investments.map((inv) => (
          <TableRow
            key={inv.id}
            className={
              highlightedTicker === inv.ticker ? 'bg-blue-50 dark:bg-blue-950' : ''
            }
          >
            {/* table cells */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 🧪 Testing Requirements

- [ ] Pie chart renders correctly
- [ ] Colors distinct for each investment
- [ ] Percentages add up to 100%
- [ ] Tooltip shows on hover
- [ ] Click-to-highlight works
- [ ] Responsive on mobile
- [ ] Legend displays correctly
- [ ] Empty state shows when no investments

---

## 📦 Deliverables

- [x] Portfolio pie chart component - `PortfolioPieChart.tsx`
- [x] Asset type distribution chart - `AssetTypeChart.tsx`
- [x] Interactive tooltips - Recharts tooltip with custom styling
- [x] Click-to-highlight functionality - Context provider created
- [x] Responsive design - Mobile-friendly with responsive containers
- [x] Updated portfolio page - Charts integrated with conditional rendering

---

## 🔗 Related Files

- `components/portfolio/PortfolioPieChart.tsx`
- `components/portfolio/AssetTypeChart.tsx`
- `hooks/useTableHighlight.ts`
- `app/(dashboard)/portfolios/[id]/page.tsx`

---

## 🎉 Completion

**Congratulations!** All MVP features (F01-F11) are now documented and ready for implementation.

### Next Steps

1. Begin implementation following feature order
2. Run tests after each feature
3. Deploy incrementally to Vercel
4. Gather user feedback
5. Plan Phase 2 features

### Phase 2 Features (Optional)

- Historical performance charts
- Portfolio comparison
- CSV import/export
- PDF reports
- PWA mobile app

---

**Status Legend:**

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

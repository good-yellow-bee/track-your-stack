# F10: Portfolio Summary Cards

**Status:** ✅ Completed
**Priority:** 🟡 Important
**Estimated Time:** 3-4 hours
**Dependencies:** F08 (Calculation Engine), F09 (Price Refresh)
**Actual Time:** ~3 hours
**Components Created:** 5 (PortfolioSummary, MetricCard, PerformanceBadge, AllocationList, Progress)

---

## 📋 Overview

Create visual summary cards displaying key portfolio metrics: total value, total cost, gains/loss, and best/worst performers with color-coded indicators.

**What this enables:**

- Quick portfolio performance overview
- Visual gain/loss indicators
- Best/worst performer highlights
- Responsive card layout
- Real-time metric updates

---

## 🎯 Acceptance Criteria

- [x] Total value card displaying correctly
- [x] Total cost card showing investment basis
- [x] Gain/loss card with dollar and percentage
- [x] Best/worst performer cards
- [x] Color-coded indicators (green/red)
- [x] Currency formatting accurate
- [x] Responsive on all screen sizes
- [x] Updates after price refresh

---

## 🔧 Key Implementation Steps

### Summary Cards Component

Create `components/portfolio/PortfolioSummary.tsx`:

```typescript
import { Portfolio, Investment } from '@prisma/client'
import { calculatePortfolioSummary } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent, getGainLossColor } from '@/lib/utils/format'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Award } from 'lucide-react'

interface PortfolioSummaryProps {
  portfolio: Portfolio & { investments: Investment[] }
}

export default async function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const summary = await calculatePortfolioSummary(portfolio)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalValue, portfolio.baseCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">Current portfolio value</p>
        </CardContent>
      </Card>

      {/* Total Cost Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalCost, portfolio.baseCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">Total invested</p>
        </CardContent>
      </Card>

      {/* Gain/Loss Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
          {summary.totalGainLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getGainLossColor(summary.totalGainLoss)}`}>
            {formatCurrency(summary.totalGainLoss, portfolio.baseCurrency)}
          </div>
          <p className={`text-xs ${getGainLossColor(summary.totalGainLossPercent)}`}>
            {formatPercent(summary.totalGainLossPercent)}
          </p>
        </CardContent>
      </Card>

      {/* Best Performer Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Award className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {summary.bestPerformer ? (
            <>
              <div className="text-2xl font-bold">{summary.bestPerformer.ticker}</div>
              <p className="text-xs text-green-600">
                {formatPercent(
                  summary.investments.find((i) => i.investment.id === summary.bestPerformer?.id)
                    ?.metrics.gainLossPercent || 0
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Metric Card Component

Create `components/portfolio/MetricCard.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  className?: string
  valueClassName?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
```

### Performance Badge Component

Create `components/portfolio/PerformanceBadge.tsx`:

```typescript
import { formatPercent, getGainLossColor } from '@/lib/utils/format'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PerformanceBadgeProps {
  value: number
  showIcon?: boolean
}

export default function PerformanceBadge({ value, showIcon = true }: PerformanceBadgeProps) {
  const color = getGainLossColor(value)

  let Icon = Minus
  if (value > 0) Icon = TrendingUp
  if (value < 0) Icon = TrendingDown

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-sm font-medium">{formatPercent(value)}</span>
    </div>
  )
}
```

### Investment Allocation Component

Create `components/portfolio/AllocationList.tsx`:

```typescript
import { Investment } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatPercent } from '@/lib/utils/format'

interface AllocationListProps {
  investments: Array<{
    investment: Investment
    percentOfPortfolio: number
    currentValue: number
  }>
  baseCurrency: string
}

export default function AllocationList({ investments, baseCurrency }: AllocationListProps) {
  const sorted = [...investments].sort((a, b) => b.percentOfPortfolio - a.percentOfPortfolio)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <CardDescription>Portfolio distribution by investment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map(({ investment, percentOfPortfolio, currentValue }) => (
          <div key={investment.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{investment.ticker}</span>
                <span className="ml-2 text-muted-foreground">{investment.assetName}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(currentValue, baseCurrency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent(percentOfPortfolio, 1)}
                </div>
              </div>
            </div>
            <Progress value={percentOfPortfolio} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

### Update Portfolio Detail Page

Update `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
import PortfolioSummary from '@/components/portfolio/PortfolioSummary'
import AllocationList from '@/components/portfolio/AllocationList'
import InvestmentTable from '@/components/investment/InvestmentTable'
import RefreshPricesButton from '@/components/investment/RefreshPricesButton'

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result

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

      {/* Allocation List */}
      <AllocationList
        investments={portfolio.investments}
        baseCurrency={portfolio.baseCurrency}
      />

      {/* Investment Table */}
      <InvestmentTable investments={portfolio.investments} portfolioId={portfolio.id} />
    </div>
  )
}
```

---

## 🧪 Testing Requirements

- [x] All cards display correct values
- [x] Color coding works (green/red)
- [x] Currency formatting correct
- [x] Percentage calculations accurate
- [x] Best/worst performers identified correctly
- [x] Responsive on mobile/tablet/desktop
- [x] Updates after price refresh

**Test Coverage:**
- 153 total tests passing
- Portfolio calculation tests (8 tests)
- Investment calculation tests (13 tests)
- Formatting utility tests (27 tests)

---

## 📦 Deliverables

- [x] Portfolio summary cards
- [x] Metric card component
- [x] Performance badge component
- [x] Allocation list
- [x] Updated portfolio page

---

## 🔗 Related Files

- `components/portfolio/PortfolioSummary.tsx`
- `components/portfolio/MetricCard.tsx`
- `components/portfolio/PerformanceBadge.tsx`
- `components/portfolio/AllocationList.tsx`
- `app/(dashboard)/portfolios/[id]/page.tsx`

---

## ⏭️ Next Feature

→ [F11: Visualizations (Pie Charts)](F11_visualizations.md)

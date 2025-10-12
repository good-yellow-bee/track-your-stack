# UX & Feature Prioritization Matrix

**Document Version**: 1.0
**Date**: 2025-10-12
**Status**: Product Planning

## Executive Summary

This document prioritizes user experience improvements and feature enhancements for Track Your Stack based on user impact, implementation effort, and strategic value. It identifies **23 UX/feature gaps** across 6 categories.

**Impact Assessment**:
- 🔴 **Critical**: Blocks core use cases or causes user confusion
- 🟡 **High**: Significantly improves experience but has workarounds
- 🟢 **Medium**: Nice-to-have improvements
- ⚪ **Low**: Future enhancements

**Effort Scale**:
- **XS**: <2 days
- **S**: 2-5 days
- **M**: 1-2 weeks
- **L**: 2-4 weeks
- **XL**: 1-2 months

**Total Identified Gaps**: 23 features
**Quick Wins** (High Impact, Low Effort): 8 features
**Strategic Initiatives** (High Impact, High Effort): 6 features

---

## Priority Matrix Overview

```
                HIGH IMPACT
                    │
         Q2         │         Q1
    Strategic       │    Quick Wins
    Initiatives     │
────────────────────┼────────────────────
         Q3         │         Q4
    Low Priority    │   Avoid for Now
                    │
                LOW IMPACT

        LOW EFFORT          HIGH EFFORT
```

### Quadrant 1: Quick Wins (Do First)
High impact, low effort - implement immediately

### Quadrant 2: Strategic Initiatives (Plan Carefully)
High impact, high effort - plan and execute systematically

### Quadrant 3: Low Priority (Schedule Later)
Low impact, low effort - fill in gaps during slow periods

### Quadrant 4: Avoid for Now
Low impact, high effort - defer indefinitely

---

## Q1: Quick Wins (Priority: IMMEDIATE)

### 1. Dashboard Overview with Key Metrics
**Impact**: 🔴 Critical | **Effort**: S (3 days)

**Current State**: Users land on empty dashboard with no portfolio summary.

**Problem**:
- No total portfolio value displayed
- No aggregate gain/loss across all portfolios
- User must click into each portfolio to see performance

**Proposed Solution**:
```typescript
// components/dashboard/PortfolioSummaryCards.tsx
export function PortfolioSummaryCards({ userId }: { userId: string }) {
  const summary = await getPortfolioSummary(userId)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(summary.totalValue, summary.baseCurrency)}
          </div>
          <p className="text-sm text-muted-foreground">
            Across {summary.portfolioCount} portfolios
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Gain/Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-3xl font-bold",
            summary.totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {summary.totalGainLoss >= 0 ? "+" : ""}
            {formatCurrency(summary.totalGainLoss, summary.baseCurrency)}
          </div>
          <p className="text-sm text-muted-foreground">
            {summary.totalGainLossPercent >= 0 ? "+" : ""}
            {summary.totalGainLossPercent.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best Performer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">{summary.bestPerformer.ticker}</div>
          <p className="text-sm text-green-600">
            +{summary.bestPerformer.gainPercent.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**User Value**:
- ✅ Instant understanding of total wealth
- ✅ Performance at-a-glance
- ✅ Motivation to engage with the app

**Implementation Tasks**:
- [ ] Create aggregate query function
- [ ] Build summary card components
- [ ] Add performance comparison logic
- [ ] Handle multi-currency normalization
- [ ] Add loading states and error handling

---

### 2. Price Refresh Button with Visual Feedback
**Impact**: 🔴 Critical | **Effort**: XS (1 day)

**Current State**: No way to manually refresh prices; users unsure if data is current.

**Problem**:
- Stale prices displayed without indication
- No manual refresh option
- Users don't know when last updated

**Proposed Solution**:
```typescript
// components/investment/PriceRefreshButton.tsx
'use client'

export function PriceRefreshButton({ investmentId }: { investmentId: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await refreshInvestmentPrice(investmentId)
      setLastRefreshed(new Date())
      toast.success('Price updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to refresh price')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        Refresh Price
      </Button>
      {lastRefreshed && (
        <span className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(lastRefreshed)} ago
        </span>
      )}
    </div>
  )
}
```

**User Value**:
- ✅ Control over data freshness
- ✅ Confidence in displayed values
- ✅ Visual feedback during refresh

---

### 3. Bulk Price Refresh for All Holdings
**Impact**: 🟡 High | **Effort**: S (2 days)

**Current State**: Must refresh each investment individually.

**Problem**:
- Tedious for users with 10+ holdings
- No "refresh all" option

**Proposed Solution**:
```typescript
// components/portfolio/RefreshAllPricesButton.tsx
'use client'

export function RefreshAllPricesButton({ portfolioId }: { portfolioId: string }) {
  const [progress, setProgress] = useState<{
    total: number
    completed: number
    status: 'idle' | 'running' | 'done' | 'error'
  }>({ total: 0, completed: 0, status: 'idle' })

  async function handleRefreshAll() {
    setProgress({ total: 0, completed: 0, status: 'running' })

    try {
      const result = await refreshAllPortfolioPrices(portfolioId, (update) => {
        setProgress((prev) => ({ ...prev, ...update }))
      })

      setProgress({ ...result, status: 'done' })
      toast.success(`Updated ${result.completed} of ${result.total} prices`)
      router.refresh()
    } catch (error) {
      setProgress((prev) => ({ ...prev, status: 'error' }))
      toast.error('Failed to refresh prices')
    }
  }

  return (
    <>
      <Button onClick={handleRefreshAll} disabled={progress.status === 'running'}>
        {progress.status === 'running' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Refreshing ({progress.completed}/{progress.total})
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh All Prices
          </>
        )}
      </Button>

      {progress.status === 'running' && (
        <Progress value={(progress.completed / progress.total) * 100} />
      )}
    </>
  )
}
```

**User Value**:
- ✅ Saves time for large portfolios
- ✅ Progress visibility
- ✅ Better user experience

---

### 4. Import from CSV/Brokerage
**Impact**: 🔴 Critical | **Effort**: M (1 week)

**Current State**: Manual entry only, no import functionality.

**Problem**:
- Tedious onboarding for users with existing portfolios
- High friction to adoption
- Error-prone manual data entry

**Proposed Solution**:

**Step 1: CSV Import**
```typescript
// lib/import/csv-parser.ts

export interface CSVImportRow {
  ticker: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  commission?: number
  notes?: string
}

export async function parseCSV(file: File): Promise<CSVImportRow[]> {
  const text = await file.text()
  const lines = text.split('\n')
  const headers = lines[0].toLowerCase().split(',')

  return lines.slice(1).map((line) => {
    const values = line.split(',')
    return {
      ticker: getValue(headers, values, 'ticker', 'symbol'),
      quantity: parseFloat(getValue(headers, values, 'quantity', 'shares')),
      purchasePrice: parseFloat(getValue(headers, values, 'price', 'cost', 'purchase_price')),
      purchaseDate: getValue(headers, values, 'date', 'purchase_date'),
      commission: parseOptionalFloat(getValue(headers, values, 'commission', 'fee')),
      notes: getValue(headers, values, 'notes', 'memo'),
    }
  })
}

// components/portfolio/ImportCSVDialog.tsx
export function ImportCSVDialog({ portfolioId }: { portfolioId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<CSVImportRow[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  async function handleFileSelect(file: File) {
    setFile(file)
    const rows = await parseCSV(file)
    setPreview(rows.slice(0, 5)) // Show first 5 rows

    // Validate
    const errors = validateImportRows(rows)
    setValidationErrors(errors)
  }

  async function handleImport() {
    if (!file) return

    const rows = await parseCSV(file)
    await importInvestments(portfolioId, rows)

    toast.success(`Imported ${rows.length} investments`)
    router.refresh()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import from CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Investments</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: ticker, quantity, price, date
          </DialogDescription>
        </DialogHeader>

        {/* File upload */}
        {/* Preview table */}
        {/* Validation errors */}
        {/* Import button */}
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Brokerage Integration** (Future)
- Plaid API for automated brokerage sync
- Support major brokers: Fidelity, Schwab, Vanguard, Robinhood

**User Value**:
- ✅ Fast onboarding (minutes vs hours)
- ✅ Accurate data import
- ✅ Competitive with existing tools

---

### 5. Portfolio Performance Charts
**Impact**: 🟡 High | **Effort**: S (4 days)

**Current State**: No visualization of portfolio performance over time.

**Problem**:
- Users can't see historical trends
- No visual comparison of portfolios
- Hard to understand performance

**Proposed Solution**:
```typescript
// components/portfolio/PerformanceChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function PerformanceChart({ portfolioId }: { portfolioId: string }) {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '1Y' | 'ALL'>('1Y')
  const data = usePortfolioHistory(portfolioId, timeRange)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Portfolio Performance</CardTitle>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="costBasis"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

**Data Storage Strategy**:
```prisma
model PortfolioSnapshot {
  id          String   @id @default(cuid())
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  date        DateTime @db.Date
  totalValue  Decimal  @db.Decimal(20, 2)
  totalCost   Decimal  @db.Decimal(20, 2)
  gainLoss    Decimal  @db.Decimal(20, 2)
  createdAt   DateTime @default(now())

  @@unique([portfolioId, date])
  @@index([portfolioId, date])
}
```

**Snapshot Generation**:
- Daily cron job captures portfolio value
- Historical reconstruction for existing data
- Efficient querying for chart rendering

**User Value**:
- ✅ Visual performance tracking
- ✅ Trend identification
- ✅ Comparison with cost basis

---

### 6. Search/Filter Investments
**Impact**: 🟡 High | **Effort**: XS (2 days)

**Current State**: No search or filter on investment lists.

**Problem**:
- Hard to find specific holdings in large portfolios
- No sorting options
- No filtering by asset type or performance

**Proposed Solution**:
```typescript
// components/portfolio/InvestmentFilters.tsx
'use client'

export function InvestmentFilters() {
  const [search, setSearch] = useState('')
  const [assetType, setAssetType] = useState<AssetType | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'ticker' | 'value' | 'gainLoss'>('ticker')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  return (
    <div className="flex gap-4 mb-4">
      {/* Search input */}
      <Input
        placeholder="Search by ticker or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Asset type filter */}
      <Select value={assetType} onValueChange={setAssetType}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Asset Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Assets</SelectItem>
          <SelectItem value="STOCK">Stocks</SelectItem>
          <SelectItem value="ETF">ETFs</SelectItem>
          <SelectItem value="CRYPTO">Crypto</SelectItem>
          <SelectItem value="MUTUAL_FUND">Mutual Funds</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort dropdown */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ticker">Ticker</SelectItem>
          <SelectItem value="value">Portfolio Value</SelectItem>
          <SelectItem value="gainLoss">Gain/Loss</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

**User Value**:
- ✅ Quick access to specific holdings
- ✅ Identify best/worst performers
- ✅ Better organization

---

### 7. Mobile Responsive Design
**Impact**: 🔴 Critical | **Effort**: S (4 days)

**Current State**: Desktop-first design, poor mobile experience.

**Problem**:
- Tables don't fit mobile screens
- Small touch targets
- Hard to navigate on phone

**Proposed Solution**:
```typescript
// components/portfolio/InvestmentListMobile.tsx
'use client'

export function InvestmentListMobile({ investments }: { investments: Investment[] }) {
  return (
    <div className="md:hidden space-y-3">
      {investments.map((investment) => (
        <Card key={investment.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{investment.ticker}</h3>
                <p className="text-sm text-muted-foreground">
                  {investment.totalQuantity} shares
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(investment.currentValue)}
                </p>
                <p className={cn(
                  "text-sm",
                  investment.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {investment.gainLoss >= 0 ? "+" : ""}
                  {formatCurrency(investment.gainLoss)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1">
                Details
              </Button>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Responsive Patterns**:
- Table → Card list on mobile
- Hamburger menu for navigation
- Bottom navigation bar
- Swipe gestures for actions

**User Value**:
- ✅ Check portfolio on-the-go
- ✅ Better touch interactions
- ✅ Competitive with mobile apps

---

### 8. Accessibility Improvements (WCAG 2.1 AA)
**Impact**: 🟡 High | **Effort**: S (3 days)

**Current State**: Limited accessibility testing, no ARIA labels.

**Problem**:
- Screen reader users can't navigate effectively
- Keyboard navigation incomplete
- Color contrast issues
- No skip navigation links

**Proposed Solution**:

**1. Semantic HTML & ARIA**:
```typescript
// components/portfolio/PortfolioCard.tsx
export function PortfolioCard({ portfolio }: { portfolio: Portfolio }) {
  return (
    <article
      role="article"
      aria-labelledby={`portfolio-${portfolio.id}-name`}
      aria-describedby={`portfolio-${portfolio.id}-value`}
    >
      <h3 id={`portfolio-${portfolio.id}-name`}>
        {portfolio.name}
      </h3>
      <p id={`portfolio-${portfolio.id}-value`}>
        Current value: {formatCurrency(portfolio.totalValue)}
      </p>
      <Button
        aria-label={`View details for ${portfolio.name} portfolio`}
      >
        View Details
      </Button>
    </article>
  )
}
```

**2. Keyboard Navigation**:
```typescript
// components/investment/InvestmentTable.tsx
'use client'

export function InvestmentTable({ investments }: { investments: Investment[] }) {
  const [focusedIndex, setFocusedIndex] = useState(0)

  function handleKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        setFocusedIndex((i) => Math.min(i + 1, investments.length - 1))
        break
      case 'ArrowUp':
        setFocusedIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        router.push(`/investments/${investments[focusedIndex].id}`)
        break
    }
  }

  return (
    <table onKeyDown={handleKeyDown}>
      {/* ... */}
    </table>
  )
}
```

**3. Color Contrast Audit**:
- Use shadcn/ui color variables (already WCAG AA compliant)
- Test with axe DevTools
- Fix any failing contrast ratios

**4. Skip Navigation**:
```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4"
        >
          Skip to main content
        </a>
        <Navigation />
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
```

**User Value**:
- ✅ Inclusive for users with disabilities
- ✅ Better SEO
- ✅ Legal compliance

---

## Q2: Strategic Initiatives (Priority: HIGH)

### 9. Onboarding Flow & Interactive Tutorial
**Impact**: 🔴 Critical | **Effort**: M (2 weeks)

**Current State**: No onboarding, users dropped into empty app.

**Problem**:
- High abandonment rate for new users
- Unclear how to get started
- No guidance on features

**Proposed Solution**:

**Step 1: Welcome Screen**
```typescript
// app/(dashboard)/welcome/page.tsx
export default async function WelcomePage() {
  const session = await getServerSession()
  const hasPortfolios = await prisma.portfolio.count({
    where: { userId: session.user.id }
  }) > 0

  if (hasPortfolios) {
    redirect('/dashboard')
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to Track Your Stack!</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Let's get your portfolio tracking set up in 3 simple steps.
      </p>

      <div className="space-y-6">
        <OnboardingStep
          number={1}
          title="Create Your First Portfolio"
          description="Organize your investments into portfolios (e.g., Retirement, Taxable)"
          action={
            <Button size="lg">
              Create Portfolio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />

        <OnboardingStep
          number={2}
          title="Add Your Investments"
          description="Enter your holdings manually or import from CSV"
          action={<Button variant="outline">Learn More</Button>}
        />

        <OnboardingStep
          number={3}
          title="Track Performance"
          description="Watch your portfolio grow with automatic price updates"
          action={<Button variant="outline">See Demo</Button>}
        />
      </div>
    </div>
  )
}
```

**Step 2: Interactive Tour**
```typescript
// Use react-joyride for interactive product tour
import Joyride from 'react-joyride'

export function ProductTour() {
  const steps = [
    {
      target: '#dashboard-summary',
      content: 'See your total portfolio value and performance at a glance',
    },
    {
      target: '#portfolio-list',
      content: 'Manage multiple portfolios for different investment accounts',
    },
    {
      target: '#refresh-prices',
      content: 'Update prices with a single click',
    },
  ]

  return <Joyride steps={steps} continuous showProgress showSkipButton />
}
```

**Step 3: Quick Start Checklist**
```typescript
// components/onboarding/QuickStartChecklist.tsx
export function QuickStartChecklist() {
  const progress = useOnboardingProgress()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start Checklist</CardTitle>
        <Progress value={progress.percentComplete} />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <ChecklistItem completed={progress.createdPortfolio}>
            Create your first portfolio
          </ChecklistItem>
          <ChecklistItem completed={progress.addedInvestment}>
            Add an investment
          </ChecklistItem>
          <ChecklistItem completed={progress.refreshedPrices}>
            Refresh prices
          </ChecklistItem>
          <ChecklistItem completed={progress.viewedChart}>
            View performance chart
          </ChecklistItem>
        </ul>
      </CardContent>
    </Card>
  )
}
```

**User Value**:
- ✅ Reduces time-to-value
- ✅ Lower abandonment rate
- ✅ Better user activation

---

### 10. Notification System (Email & In-App)
**Impact**: 🟡 High | **Effort**: M (2 weeks)

**Current State**: No notifications or alerts.

**Problem**:
- Users don't know when prices update
- No alerts for significant changes
- No reminders for portfolio review

**Proposed Solution**:

**Email Notifications (Resend + React Email)**:
```typescript
// emails/PriceAlertEmail.tsx
import { Html, Body, Container, Heading, Text } from '@react-email/components'

export function PriceAlertEmail({ investment, changePercent }: Props) {
  return (
    <Html>
      <Body>
        <Container>
          <Heading>{investment.ticker} Alert</Heading>
          <Text>
            {investment.ticker} has changed by {changePercent.toFixed(2)}% in the last 24 hours.
          </Text>
          <Text>
            Current price: ${investment.currentPrice}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// lib/notifications/email.ts
import { Resend } from 'resend'

export async function sendPriceAlert(userId: string, investment: Investment) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'alerts@trackyourstack.com',
    to: user.email,
    subject: `Price Alert: ${investment.ticker}`,
    react: PriceAlertEmail({ investment }),
  })
}
```

**In-App Notifications**:
```prisma
model Notification {
  id        String             @id @default(cuid())
  userId    String
  user      User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  read      Boolean            @default(false)
  actionUrl String?
  createdAt DateTime           @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}

enum NotificationType {
  PRICE_ALERT
  PORTFOLIO_MILESTONE
  SYSTEM_UPDATE
  PRICE_REFRESH_FAILED
}
```

**User Preferences**:
```prisma
model NotificationPreferences {
  userId              String  @id
  user                User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailEnabled        Boolean @default(true)
  priceAlerts         Boolean @default(true)
  weeklyDigest        Boolean @default(true)
  milestoneAlerts     Boolean @default(true)
  alertThreshold      Decimal @default(5.0) @db.Decimal(5, 2) // % change threshold
}
```

**User Value**:
- ✅ Stay informed of portfolio changes
- ✅ Timely alerts for action
- ✅ Customizable preferences

---

### 11. Advanced Reporting & Export
**Impact**: 🟡 High | **Effort**: L (3 weeks)

**Current State**: No reporting or export functionality.

**Problem**:
- Can't export data for tax preparation
- No year-end summaries
- Hard to analyze performance

**Proposed Solution**:

**Export Formats**:
1. CSV (holdings list)
2. PDF (portfolio report)
3. JSON (raw data)
4. TurboTax CSV (tax import)

```typescript
// lib/reporting/export.ts

export async function exportPortfolioPDF(portfolioId: string): Promise<Buffer> {
  const portfolio = await getPortfolioWithInvestments(portfolioId)

  const doc = new PDFDocument()

  // Header
  doc.fontSize(20).text('Portfolio Report', { align: 'center' })
  doc.fontSize(12).text(portfolio.name, { align: 'center' })
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })

  // Summary
  doc.fontSize(16).text('Summary', { underline: true })
  doc.fontSize(12).text(`Total Value: ${formatCurrency(portfolio.totalValue)}`)
  doc.text(`Total Cost: ${formatCurrency(portfolio.totalCost)}`)
  doc.text(`Gain/Loss: ${formatCurrency(portfolio.gainLoss)}`)

  // Holdings table
  doc.fontSize(16).text('Holdings', { underline: true })
  // ... table rendering

  return doc
}

export async function exportHoldingsCSV(portfolioId: string): Promise<string> {
  const investments = await getPortfolioInvestments(portfolioId)

  const rows = [
    ['Ticker', 'Quantity', 'Avg Cost', 'Current Price', 'Total Value', 'Gain/Loss', 'Gain/Loss %'],
  ]

  for (const inv of investments) {
    rows.push([
      inv.ticker,
      inv.totalQuantity.toString(),
      inv.averageCostBasis.toString(),
      inv.currentPrice?.toString() || 'N/A',
      inv.currentValue.toString(),
      inv.gainLoss.toString(),
      inv.gainLossPercent.toFixed(2) + '%',
    ])
  }

  return rows.map((row) => row.join(',')).join('\n')
}
```

**Year-End Tax Report**:
```typescript
// lib/reporting/tax-report.ts

export async function generateYearEndTaxReport(
  userId: string,
  year: number
): Promise<TaxReport> {
  // Get all realized gains/losses (when tax lot tracking implemented)
  const sales = await prisma.saleTransaction.findMany({
    where: {
      investment: { portfolio: { userId } },
      saleDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
    },
    include: { taxLotsUsed: true },
  })

  // Calculate short-term vs long-term gains
  const shortTermGains = sales
    .filter((s) => s.isShortTerm)
    .reduce((sum, s) => sum + Number(s.gainLoss), 0)

  const longTermGains = sales
    .filter((s) => s.isLongTerm)
    .reduce((sum, s) => sum + Number(s.gainLoss), 0)

  // Get dividend income
  const dividends = await prisma.dividend.findMany({
    where: {
      investment: { portfolio: { userId } },
      paymentDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
    },
  })

  const qualifiedDividends = dividends
    .filter((d) => d.qualifiedDividend)
    .reduce((sum, d) => sum + Number(d.totalAmount), 0)

  const ordinaryDividends = dividends
    .filter((d) => !d.qualifiedDividend)
    .reduce((sum, d) => sum + Number(d.totalAmount), 0)

  return {
    year,
    shortTermGains,
    longTermGains,
    qualifiedDividends,
    ordinaryDividends,
    totalTaxableIncome: shortTermGains + longTermGains + ordinaryDividends,
  }
}
```

**User Value**:
- ✅ Easy tax preparation
- ✅ Professional reports
- ✅ Data portability

---

### 12. Portfolio Comparison View
**Impact**: 🟡 High | **Effort**: S (5 days)

**Current State**: Can't compare portfolios side-by-side.

**Problem**:
- Hard to evaluate portfolio performance
- No visual comparison
- Can't identify best strategies

**Proposed Solution**:
```typescript
// app/(dashboard)/compare/page.tsx
export default async function ComparePage() {
  const portfolios = await getUserPortfolios()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Portfolios</h1>

      <PortfolioSelector
        portfolios={portfolios}
        onSelect={(ids) => setSelectedPortfolios(ids)}
      />

      <div className="grid gap-8 mt-8">
        {/* Summary comparison table */}
        <ComparisonTable portfolios={selectedPortfolios} />

        {/* Performance chart overlay */}
        <PerformanceComparisonChart portfolios={selectedPortfolios} />

        {/* Allocation breakdown */}
        <AllocationComparison portfolios={selectedPortfolios} />
      </div>
    </div>
  )
}
```

**User Value**:
- ✅ Identify best performers
- ✅ Rebalancing insights
- ✅ Strategy evaluation

---

### 13. Watchlist Feature
**Impact**: 🟢 Medium | **Effort**: S (3 days)

**Current State**: No way to track investments you don't own.

**Problem**:
- Can't monitor potential investments
- No price alerts for watchlist
- Missing competitive feature

**Proposed Solution**:
```prisma
model Watchlist {
  id        String          @id @default(cuid())
  userId    String
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  items     WatchlistItem[]
  createdAt DateTime        @default(now())

  @@index([userId])
}

model WatchlistItem {
  id               String    @id @default(cuid())
  watchlistId      String
  watchlist        Watchlist @relation(fields: [watchlistId], references: [id], onDelete: Cascade)
  ticker           String
  assetType        AssetType
  targetPrice      Decimal?  @db.Decimal(20, 8)
  notes            String?
  addedAt          DateTime  @default(now())
  currentPrice     Decimal?  @db.Decimal(20, 8)
  priceUpdatedAt   DateTime?

  @@unique([watchlistId, ticker])
  @@index([watchlistId])
}
```

**User Value**:
- ✅ Research potential investments
- ✅ Price tracking without purchasing
- ✅ Better investment decisions

---

### 14. Social Features (Optional)
**Impact**: 🟢 Medium | **Effort**: XL (2 months)

**Current State**: Private, single-user experience.

**Problem**:
- No community or collaboration
- Can't share insights
- Missing viral growth potential

**Proposed Features** (Optional):
- Public portfolio profiles (opt-in)
- Follow other investors
- Portfolio leaderboards
- Social sharing buttons
- Investment discussions/comments

**User Value**:
- ✅ Community engagement
- ✅ Learn from others
- ✅ Viral growth mechanism

**Risk**: Privacy concerns, regulatory compliance for financial advice

---

## Q3: Low Priority (Schedule Later)

### 15. Dark Mode
**Impact**: 🟢 Medium | **Effort**: XS (1 day)

**Solution**: shadcn/ui already supports dark mode, just need toggle.

---

### 16. Currency Management Settings
**Impact**: 🟢 Medium | **Effort**: XS (2 days)

**Solution**: User preferences for default currency, currency display format.

---

### 17. Portfolio Notes & Annotations
**Impact**: 🟢 Medium | **Effort**: XS (2 days)

**Solution**: Rich text editor for portfolio/investment notes.

---

### 18. Investment News Feed
**Impact**: 🟢 Medium | **Effort**: M (1 week)

**Solution**: Integrate News API to show relevant news per ticker.

---

### 19. Portfolio Rebalancing Calculator
**Impact**: 🟢 Medium | **Effort**: M (1 week)

**Solution**: Suggest trades to achieve target allocation percentages.

---

### 20. Multi-Language Support (i18n)
**Impact**: ⚪ Low | **Effort**: L (3 weeks)

**Solution**: next-intl for internationalization.

---

## Q4: Avoid for Now

### 21. Native Mobile Apps
**Impact**: ⚪ Low | **Effort**: XL (3 months)

**Rationale**: PWA with responsive design sufficient for MVP.

---

### 22. Options & Derivatives Tracking
**Impact**: ⚪ Low | **Effort**: XL (2 months)

**Rationale**: Complex feature, small user segment.

---

### 23. AI Portfolio Recommendations
**Impact**: ⚪ Low | **Effort**: XL (2+ months)

**Rationale**: Regulatory risk, high complexity, requires significant data.

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Quick Wins + Critical UX**

- ✅ Week 1: Dashboard overview, price refresh, mobile responsive
- ✅ Week 2: Search/filter, accessibility, bulk refresh
- ✅ Week 3: CSV import, performance charts
- ✅ Week 4: Onboarding flow

**Impact**: Core user experience solid, ready for beta users

---

### Phase 2: Engagement (Weeks 5-8)
**Strategic Features**

- ✅ Week 5-6: Notification system (email + in-app)
- ✅ Week 7: Portfolio comparison, watchlist
- ✅ Week 8: Advanced reporting & export

**Impact**: Power user features, increased engagement

---

### Phase 3: Polish (Weeks 9-12)
**Low Priority & Nice-to-Haves**

- ✅ Week 9: Dark mode, currency settings, notes
- ✅ Week 10: News feed integration
- ✅ Week 11: Rebalancing calculator
- ✅ Week 12: Bug fixes, performance optimization

**Impact**: Professional polish, competitive feature parity

---

## Success Metrics

### User Activation
- **Goal**: 80% of signups create first portfolio within 24 hours
- **Metric**: Onboarding completion rate
- **Target**: >75% complete onboarding checklist

### User Engagement
- **Goal**: Users check portfolio 3x per week
- **Metric**: Weekly active users (WAU) / Monthly active users (MAU)
- **Target**: WAU/MAU > 60%

### Feature Adoption
- **Goal**: Users leverage key features
- **Metrics**:
  - CSV import usage: >40% of users
  - Price refresh: >90% of users
  - Performance charts: >70% of users
  - Notifications enabled: >50% of users

### User Satisfaction
- **Goal**: High NPS and low abandonment
- **Metrics**:
  - Net Promoter Score (NPS): >40
  - Churn rate: <10% monthly
  - App Store rating: >4.5 stars

---

---

## Phase 4: Competitive Parity (NEW - Based on Competitive Analysis)

### Competitive Feature Gaps Identified

After comprehensive analysis of leading portfolio trackers (Empower, Sharesight, Seeking Alpha, Stock Rover, Wealthfront), **31 missing features** were identified across 7 categories. See `competitive-feature-analysis.md` for full details.

**Critical Findings**:
- **100% of competitors** have asset allocation visualization
- **90%+ of competitors** have benchmarking and sector exposure
- **70%+ of competitors** have goal tracking and retirement planning

### High-Priority Competitive Features

#### 24. Asset Allocation Pie Chart 🔴 CRITICAL
**Impact**: 🔴 Critical | **Effort**: S (3 days) | **Found In**: 100% of competitors

**Problem**: No visual breakdown of portfolio composition

**Solution**:
```typescript
// components/portfolio/AssetAllocationChart.tsx
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export function AssetAllocationChart({ portfolioId }: { portfolioId: string }) {
  const allocation = useAssetAllocation(portfolioId)

  const COLORS = {
    STOCK: 'hsl(var(--chart-1))',
    ETF: 'hsl(var(--chart-2))',
    CRYPTO: 'hsl(var(--chart-3))',
    MUTUAL_FUND: 'hsl(var(--chart-4))',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.assetType]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
```

**User Value**: Instant understanding of portfolio diversification
**Competitive Gap**: Universal feature - must-have for parity

---

#### 25. Sector Exposure Breakdown 🔴 CRITICAL
**Impact**: 🔴 Critical | **Effort**: S (5 days) | **Found In**: 90%+ of competitors

**Problem**: No visibility into sector concentration risk

**Solution**:
- Add `sector` field to Investment model
- Integrate Alpha Vantage `OVERVIEW` endpoint for sector data
- Create sector breakdown bar chart
- Implement GICS sector classification

**User Value**: Identify concentration risk, diversification opportunities
**Competitive Gap**: Critical for serious investors

---

#### 26. Benchmark Comparison (S&P 500, NASDAQ) 🔴 CRITICAL
**Impact**: 🔴 Critical | **Effort**: M (6 days) | **Found In**: 90%+ of competitors

**Problem**: Users can't answer "Am I beating the market?"

**Solution**:
```prisma
model PortfolioBenchmark {
  id          String
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  benchmarkTicker String  // e.g., "SPY", "QQQ"
  benchmarkName   String  // e.g., "S&P 500", "NASDAQ 100"
  weight          Decimal @default(1.0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([portfolioId, benchmarkTicker])
}
```

**Implementation**:
- Fetch benchmark historical prices (Alpha Vantage)
- Calculate benchmark returns over same period
- Comparison chart: Portfolio vs Benchmark(s)
- Display alpha (excess return vs benchmark)

**User Value**: Answer #1 investor question - "Am I beating the market?"
**Competitive Gap**: Essential feature - 90%+ have it

---

#### 27. Retirement Planning Calculator 🟡 HIGH
**Impact**: 🟡 High | **Effort**: L (10 days) | **Found In**: 70%+ of competitors

**Problem**: No goal tracking or retirement planning

**Solution**:
```prisma
enum GoalType {
  RETIREMENT
  HOME_PURCHASE
  EDUCATION
  EMERGENCY_FUND
  FINANCIAL_INDEPENDENCE
  CUSTOM
}

model Goal {
  id          String
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  type        GoalType
  targetAmount Decimal
  targetDate   DateTime
  currentAmount Decimal @default(0)

  // Retirement-specific
  monthlyContribution Decimal?
  expectedReturnRate  Decimal?
  inflationRate       Decimal @default(0.03)

  linkedPortfolioId String?
  linkedPortfolio   Portfolio? @relation(fields: [linkedPortfolioId], references: [id])

  status       GoalStatus @default(ON_TRACK)
  progressPercentage Decimal @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum GoalStatus {
  ON_TRACK
  OFF_TRACK
  AT_RISK
  ACHIEVED
}
```

**User Value**: Retirement planning is the #1 use case for portfolio tracking
**Competitive Gap**: Found in Empower, Betterment, Wealthfront, Schwab

---

#### 28. Portfolio Risk Score 🟡 HIGH
**Impact**: 🟡 High | **Effort**: S (4 days) | **Found In**: 60%+ of competitors

**Problem**: No simplified risk communication for mainstream users

**Solution**:
- Calculate based on: asset allocation, volatility, concentration, beta
- Weighted scoring algorithm (1-10 scale or Conservative/Moderate/Aggressive)
- Risk score gauge visualization
- Educational content about risk levels

**User Value**: Simplified risk understanding for non-technical users
**Competitive Gap**: Standard in robo-advisors (Betterment, Wealthfront, Vanguard)

---

#### 29. Rebalancing Recommendations 🟡 HIGH
**Impact**: 🟡 High | **Effort**: L (8 days) | **Found In**: 60%+ of competitors

**Problem**: No guidance on maintaining target allocation

**Solution**:
```prisma
model TargetAllocation {
  id          String
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  allocationType AllocationDimension
  targetKey      String
  targetPercent  Decimal

  rebalanceThreshold Decimal @default(5.0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([portfolioId, allocationType, targetKey])
}

enum AllocationDimension {
  ASSET_TYPE
  SECTOR
  TICKER
}

model RebalancingRecommendation {
  id          String
  portfolioId String
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)

  ticker      String
  action      RebalanceAction
  shares      Decimal
  currentPercent Decimal
  targetPercent  Decimal
  drift          Decimal

  estimatedCost Decimal
  taxImpact     Decimal?

  createdAt DateTime @default(now())

  @@index([portfolioId, createdAt])
}

enum RebalanceAction {
  BUY
  SELL
  HOLD
}
```

**User Value**: Maintain desired risk/return profile automatically
**Competitive Gap**: Professional feature with broad appeal

---

#### 30. Automated Price Alerts 🟡 HIGH
**Impact**: 🟡 High | **Effort**: M (6 days) | **Found In**: 50%+ of competitors

**Problem**: No notifications when investments hit price targets

**Solution**:
```prisma
model PriceAlert {
  id           String
  userId       String
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  investmentId String?
  investment   Investment? @relation(fields: [investmentId], references: [id], onDelete: Cascade)
  ticker       String

  alertType    PriceAlertType
  targetPrice  Decimal?
  percentChange Decimal?

  triggered    Boolean @default(false)
  triggeredAt  DateTime?

  notificationEmail Boolean @default(true)
  notificationInApp Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum PriceAlertType {
  PRICE_ABOVE
  PRICE_BELOW
  PERCENT_GAIN
  PERCENT_LOSS
}
```

**Implementation**:
- Background job checks prices against alerts
- Trigger notifications (email + in-app) when hit
- Mark alerts as triggered, allow reset

**User Value**: Stay informed without constant monitoring
**Competitive Gap**: Found in Seeking Alpha, Yahoo Finance, Robinhood

---

#### 31. Performance Attribution Analysis 🟢 MEDIUM
**Impact**: 🟢 Medium | **Effort**: M (7 days) | **Found In**: 40%+ (premium features)

**Problem**: Don't know which holdings drive returns

**Solution**:
- Calculate individual contribution: `(holding_return × holding_weight)`
- Aggregate by: ticker, sector, asset type, country
- Contribution waterfall chart
- Highlight best/worst contributors

**User Value**: Professional-grade portfolio analysis
**Competitive Gap**: Found in Sharesight Expert, Stock Rover, Morningstar

---

### Phase 4 Roadmap: Competitive Parity (4-5 Weeks)

**Week 1-2: Critical Visualizations (MUST-HAVE)**
- [ ] Asset allocation pie chart (3 days)
- [ ] Sector exposure breakdown (5 days)
- [ ] Market cap breakdown (2 days)

**Week 2-3: Benchmarking (CRITICAL)**
- [ ] Benchmark comparison (S&P 500, NASDAQ) (6 days)
- [ ] Portfolio risk score (4 days)

**Week 3-4: Automation & Alerts (HIGH)**
- [ ] Rebalancing recommendations (8 days)
- [ ] Automated price alerts (6 days)

**Week 4-5: Goal Setting (HIGH)**
- [ ] Retirement planning calculator (10 days)
- [ ] Goal tracking system (6 days)

**Total Effort**: ~50 days (~2.5 months with 1-2 developers)

### Success Metrics (Competitive Parity)

**Feature Parity Score**: Percentage of "must-have" features vs top 3 competitors
- **Target**: >85% feature parity with Empower, Sharesight, Seeking Alpha
- **Current**: ~40% (basic tracking only)
- **After Phase 4**: ~85% (competitive parity achieved)

**User Satisfaction**:
- **Goal**: Match or exceed competitor NPS scores
- **Benchmark**: Empower NPS ~45, Sharesight NPS ~50
- **Target**: NPS >45 after Phase 4

**Competitive Positioning**:
- **Unique Strengths**: Tax-first design, multi-currency, goal-driven
- **Table Stakes Achieved**: Asset allocation, benchmarking, sector analysis, risk scores
- **Premium Differentiators**: Tax-loss harvesting, rebalancing, performance attribution

---

## Conclusion

This prioritization matrix now identifies **31 total UX/feature opportunities**:
- **Original 23 features** (Phases 1-3)
- **8 critical competitive features** (Phase 4)

**Expanded Strategic Focus**:

1. **Onboarding** - Get users to value fast
2. **Mobile** - Match user behavior (60% mobile traffic)
3. **Automation** - Reduce manual effort (bulk refresh, CSV import)
4. **Visualization** - Help users understand performance
5. **Accessibility** - Inclusive design for all users
6. **🆕 Competitive Parity** - Asset allocation, benchmarking, goal tracking (CRITICAL)
7. **🆕 Advanced Analytics** - Risk scores, rebalancing, performance attribution (DIFFERENTIATOR)

**Revised Priority Order**:
1. **Phase 1: Quick Wins** (Weeks 1-4) - Foundation UX
2. **Phase 2: Strategic Initiatives** (Weeks 5-8) - Engagement features
3. **🆕 Phase 4: Competitive Parity** (Weeks 9-13) - Asset allocation, benchmarking, goals
4. **Phase 3: Polish** (Weeks 14-17) - Nice-to-haves

**Total Timeline**: ~17 weeks (~4 months) for comprehensive competitive parity

**Next Steps**:
1. Approve updated prioritization with Phase 4
2. Begin Phase 1 implementation (Quick Wins)
3. Run competitive analysis every 6 months
4. Iterate based on user feedback and competitor feature releases
5. Consider Phase 5 (Advanced Analytics) for premium tier differentiation

**See Also**:
- `competitive-feature-analysis.md` - Full 31-feature competitive analysis
- `MASTER_PLAN_V2.md` - Integrated 6-phase roadmap including competitive features

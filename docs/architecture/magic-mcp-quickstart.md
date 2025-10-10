# Magic MCP Quick Start Guide

**For Track Your Stack Developers**

Last Updated: 2025-10-10

## What is Magic MCP?

Magic MCP is an AI-powered UI component generator that creates production-ready React/TypeScript components from natural language descriptions. It uses patterns from 21st.dev library and integrates seamlessly with our existing stack.

**Benefits for Track Your Stack:**
- ⚡ 40-60% faster development for complex UI components
- ✅ Production-ready, accessible components out of the box
- 🎨 Tailwind CSS styling matching our design system
- 🧪 Reduced boilerplate and repetitive coding

## Prerequisites

Before using Magic MCP, ensure you have:
- ✅ Claude Code CLI installed and configured
- ✅ Track Your Stack project running locally (`pnpm dev`)
- ✅ Familiarity with our component structure (`components/ui/`, `components/portfolio/`, `components/investment/`)
- ✅ Read the [UI Component Selection Guide](./ui-component-selection-guide.md)

## Installation & Setup

Magic MCP is already available through Claude Code CLI. No additional installation needed.

**Verify it's working:**

```bash
# In Claude Code conversation
/ui --help
```

You should see Magic MCP command options.

## Your First Magic Component

Let's create a simple searchable currency selector - a common need in financial apps.

### Step 1: Describe What You Need

```
/ui create searchable currency selector with:
- Dropdown that filters as user types
- Display format: "USD - United States Dollar"
- Support for 20 major currencies
- Show currency flag icons
- Default to USD
```

### Step 2: Review Generated Code

Magic MCP will generate TypeScript React component code. Review it before accepting.

**Key things to check:**
- ✅ TypeScript types are correct
- ✅ Tailwind classes use our theme variables
- ✅ Component name follows our conventions
- ✅ Props interface is well-defined

### Step 3: Save to Correct Location

```bash
# Save to appropriate directory
components/investment/currency-selector.tsx
```

**Naming convention:** Use kebab-case for files, PascalCase for component names.

### Step 4: Customize for Design System

Adjust generated code to match shadcn/ui theme:

```tsx
// ❌ Before (hardcoded colors)
<div className="bg-blue-500 text-white">

// ✅ After (theme variables)
<div className="bg-primary text-primary-foreground">
```

### Step 5: Test the Component

Create a test file:

```tsx
// __tests__/currency-selector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CurrencySelector } from '@/components/investment/currency-selector'

describe('CurrencySelector', () => {
  it('should filter currencies when typing', () => {
    render(<CurrencySelector onSelect={jest.fn()} />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'eur' } })

    expect(screen.getByText('EUR - Euro')).toBeInTheDocument()
    expect(screen.queryByText('USD - United States Dollar')).not.toBeInTheDocument()
  })
})
```

### Step 6: Use in Your Feature

```tsx
// app/(dashboard)/portfolios/new/page.tsx
import { CurrencySelector } from '@/components/investment/currency-selector'

export default function NewPortfolioPage() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD')

  return (
    <form>
      <Label>Base Currency</Label>
      <CurrencySelector
        value={selectedCurrency}
        onSelect={setSelectedCurrency}
      />
    </form>
  )
}
```

## Common Use Cases

### Use Case 1: Investment Data Table

**When:** You need to display investments with sorting, filtering, pagination.

**Command:**

```
/ui create investment data table with:
- Columns: ticker, asset type, quantity, avg cost, current price, current value, gain/loss, gain/loss %
- Sorting on all numeric columns
- Filtering by asset type (Stock, ETF, Crypto, Mutual Fund)
- Search by ticker symbol
- Pagination (20 items per page)
- Row click navigation to detail page
- Actions dropdown (Edit, Delete) in last column
- Mobile responsive with horizontal scroll
```

**Save to:** `components/investment/investment-data-table.tsx`

**Integration:**

```tsx
// app/(dashboard)/portfolios/[id]/page.tsx
import { InvestmentDataTable } from '@/components/investment/investment-data-table'

export default async function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const investments = await getPortfolioInvestments(params.id)

  return (
    <div className="container mx-auto py-8">
      <h1>Portfolio Investments</h1>
      <InvestmentDataTable
        data={investments}
        onRowClick={(investment) => router.push(`/investments/${investment.id}`)}
      />
    </div>
  )
}
```

### Use Case 2: Portfolio Performance Chart

**When:** You need line chart showing portfolio value over time.

**Command:**

```
/ui create portfolio performance line chart with:
- X-axis: Date range
- Y-axis: Portfolio value
- Multiple portfolio lines (up to 5 portfolios)
- Date range selector buttons (1W, 1M, 3M, 6M, 1Y, All)
- Interactive tooltips showing exact values on hover
- Legend with portfolio names and colors
- Responsive design (stack vertically on mobile)
- Export to PNG button
```

**Save to:** `components/portfolio/portfolio-performance-chart.tsx`

**Integration:**

```tsx
// app/(dashboard)/dashboard/page.tsx
import { PortfolioPerformanceChart } from '@/components/portfolio/portfolio-performance-chart'

export default async function DashboardPage() {
  const portfolios = await getUserPortfolios()
  const performanceData = await getPortfolioPerformanceHistory(portfolios)

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioPerformanceChart data={performanceData} />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Use Case 3: Multi-Step Add Investment Form

**When:** You need wizard-style form for complex data entry.

**Command:**

```
/ui create multi-step investment form with 4 steps:

Step 1: Asset Type Selection
- Large cards with icons: Stock, ETF, Cryptocurrency, Mutual Fund, Other
- Description text under each option
- Radio button selection

Step 2: Ticker Search
- Searchable autocomplete input
- Debounced search (300ms)
- Display results: ticker, company name, exchange
- "Can't find?" link to manual entry

Step 3: Purchase Details
- Quantity (number input, min: 0.00000001)
- Average cost per unit (currency input)
- Purchase date (date picker, max: today)
- Total cost calculation (read-only)

Step 4: Review and Confirm
- Summary of all entered data
- Edit buttons next to each section
- Back and Submit buttons

Include:
- Progress indicator at top
- Form validation at each step
- Can't proceed without completing required fields
- Loading state during submission
- Success/error toast messages
```

**Save to:** `components/investment/add-investment-wizard.tsx`

**Integration:**

```tsx
// app/(dashboard)/portfolios/[id]/add-investment/page.tsx
import { AddInvestmentWizard } from '@/components/investment/add-investment-wizard'
import { createInvestment } from '@/lib/actions/investment'

export default function AddInvestmentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1>Add Investment</h1>
      <AddInvestmentWizard
        portfolioId={params.id}
        onSubmit={async (data) => {
          await createInvestment(data)
          router.push(`/portfolios/${params.id}`)
        }}
        onCancel={() => router.back()}
      />
    </div>
  )
}
```

## Component Integration Checklist

When adding a Magic-generated component to the project:

### Before Generation
- [ ] Checked [UI Component Selection Guide](./ui-component-selection-guide.md) to confirm Magic MCP is right choice
- [ ] Identified correct save location (`components/portfolio/`, `components/investment/`, etc.)
- [ ] Reviewed similar components for naming consistency
- [ ] Prepared clear, detailed description for Magic command

### During Generation
- [ ] Reviewed generated TypeScript types
- [ ] Checked Tailwind classes for theme compatibility
- [ ] Verified component name follows PascalCase convention
- [ ] Ensured props interface is well-defined

### After Generation
- [ ] Saved to correct directory with kebab-case filename
- [ ] Replaced hardcoded colors with theme variables
- [ ] Added JSDoc comments for complex logic
- [ ] Created test file in `__tests__/` directory
- [ ] Wrote unit tests for key interactions
- [ ] Integrated into feature/page
- [ ] Tested in development (`pnpm dev`)
- [ ] Verified mobile responsiveness
- [ ] Checked accessibility (keyboard nav, screen readers)

### Before Committing
- [ ] Run linting: `pnpm lint`
- [ ] Run type checking: `pnpm typecheck`
- [ ] Run tests: `pnpm test`
- [ ] Format code: `pnpm format`
- [ ] Verify no console errors in browser
- [ ] Test all interactive features work
- [ ] Commit on feature branch (never main)

## Code Conventions

### File Organization

```
components/
├── investment/
│   ├── investment-data-table.tsx      # Magic-generated
│   ├── investment-form.tsx            # Custom with shadcn
│   ├── currency-selector.tsx          # Magic-generated
│   └── __tests__/
│       ├── investment-data-table.test.tsx
│       └── currency-selector.test.tsx
├── portfolio/
│   ├── portfolio-performance-chart.tsx # Magic-generated
│   ├── portfolio-card.tsx              # Custom with shadcn
│   └── __tests__/
│       └── portfolio-performance-chart.test.tsx
└── ui/
    └── [shadcn/ui components]
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Component File | kebab-case | `investment-data-table.tsx` |
| Component Name | PascalCase | `InvestmentDataTable` |
| Props Interface | PascalCase + Props | `InvestmentDataTableProps` |
| Test File | component.test.tsx | `investment-data-table.test.tsx` |
| Utility Function | camelCase | `formatCurrency` |

### Import Order

```tsx
// 1. React and Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { motion } from 'framer-motion'

// 3. Local components
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Local utilities
import { formatCurrency } from '@/lib/utils'
import { calculateGainLoss } from '@/lib/calculations/investment'

// 5. Types
import type { Investment, Portfolio } from '@prisma/client'
```

### Styling Best Practices

```tsx
// ✅ GOOD: Use theme variables
<div className="bg-primary text-primary-foreground">
<div className="border-border text-foreground">

// ❌ BAD: Hardcoded colors
<div className="bg-blue-500 text-white">
<div className="border-gray-300 text-gray-900">

// ✅ GOOD: Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ GOOD: Semantic spacing
<div className="space-y-4">
  <div className="flex items-center gap-2">

// ✅ GOOD: Consistent hover states
<Button className="hover:bg-primary/90">
```

### TypeScript Best Practices

```tsx
// ✅ GOOD: Explicit prop types
interface InvestmentDataTableProps {
  investments: Investment[]
  onRowClick: (investment: Investment) => void
  isLoading?: boolean
}

// ✅ GOOD: Infer return types
export function InvestmentDataTable({
  investments,
  onRowClick,
  isLoading = false
}: InvestmentDataTableProps) {
  // TypeScript infers return type as JSX.Element
  return <div>...</div>
}

// ✅ GOOD: Use Prisma types
import type { Portfolio, Investment } from '@prisma/client'

// ✅ GOOD: Extend Prisma types when needed
type InvestmentWithGainLoss = Investment & {
  gainLoss: number
  gainLossPercent: number
}
```

## Testing Strategy

### Unit Tests for Magic Components

Test the generated component's key interactions:

```tsx
// __tests__/investment-data-table.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { InvestmentDataTable } from '@/components/investment/investment-data-table'
import { mockInvestments } from '@/test/fixtures'

describe('InvestmentDataTable', () => {
  it('should render all investments', () => {
    render(<InvestmentDataTable investments={mockInvestments} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('GOOGL')).toBeInTheDocument()
  })

  it('should sort by gain/loss when column clicked', () => {
    render(<InvestmentDataTable investments={mockInvestments} />)

    const gainLossHeader = screen.getByText('Gain/Loss')
    fireEvent.click(gainLossHeader)

    const rows = screen.getAllByRole('row')
    // First investment should be highest gain
    expect(rows[1]).toHaveTextContent('AAPL')
  })

  it('should filter by asset type', () => {
    render(<InvestmentDataTable investments={mockInvestments} />)

    const filterButton = screen.getByText('Asset Type')
    fireEvent.click(filterButton)

    const stockOption = screen.getByText('Stock')
    fireEvent.click(stockOption)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.queryByText('BTC')).not.toBeInTheDocument()
  })

  it('should call onRowClick when row clicked', () => {
    const onRowClick = jest.fn()
    render(<InvestmentDataTable investments={mockInvestments} onRowClick={onRowClick} />)

    const firstRow = screen.getByText('AAPL').closest('tr')
    fireEvent.click(firstRow!)

    expect(onRowClick).toHaveBeenCalledWith(mockInvestments[0])
  })
})
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<InvestmentDataTable investments={mockInvestments} />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Troubleshooting

### Issue: Generated Component Doesn't Match Design System

**Symptom:** Colors, spacing, or typography look different from rest of app.

**Solution:**

1. Open `tailwind.config.ts` and note theme variables
2. Replace hardcoded Tailwind classes with theme variables:

```tsx
// Find and replace in generated code
bg-blue-500 → bg-primary
text-gray-700 → text-foreground
border-gray-300 → border-border
```

### Issue: TypeScript Errors in Generated Code

**Symptom:** Type errors after generating component.

**Solution:**

1. Ensure all imports are correct (`@/components/*`, `@/lib/*`)
2. Add missing type definitions:

```tsx
// Add Prisma types
import type { Investment } from '@prisma/client'

// Or extend if needed
type InvestmentRow = Investment & {
  currentValue: number
  gainLoss: number
}
```

3. Run type checking: `pnpm typecheck`

### Issue: Component Too Large / Over-Engineered

**Symptom:** Generated component has features you don't need.

**Solution:**

1. Simplify your Magic command - be more specific
2. Remove unnecessary features from generated code
3. Or use shadcn/ui if component is actually simple

### Issue: Magic Command Doesn't Generate What You Expected

**Symptom:** Generated component doesn't match your description.

**Solution:**

1. Be more specific in your command
2. Include examples or references
3. Break complex components into smaller pieces
4. Iterate: generate → refine command → regenerate

## Advanced Patterns

### Pattern 1: Wrapping Magic Component with Business Logic

```tsx
// components/investment/investment-table-wrapper.tsx
import { InvestmentDataTable } from './investment-data-table' // Magic-generated
import { useCurrencyConversion } from '@/lib/hooks/use-currency-conversion'
import { useRealTimePrices } from '@/lib/hooks/use-real-time-prices'

export function InvestmentTableWrapper({ portfolioId }: { portfolioId: string }) {
  const { investments, isLoading } = usePortfolioInvestments(portfolioId)
  const { convertedInvestments } = useCurrencyConversion(investments, 'USD')
  const { pricesUpdated } = useRealTimePrices(convertedInvestments)

  if (isLoading) return <LoadingSpinner />

  return <InvestmentDataTable investments={pricesUpdated} />
}
```

### Pattern 2: Composing Multiple Magic Components

```tsx
// app/(dashboard)/portfolios/[id]/page.tsx
import { PortfolioPerformanceChart } from '@/components/portfolio/portfolio-performance-chart'
import { InvestmentDataTable } from '@/components/investment/investment-data-table'
import { PortfolioAllocationChart } from '@/components/portfolio/portfolio-allocation-chart'

export default async function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const portfolio = await getPortfolioWithInvestments(params.id)

  return (
    <div className="container mx-auto space-y-8">
      {/* Magic component #1 */}
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioPerformanceChart data={portfolio.history} />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Magic component #2 */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioAllocationChart investments={portfolio.investments} />
          </CardContent>
        </Card>

        {/* Custom shadcn component */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioSummary portfolio={portfolio} />
          </CardContent>
        </Card>
      </div>

      {/* Magic component #3 */}
      <InvestmentDataTable investments={portfolio.investments} />
    </div>
  )
}
```

### Pattern 3: Progressive Enhancement

Start with simple Magic component, enhance later:

```tsx
// Phase 1: Generate basic table
/ui create basic investment table with ticker, quantity, value columns

// Phase 2: Add sorting
// Manually add sorting logic to generated component

// Phase 3: Regenerate with advanced features
/ui create investment table with sorting, filtering, pagination

// Compare and merge best parts of both versions
```

## Performance Optimization

### When Magic Components Get Slow

**Data Tables with 100+ rows:**

```tsx
// Add virtualization
import { useVirtualizer } from '@tanstack/react-virtual'

export function InvestmentDataTable({ investments }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: investments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // row height
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {/* Render only visible rows */}
    </div>
  )
}
```

**Charts with Real-Time Updates:**

```tsx
// Debounce updates
import { useDebouncedCallback } from 'use-debounce'

const debouncedUpdate = useDebouncedCallback((newData) => {
  setChartData(newData)
}, 500)
```

**Expensive Calculations:**

```tsx
import { useMemo } from 'react'

export function PortfolioChart({ investments }: Props) {
  const chartData = useMemo(() => {
    return investments.map(/* expensive transformation */)
  }, [investments])

  return <Chart data={chartData} />
}
```

## Best Practices Summary

### ✅ DO

- Start with clear, detailed Magic commands
- Review generated code before accepting
- Customize to match design system (theme variables)
- Write tests for key interactions
- Use TypeScript strictly
- Follow component organization conventions
- Commit on feature branches
- Document complex business logic

### ❌ DON'T

- Accept generated code blindly without review
- Use hardcoded colors (always use theme variables)
- Skip testing Magic components
- Mix Magic and shadcn for the same use case
- Generate components you don't actually need
- Commit directly to main branch
- Leave generated code uncommented

## Getting Help

**Questions?**
- Check [UI Component Selection Guide](./ui-component-selection-guide.md) first
- Review [Magic MCP Command Library](./magic-commands.md) for examples
- Ask in project Slack/Discord channel
- Create an issue on GitHub repo

**Issues with Magic MCP?**
- Report bugs at https://github.com/anthropics/claude-code/issues
- Tag with `mcp:magic` label

---

**Quick Links:**
- [UI Component Selection Guide](./ui-component-selection-guide.md)
- [Magic Command Library](./magic-commands.md)
- [Component Templates](../../components/__templates/)
- [Testing Examples](../../__tests__/__examples/)

**Last Updated:** 2025-10-10

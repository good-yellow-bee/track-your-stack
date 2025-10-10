# Component Templates

This directory contains starter templates for common component patterns in Track Your Stack.

## Available Templates

### 1. Data Table Wrapper Template

**File:** `data-table-wrapper.template.tsx`

**Use when:** You need to add business logic around a Magic-generated data table.

**Features:**

- Currency conversion wrapper
- Real-time price updates
- Custom data transformations
- Loading states
- Default row click handlers

**How to use:**

```bash
# 1. Generate base table with Magic MCP
/ui create investment data table with sorting and filtering

# 2. Copy template
cp components/__templates__/data-table-wrapper.template.tsx \
   components/investment/investment-table-wrapper.tsx

# 3. Update template:
#    - Replace import paths
#    - Add your business logic
#    - Customize data transformations

# 4. Use in your page
import { InvestmentTableWrapper } from '@/components/investment/investment-table-wrapper'
```

### 2. Chart Wrapper Template

**File:** `chart-wrapper.template.tsx`

**Use when:** You need to add controls and data processing around a Magic-generated chart.

**Features:**

- Date range selector (1W, 1M, 3M, 6M, 1Y, All)
- Chart type switcher (line, bar, pie, area)
- Data filtering and transformation
- Currency conversion support
- Responsive controls

**How to use:**

```bash
# 1. Generate base chart with Magic MCP
/ui create portfolio performance line chart

# 2. Copy template
cp components/__templates__/chart-wrapper.template.tsx \
   components/portfolio/portfolio-chart-wrapper.tsx

# 3. Update template:
#    - Replace import paths
#    - Add data transformation logic
#    - Customize controls as needed

# 4. Use in your page
import { PortfolioChartWrapper } from '@/components/portfolio/portfolio-chart-wrapper'
```

### 3. Business Component Template

**File:** `business-component.template.tsx`

**Use when:** Creating custom components with business logic using shadcn/ui primitives.

**Features:**

- shadcn/ui Card structure
- Metrics display layout
- Progress indicators
- Action buttons with loading states
- Conditional styling patterns

**How to use:**

```bash
# 1. Copy template
cp components/__templates__/business-component.template.tsx \
   components/portfolio/portfolio-summary-card.tsx

# 2. Update template:
#    - Replace component name
#    - Add business calculations
#    - Customize layout and metrics
#    - Add event handlers

# 3. Use in your page
import { PortfolioSummaryCard } from '@/components/portfolio/portfolio-summary-card'
```

## Template Selection Guide

| Need                             | Use Template                      | Alternative             |
| -------------------------------- | --------------------------------- | ----------------------- |
| Wrap Magic data table with logic | `data-table-wrapper.template.tsx` | -                       |
| Add controls to Magic chart      | `chart-wrapper.template.tsx`      | -                       |
| Custom business logic component  | `business-component.template.tsx` | Start from scratch      |
| Simple UI with no business logic | -                                 | Use shadcn/ui directly  |
| Complex multi-step form          | -                                 | Generate with Magic MCP |

## General Template Usage Pattern

1. **Generate or Plan**
   - For Magic components: generate base component first
   - For custom components: plan your component structure

2. **Copy Template**

   ```bash
   cp components/__templates__/[template-name].template.tsx \
      components/[category]/[your-component-name].tsx
   ```

3. **Search and Replace**
   - Component names: `YourComponent` → `ActualComponentName`
   - Import paths: Update to match your file structure
   - Type definitions: Replace `any` with actual types

4. **Implement Business Logic**
   - Follow TODO comments in template
   - Add calculations from `lib/calculations/`
   - Add custom hooks from `lib/hooks/`

5. **Test**
   - Create test file: `__tests__/[your-component-name].test.tsx`
   - Follow testing patterns in [magic-mcp-quickstart.md](../../docs/architecture/magic-mcp-quickstart.md)

6. **Integrate**
   - Import and use in your page/component
   - Verify in development: `pnpm dev`

## Customization Tips

### Styling

All templates use shadcn/ui theme variables:

```tsx
// ✅ Good: Use theme variables
className = 'bg-primary text-primary-foreground'
className = 'border-border text-foreground'

// ❌ Bad: Hardcoded colors
className = 'bg-blue-500 text-white'
className = 'border-gray-300 text-gray-900'
```

### TypeScript

Replace `any` types with proper types:

```tsx
// ❌ Template default
interface Props {
  data: any
}

// ✅ Your implementation
interface Props {
  data: Investment[]
}

// Or with Prisma types
import type { Investment, Portfolio } from '@prisma/client'

interface Props {
  data: (Investment & { portfolio: Portfolio })[]
}
```

### Business Logic

Add calculations from your lib:

```tsx
// Import calculations
import {
  calculateGainLoss,
  calculateGainLossPercent,
  calculateTotalValue,
} from '@/lib/calculations/investment'

// Use in component
const metrics = {
  totalValue: calculateTotalValue(investments),
  gainLoss: calculateGainLoss(investments),
  gainLossPercent: calculateGainLossPercent(investments),
}
```

### Responsive Design

Templates use Tailwind responsive utilities:

```tsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Conditional visibility
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## Examples

### Example 1: Investment Table with Real-Time Prices

```tsx
// components/investment/investment-table-with-prices.tsx
'use client'

import { InvestmentDataTable } from './investment-data-table' // Magic-generated
import { useRealTimePrices } from '@/lib/hooks/use-real-time-prices'

export function InvestmentTableWithPrices({ investments }: { investments: Investment[] }) {
  // Use custom hook for real-time updates
  const { data, isLoading } = useRealTimePrices(investments)

  if (isLoading) return <LoadingSkeleton />

  return <InvestmentDataTable data={data} />
}
```

### Example 2: Portfolio Chart with Currency Conversion

```tsx
// components/portfolio/portfolio-chart-with-conversion.tsx
'use client'

import { PortfolioPerformanceChart } from './portfolio-performance-chart' // Magic-generated
import { useCurrencyConversion } from '@/lib/hooks/use-currency-conversion'
import { CurrencySelector } from '@/components/ui/currency-selector'

export function PortfolioChartWithConversion({ data }: { data: PerformanceData[] }) {
  const [currency, setCurrency] = useState('USD')
  const convertedData = useCurrencyConversion(data, currency)

  return (
    <div className="space-y-4">
      <CurrencySelector value={currency} onChange={setCurrency} />
      <PortfolioPerformanceChart data={convertedData} />
    </div>
  )
}
```

### Example 3: Portfolio Summary Card with Calculations

```tsx
// components/portfolio/portfolio-summary-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { calculatePortfolioMetrics } from '@/lib/calculations/portfolio'

export function PortfolioSummaryCard({ portfolio }: { portfolio: Portfolio }) {
  const metrics = calculatePortfolioMetrics(portfolio)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{portfolio.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <MetricRow
            label="Total Value"
            value={formatCurrency(metrics.totalValue, portfolio.baseCurrency)}
          />
          <MetricRow
            label="Gain/Loss"
            value={formatCurrency(metrics.gainLoss, portfolio.baseCurrency)}
            isPositive={metrics.gainLoss >= 0}
          />
          <MetricRow
            label="Return"
            value={formatPercent(metrics.returnPercent)}
            isPositive={metrics.returnPercent >= 0}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricRow({
  label,
  value,
  isPositive,
}: {
  label: string
  value: string
  isPositive?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-semibold',
          isPositive !== undefined && (isPositive ? 'text-green-600' : 'text-red-600')
        )}
      >
        {value}
      </span>
    </div>
  )
}
```

## Testing Templates

Create tests for your template-based components:

```tsx
// __tests__/investment-table-wrapper.test.tsx
import { render, screen } from '@testing-library/react'
import { InvestmentTableWrapper } from '@/components/investment/investment-table-wrapper'
import { mockInvestments } from '@/test/fixtures'

describe('InvestmentTableWrapper', () => {
  it('should render table with investments', () => {
    render(<InvestmentTableWrapper data={mockInvestments} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(<InvestmentTableWrapper data={mockInvestments} />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
```

## Next Steps

After using templates:

1. **Review Generated Code**
   - Ensure all TODOs are addressed
   - Remove unused imports and code
   - Add JSDoc comments

2. **Write Tests**
   - Unit tests for business logic
   - Component tests for interactions
   - Accessibility tests

3. **Update Documentation**
   - Add component to project docs
   - Update changelog if significant

4. **Code Review**
   - Follow [integration checklist](../../docs/architecture/magic-mcp-quickstart.md#component-integration-checklist)
   - Get feedback from team

## Questions?

- Check [Magic MCP Quick Start Guide](../../docs/architecture/magic-mcp-quickstart.md)
- Review [UI Component Selection Guide](../../docs/architecture/ui-component-selection-guide.md)
- Ask in project Slack/Discord channel

---

**Last Updated:** 2025-10-10

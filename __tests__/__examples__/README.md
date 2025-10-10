# Test Templates and Examples

This directory contains comprehensive test templates for Track Your Stack components.

## Available Templates

### 1. Data Table Test Template

**File:** `data-table.test.template.tsx`

**Use for:** Testing Magic-generated data table components with sorting, filtering, pagination.

**Covers:**
- Rendering (rows, columns, empty state, loading)
- Sorting (single column, direction toggle)
- Filtering (single select, multi-select, clear)
- Search (debounced, clear, no results)
- Pagination (navigation, page size, info)
- Row interactions (click, hover, expand)
- Actions menu (edit, delete)
- Accessibility (keyboard nav, ARIA labels)
- Export functionality

---

### 2. Chart Test Template

**File:** `chart.test.template.tsx`

**Use for:** Testing Magic-generated chart components (line, bar, pie, area).

**Covers:**
- Rendering (canvas/SVG, dimensions, empty state)
- Data visualization (points, colors, formatting)
- Legend (visibility toggle, colors)
- Tooltips (show/hide, content)
- Date range controls
- Chart type switching
- Interactions (click, zoom, pan)
- Export (PNG, CSV)
- Responsive behavior
- Accessibility
- Error handling
- Performance

---

## Using Templates

### Step 1: Copy Template

```bash
# For data table
cp __tests__/__examples__/data-table.test.template.tsx \
   __tests__/investment-data-table.test.tsx

# For chart
cp __tests__/__examples__/chart.test.template.tsx \
   __tests__/portfolio-performance-chart.test.tsx
```

### Step 2: Search and Replace

Replace placeholder names with actual component names:

```tsx
// Before
import { YourDataTable } from '@/components/path/your-data-table'

// After
import { InvestmentDataTable } from '@/components/investment/investment-data-table'
```

### Step 3: Update Test Fixtures

```tsx
// Before
import { mockInvestments } from '@/test/fixtures/investments'

// After - create your fixtures
export const mockInvestments = [
  {
    id: '1',
    ticker: 'AAPL',
    quantity: 10,
    averageCostBasis: 150,
    currentPrice: 175,
    // ... other fields
  },
  // ... more mock data
]
```

### Step 4: Customize Tests

Remove tests that don't apply and add feature-specific tests:

```tsx
// If your table doesn't have expandable rows, remove:
describe('Row Expansion', () => { ... })

// Add your custom features:
describe('Custom Feature', () => {
  it('should do something specific', () => {
    // Your test
  })
})
```

### Step 5: Run Tests

```bash
# Run single test file
pnpm test investment-data-table.test.tsx

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Test Structure Best Practices

### Organize with describe blocks

```tsx
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {})
  })

  describe('Interactions', () => {
    it('should handle click', () => {})
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {})
  })
})
```

### Use beforeEach for setup

```tsx
describe('ComponentName', () => {
  const defaultProps = { /* ... */ }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should test something', () => {
    render(<ComponentName {...defaultProps} />)
    // Test assertions
  })
})
```

### Test user interactions properly

```tsx
import { userEvent } from '@testing-library/user-event'

it('should handle typing', async () => {
  const user = userEvent.setup()
  render(<Input />)

  await user.type(screen.getByRole('textbox'), 'test')

  expect(screen.getByRole('textbox')).toHaveValue('test')
})
```

## Common Testing Patterns

### Testing Async Operations

```tsx
it('should load data', async () => {
  render(<Component />)

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})
```

### Testing Form Submission

```tsx
it('should submit form', async () => {
  const onSubmit = jest.fn()
  const user = userEvent.setup()

  render(<Form onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText('Name'), 'John')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
  })
})
```

### Testing API Calls (Mocked)

```tsx
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/investments', (req, res, ctx) => {
    return res(ctx.json(mockInvestments))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('should fetch investments', async () => {
  render(<InvestmentList />)

  await waitFor(() => {
    expect(screen.getByText('AAPL')).toBeInTheDocument()
  })
})
```

### Testing Error States

```tsx
it('should show error message', async () => {
  server.use(
    rest.get('/api/investments', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )

  render(<InvestmentList />)

  await waitFor(() => {
    expect(screen.getByText(/error loading/i)).toBeInTheDocument()
  })
})
```

### Testing Loading States

```tsx
it('should show loading spinner', () => {
  render(<Component isLoading={true} />)

  expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```tsx
it('should show content when data exists', () => {
  render(<Component data={mockData} />)

  expect(screen.getByText('Content')).toBeInTheDocument()
  expect(screen.queryByText('Empty State')).not.toBeInTheDocument()
})

it('should show empty state when no data', () => {
  render(<Component data={[]} />)

  expect(screen.getByText('Empty State')).toBeInTheDocument()
  expect(screen.queryByText('Content')).not.toBeInTheDocument()
})
```

## Accessibility Testing

### Basic Accessibility Checks

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Keyboard Navigation

```tsx
it('should support keyboard navigation', async () => {
  const user = userEvent.setup()
  render(<Component />)

  // Tab to first element
  await user.tab()
  expect(screen.getByRole('button')).toHaveFocus()

  // Press Enter
  await user.keyboard('{Enter}')
  expect(onAction).toHaveBeenCalled()
})
```

### Screen Reader Testing

```tsx
it('should have proper ARIA labels', () => {
  render(<Component />)

  const button = screen.getByRole('button', { name: 'Add Investment' })
  expect(button).toHaveAccessibleName('Add Investment')
})
```

## Test Fixtures

Create reusable test data in `/test/fixtures/`:

```tsx
// test/fixtures/investments.ts
export const mockInvestment = {
  id: 'inv-1',
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  assetType: 'STOCK',
  quantity: 10,
  averageCostBasis: 150,
  currentPrice: 175,
  currentValue: 1750,
  totalCost: 1500,
  gainLoss: 250,
  gainLossPercent: 16.67,
  purchaseCurrency: 'USD',
  portfolioId: 'port-1',
}

export const mockInvestments = [
  mockInvestment,
  {
    ...mockInvestment,
    id: 'inv-2',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    // ...
  },
  // ... more fixtures
]
```

## Mocking Utilities

### Mock Next.js Router

```tsx
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Component', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      pathname: '/test',
    })
  })

  it('should navigate', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/target')
  })
})
```

### Mock Server Actions

```tsx
import { createInvestment } from '@/lib/actions/investment'

jest.mock('@/lib/actions/investment')

describe('AddInvestmentForm', () => {
  beforeEach(() => {
    (createInvestment as jest.Mock).mockResolvedValue({ success: true })
  })

  it('should call server action on submit', async () => {
    render(<AddInvestmentForm />)
    // ... fill form and submit

    await waitFor(() => {
      expect(createInvestment).toHaveBeenCalled()
    })
  })
})
```

### Mock Prisma Client

```tsx
// test/mocks/prisma.ts
export const prismaMock = {
  investment: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  portfolio: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}))
```

## Running Tests in CI

Tests run automatically on every PR via GitHub Actions:

```yaml
# .github/workflows/ci.yml
- name: Run Tests
  run: pnpm test --coverage
```

Local test commands:

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on file changes)
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run specific file
pnpm test investment-data-table

# Run tests matching pattern
pnpm test --testNamePattern="should sort"

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Test Coverage Goals

Maintain high test coverage for critical components:

| Component Type | Target Coverage |
|----------------|-----------------|
| Data Tables | 85%+ |
| Charts | 80%+ |
| Forms | 90%+ |
| Business Logic | 95%+ |
| UI Components | 70%+ |

Check coverage report:

```bash
pnpm test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

## Troubleshooting

### Tests Timeout

```tsx
// Increase timeout for slow tests
it('should load data', async () => {
  // ...
}, 10000) // 10 second timeout
```

### Act Warnings

Wrap state updates in `act()` or use `waitFor()`:

```tsx
// ❌ Wrong
it('should update state', () => {
  render(<Component />)
  fireEvent.click(button)
  expect(screen.getByText('Updated')).toBeInTheDocument()
})

// ✅ Right
it('should update state', async () => {
  render(<Component />)
  fireEvent.click(button)
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
  })
})
```

### Element Not Found

Use `findBy` queries for elements that appear after async operations:

```tsx
// ❌ Wrong - element doesn't exist yet
expect(screen.getByText('Loaded')).toBeInTheDocument()

// ✅ Right - waits for element
expect(await screen.findByText('Loaded')).toBeInTheDocument()
```

## Additional Resources

- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest Documentation](https://vitest.dev/) (alternative to Jest)

---

**Last Updated:** 2025-10-10

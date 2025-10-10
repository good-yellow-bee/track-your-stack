# Unit Testing Guide

This guide covers unit and integration testing using Vitest and React Testing Library.

## Running Tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode (auto-rerun on changes)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

## Test Structure

Tests are organized in `__tests__/` directory:

```
__tests__/
├── unit/              # Pure function tests
│   ├── utils.test.ts
│   └── constants.test.ts
├── integration/       # API and Server Action tests
│   └── api-health.test.ts
└── utils/            # Test helpers and utilities
    └── test-helpers.ts
```

## Writing Unit Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { calculateAverage } from '@/lib/calculations'

describe('Calculations', () => {
  describe('calculateAverage', () => {
    it('should calculate average correctly', () => {
      expect(calculateAverage([10, 20, 30])).toBe(20)
    })

    it('should handle empty array', () => {
      expect(calculateAverage([])).toBe(0)
    })
  })
})
```

### Testing React Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)

    await userEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

## Test Helpers

Use `renderWithProviders` for components that need context:

```typescript
import { renderWithProviders } from '@/__tests__/utils/test-helpers'

test('should render with auth context', () => {
  renderWithProviders(<ProtectedComponent />)
  // Component has access to all providers
})
```

## Coverage Requirements

Minimum coverage thresholds:

- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 80%
- **Statements:** 80%

View coverage report: `open coverage/index.html`

## Best Practices

1. **Test behavior, not implementation** - Focus on what the function/component does, not how
2. **Keep tests isolated** - Each test should be independent
3. **Use descriptive test names** - "should calculate average correctly" not "test1"
4. **Mock external dependencies** - API calls, databases, external services
5. **Test edge cases** - Empty arrays, null values, boundary conditions
6. **Use test-driven development (TDD)** - Write tests before implementation

## Mocking

### Mock Functions

```typescript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn.mockReturnValue(42)
expect(mockFn()).toBe(42)
```

### Mock Modules

```typescript
vi.mock('@/lib/api/alphaVantage', () => ({
  getStockPrice: vi.fn().mockResolvedValue(150.25),
}))
```

### Mock Next.js Router

Already mocked in `vitest.setup.ts`:

```typescript
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}
```

## Troubleshooting

### "Cannot find module '@/...'"

Verify path aliases in `vitest.config.ts` match `tsconfig.json`

### "ReferenceError: window is not defined"

Ensure `environment: 'jsdom'` is set in `vitest.config.ts`

### Tests timing out

Increase timeout in test file:

```typescript
it('slow test', async () => {
  // Test code
}, 10000) // 10 seconds
```

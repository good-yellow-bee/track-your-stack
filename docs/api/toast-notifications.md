# Toast Notifications API

## Overview

Track Your Stack uses **Sonner** (via shadcn/ui) for user feedback notifications. This provides accessible, themeable toast messages for all user interactions across the application.

## Architecture

### Component Structure

```
app/layout.tsx                 # Global Toaster component
lib/utils/toast.ts             # Centralized toast utilities
lib/actions/*.ts               # Server Actions return ActionResult<T>
components/*/Form.tsx          # Client components call toast helpers
app/error.tsx                  # Error boundary with automatic toasts
```

### Design Principles

1. **Centralized Management:** All toast messages defined in `lib/utils/toast.ts`
2. **Type Safety:** Full TypeScript support with autocomplete
3. **Consistency:** Uniform messaging across the application
4. **Accessibility:** ARIA labels and keyboard navigation built-in
5. **Zero Prop Drilling:** Global toast state accessible from any component

## Installation

Sonner is installed via shadcn/ui CLI:

```bash
pnpx shadcn@latest add sonner
```

This creates:
- `components/ui/sonner.tsx` - Toaster component with theme integration
- Adds `sonner` package to dependencies

## Global Setup

The Toaster component is added to the root layout:

```typescript
// app/layout.tsx
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              success: 'border-green-500',
              error: 'border-red-500',
              warning: 'border-yellow-500',
            },
          }}
        />
      </body>
    </html>
  )
}
```

## Toast Utility API

### Import

```typescript
import { toasts } from '@/lib/utils/toast'
```

### Portfolio Operations

```typescript
// Success notifications
toasts.portfolio.created()       // "Portfolio created successfully"
toasts.portfolio.updated()       // "Portfolio updated"
toasts.portfolio.deleted()       // "Portfolio deleted"

// Error notifications
toasts.portfolio.createError()   // "Failed to create portfolio"
toasts.portfolio.updateError()   // "Failed to update portfolio"
toasts.portfolio.deleteError()   // "Failed to delete portfolio"
toasts.portfolio.notFound()      // "Portfolio not found"
```

### Investment Operations

```typescript
// Success notifications with parameters
toasts.investment.added('AAPL')                // "AAPL added to portfolio"
toasts.investment.updated('AAPL')              // "AAPL updated"
toasts.investment.removed('AAPL')              // "AAPL removed from portfolio"
toasts.investment.aggregated('AAPL', 10)       // "AAPL: 10 shares aggregated"

// Error notifications
toasts.investment.addError('AAPL')             // "Failed to add AAPL to portfolio"
toasts.investment.updateError('AAPL')          // "Failed to update AAPL"
toasts.investment.removeError('AAPL')          // "Failed to remove AAPL from portfolio"
toasts.investment.notFound()                   // "Investment not found"
toasts.investment.invalidTicker()              // "Invalid ticker symbol..."
```

### Price Refresh Operations

```typescript
// Loading state
toasts.prices.refreshing()                     // "Refreshing prices..."

// Success (updates loading toast)
toasts.prices.refreshed(5)                     // "5 prices updated"

// Error (updates loading toast)
toasts.prices.failed()                         // "Price refresh failed"

// Partial success
toasts.prices.partialSuccess(3, 5)            // "3 of 5 prices updated..."
```

### Currency Conversion

```typescript
// Loading state
toasts.currency.converting('EUR', 'USD')       // "Converting EUR to USD..."

// Success with rate
toasts.currency.converted('EUR', 'USD', 1.08)  // "Converted at rate: 1 EUR = 1.0800 USD"

// Error
toasts.currency.conversionError()              // "Currency conversion failed"
```

### Generic Operations

```typescript
toasts.success('Custom success message')
toasts.error('Custom error message')
toasts.warning('Custom warning message')
toasts.info('Custom info message')
toasts.loading('Processing...')
```

### Common Errors

```typescript
toasts.apiError()          // "API request failed. Please try again."
toasts.authError()         // "Authentication required. Please sign in."
toasts.forbidden()         // "You don't have permission to perform this action."
toasts.rateLimitError()    // "API rate limit exceeded. Please wait a moment..."
toasts.networkError()      // "Network error. Please check your connection."
```

### Form Validation

```typescript
toasts.validation.required('Portfolio name')     // "Portfolio name is required"
toasts.validation.invalid('Email')               // "Email is invalid"
toasts.validation.tooShort('Name', 3)            // "Name must be at least 3 characters"
toasts.validation.tooLong('Description', 500)    // "Description must be no more than 500 characters"
toasts.validation.mustBePositive('Quantity')     // "Quantity must be a positive number"
```

## Server Action Integration

### ActionResult Type

Server Actions return a structured result for consistent error handling:

```typescript
type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Example Server Action

```typescript
// lib/actions/portfolio.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPortfolio(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  const name = formData.get('name') as string

  if (!name || name.trim().length === 0) {
    return { success: false, error: 'Portfolio name is required' }
  }

  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
    })

    revalidatePath('/dashboard')
    return {
      success: true,
      data: { id: portfolio.id },
      message: 'Portfolio created successfully',
    }
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return { success: false, error: 'Failed to create portfolio' }
  }
}
```

### Client Component Integration

```typescript
// components/portfolio/CreatePortfolioForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPortfolio } from '@/lib/actions/portfolio'
import { toasts } from '@/lib/utils/toast'

export function CreatePortfolioForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPortfolio(formData)

      if (result.success) {
        toasts.portfolio.created()
        router.refresh()
      } else {
        // Map specific errors to appropriate toasts
        if (result.error === 'Unauthorized') {
          toasts.authError()
        } else if (result.error === 'Portfolio name is required') {
          toasts.validation.required('Portfolio name')
        } else {
          toasts.portfolio.createError()
        }
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Portfolio'}
      </button>
    </form>
  )
}
```

## Advanced Patterns

### Promise-Based Loading States

For long-running async operations, use `toast.promise()` for automatic state management:

```typescript
import { toast } from 'sonner'

async function refreshAllPrices() {
  toast.promise(
    updateAllPrices(),
    {
      loading: 'Refreshing prices...',
      success: (data) => `${data.count} prices updated`,
      error: 'Price refresh failed',
    }
  )
}
```

### Toast IDs for State Updates

Use toast IDs to update loading states into success/error states:

```typescript
// Start loading with ID
toast.loading('Refreshing prices...', { id: 'price-refresh' })

// Later, update to success (replaces loading toast)
toast.success('5 prices updated', { id: 'price-refresh' })

// Or update to error
toast.error('Price refresh failed', { id: 'price-refresh' })
```

### Custom Promise Helper

The toast utilities include a promise helper for complex operations:

```typescript
async function complexOperation() {
  await toasts.promise(
    performOperation(),
    {
      loading: 'Processing...',
      success: (data) => `Processed ${data.count} items`,
      error: (err) => `Failed: ${err.message}`,
    }
  )
}
```

### Multi-Step Operations

For operations with multiple steps, update the same toast:

```typescript
async function addInvestmentWithConversion(data: InvestmentData) {
  const toastId = 'investment-add'

  // Step 1: Show loading
  toast.loading('Adding investment...', { id: toastId })

  // Step 2: Convert currency if needed
  if (data.currency !== portfolio.baseCurrency) {
    toast.loading('Converting currency...', { id: toastId })
    await convertCurrency(data)
  }

  // Step 3: Create investment
  const result = await createInvestment(data)

  // Step 4: Show final result
  if (result.success) {
    toast.success(`${data.ticker} added to portfolio`, { id: toastId })
  } else {
    toast.error('Failed to add investment', { id: toastId })
  }
}
```

## Error Boundary Integration

The global error boundary automatically shows toasts for uncaught errors:

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'
import { toasts } from '@/lib/utils/toast'

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    console.error('Application error:', error)
    toasts.error('Something went wrong. Please try again.')
  }, [error])

  return <div>Error UI</div>
}
```

## Styling & Theming

### Default Styles

Sonner automatically integrates with your Tailwind CSS theme:

- Uses `background`, `foreground`, `border` color variables
- Supports light and dark modes via `next-themes`
- Custom border colors for success/error/warning

### Custom Toast Styles

Override styles for specific toasts:

```typescript
toast.success('Custom styled toast', {
  className: 'my-custom-class',
  style: {
    background: '#10b981',
    color: '#fff',
  },
})
```

### Global Configuration

Modify the Toaster component in `app/layout.tsx`:

```typescript
<Toaster
  position="top-right"           // Position: top-left, top-center, top-right, etc.
  expand={true}                  // Expand on hover
  richColors={true}              // Use semantic colors
  closeButton={true}             // Show close button
  duration={4000}                // Toast duration (ms)
  toastOptions={{
    classNames: {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500',
    },
  }}
/>
```

## Accessibility

Sonner includes built-in accessibility features:

- **ARIA Live Regions:** Toasts announced to screen readers
- **Keyboard Navigation:** Navigate and dismiss with keyboard
- **Focus Management:** Proper focus handling for interactive toasts
- **Color Contrast:** Meets WCAG AA standards
- **Semantic HTML:** Uses appropriate ARIA roles and labels

## Testing

### Unit Testing Toast Calls

```typescript
import { toasts } from '@/lib/utils/toast'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Toast Notifications', () => {
  it('should show success toast on portfolio creation', async () => {
    toasts.portfolio.created()
    expect(toast.success).toHaveBeenCalledWith('Portfolio created successfully')
  })
})
```

### E2E Testing with Playwright

```typescript
import { test, expect } from '@playwright/test'

test('shows toast on portfolio creation', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('button:has-text("Create Portfolio")')
  await page.fill('input[name="name"]', 'Test Portfolio')
  await page.click('button[type="submit"]')

  // Wait for toast to appear
  await expect(page.locator('text=Portfolio created successfully')).toBeVisible()
})
```

## Best Practices

### Do's ✅

- Use semantic toast methods (`toasts.portfolio.created()` vs generic `toast.success()`)
- Provide context in error messages (include ticker symbols, names)
- Use loading states for operations >500ms
- Keep messages concise (1-2 sentences max)
- Handle all error cases with appropriate toasts
- Use toast IDs for updating loading states

### Don'ts ❌

- Don't show toasts for every minor action
- Don't use technical jargon or error codes
- Don't stack too many toasts (use IDs to update instead)
- Don't forget to handle error states
- Don't block user interaction with toasts (they auto-dismiss)

## Notification Placement Guidelines

| Location | Notification Type | When to Use |
|----------|------------------|-------------|
| `lib/actions/portfolio.ts` | Return errors in ActionResult | All Server Action error states |
| `lib/actions/investment.ts` | Return errors in ActionResult | All Server Action error states |
| `components/*/Form.tsx` | Call toast helpers | Handle ActionResult responses |
| `lib/api/alphaVantage.ts` | Throw errors | API client errors (caught by caller) |
| `app/error.tsx` | Automatic toast | Uncaught runtime errors |

## Performance Considerations

- **Toast Queue:** Sonner automatically queues toasts (max 3 visible)
- **Memory:** Toasts auto-cleanup after dismissal
- **Bundle Size:** Sonner is lightweight (~5KB gzipped)
- **Rendering:** Toast rendering is optimized with React 19

## Migration Guide

If migrating from another toast library:

### From react-hot-toast

```typescript
// Before
import { toast } from 'react-hot-toast'
toast.success('Success!')

// After
import { toasts } from '@/lib/utils/toast'
toasts.success('Success!')
```

### From react-toastify

```typescript
// Before
import { toast } from 'react-toastify'
toast.success('Success!')

// After
import { toasts } from '@/lib/utils/toast'
toasts.success('Success!')
```

## Troubleshooting

### Toast not appearing

1. Verify Toaster component in `app/layout.tsx`
2. Check browser console for errors
3. Ensure `sonner` package is installed

### Toast styling issues

1. Check Tailwind CSS configuration
2. Verify theme variables in `globals.css`
3. Test in both light and dark modes

### TypeScript errors

1. Ensure `@types/node` is installed
2. Run `pnpm typecheck` for detailed errors
3. Verify toast imports are correct

## Related Documentation

- [Server Actions API](./server-actions.md)
- [Error Handling](./error-handling.md)
- [Form Validation](../architecture/form-patterns.md)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components/sonner)
- [Sonner Documentation](https://sonner.emilkowal.ski/)

---

**Last Updated:** 2025-10-13
**Version:** 1.0.0
**Status:** ✅ Production Ready

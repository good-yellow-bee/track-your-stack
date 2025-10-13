# Notification System Architecture

## Overview

The notification system in Track Your Stack provides user feedback for all interactions using **Sonner** toast notifications via shadcn/ui. The system is designed for type safety, consistency, and accessibility.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Client Component (Form/Button)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useTransition() / async handler                    │    │
│  │  Calls Server Action                                │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Server Action (lib/actions/*.ts)                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Authenticate & authorize                        │    │
│  │  2. Validate input (Zod)                           │    │
│  │  3. Execute business logic (Prisma)                │    │
│  │  4. Return ActionResult<T>                         │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│        ActionResult<T> Response                              │
│  {                                                           │
│    success: boolean                                          │
│    data?: T                                                  │
│    error?: string                                            │
│    message?: string                                          │
│  }                                                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│      Client Component (Result Handling)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  if (result.success) {                              │    │
│  │    toasts.portfolio.created()                       │    │
│  │  } else {                                           │    │
│  │    toasts.error(result.error)                       │    │
│  │  }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│       Toast Utility (lib/utils/toast.ts)                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  toasts.portfolio.created()                         │    │
│  │  → toast.success('Portfolio created successfully')  │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           Sonner Library (Global State)                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │  • Queue management                                 │    │
│  │  • Animation handling                               │    │
│  │  • Auto-dismiss timers                             │    │
│  │  • Accessibility (ARIA)                            │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│        Toaster Component (app/layout.tsx)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  • Renders toasts                                   │    │
│  │  • Applies theme styles                            │    │
│  │  • Handles positioning (top-right)                 │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  User Sees    │
                    │  Toast        │
                    └───────────────┘
```

## Core Components

### 1. Toast Utilities (`lib/utils/toast.ts`)

**Purpose:** Centralized, type-safe notification helpers

**Key Features:**
- Domain-specific methods (portfolio, investment, prices, currency)
- Generic fallbacks (success, error, warning)
- Error categorization (auth, validation, API)
- TypeScript autocomplete support

**Design Pattern:** Facade pattern wrapping Sonner API

```typescript
export const toasts = {
  portfolio: {
    created: () => toast.success('Portfolio created successfully'),
    // ... more methods
  },
  // ... more categories
}
```

### 2. Server Actions (`lib/actions/*.ts`)

**Purpose:** Type-safe server-side mutations with structured responses

**Key Features:**
- Authentication verification
- Input validation (Zod schemas)
- Business logic execution
- Structured ActionResult returns

**Design Pattern:** Command pattern with result objects

```typescript
type ActionResult<T = void> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### 3. Client Components (`components/*`)

**Purpose:** Handle user interactions and show appropriate feedback

**Key Features:**
- useTransition for pending states
- ActionResult handling
- Toast trigger based on results
- Error-specific toast mapping

**Design Pattern:** Observer pattern (React state + toasts)

### 4. Global Toaster (`app/layout.tsx`)

**Purpose:** Single mount point for all toasts

**Key Features:**
- Theme integration (next-themes)
- Position configuration
- Custom styling (Tailwind)
- Global accessibility

**Design Pattern:** Singleton pattern (one Toaster instance)

### 5. Error Boundary (`app/error.tsx`)

**Purpose:** Catch uncaught errors and show user-friendly toasts

**Key Features:**
- Automatic error detection
- User-friendly messaging
- Console logging for debugging
- Recovery UI with retry

**Design Pattern:** Error boundary pattern (React)

## Data Flow

### Success Flow

```
1. User submits form
2. Client component calls Server Action
3. Server Action executes successfully
4. Returns { success: true, data: { id } }
5. Client calls toasts.portfolio.created()
6. Toast appears for 4 seconds
7. Toast auto-dismisses
```

### Error Flow

```
1. User submits form
2. Client component calls Server Action
3. Server Action fails (auth/validation/database)
4. Returns { success: false, error: 'Unauthorized' }
5. Client maps error to toast: toasts.authError()
6. Error toast appears for 4 seconds
7. Toast auto-dismisses
```

### Loading Flow

```
1. User triggers long operation
2. Client shows loading toast with ID
3. Operation executes
4. Update toast with ID to success/error
5. Toast auto-dismisses
```

## Integration Points

### 1. Server Actions ↔ Toast Utilities

**Connection:** Client components bridge Server Actions and toasts

```typescript
const result = await createPortfolio(formData)

if (result.success) {
  toasts.portfolio.created()
} else {
  toasts.error(result.error)
}
```

### 2. Form Components ↔ Toast Utilities

**Connection:** Direct toast calls from event handlers

```typescript
async function handleSubmit(formData: FormData) {
  const result = await createPortfolio(formData)

  if (result.success) {
    toasts.portfolio.created()
    router.refresh()
  }
}
```

### 3. Error Boundaries ↔ Toast Utilities

**Connection:** Automatic error detection and toast display

```typescript
useEffect(() => {
  toasts.error('Something went wrong. Please try again.')
}, [error])
```

### 4. API Client ↔ Toast Utilities

**Connection:** API clients throw errors, callers show toasts

```typescript
// In API client (lib/api/alphaVantage.ts)
if (response.status === 429) {
  throw new Error('RATE_LIMIT')
}

// In caller
try {
  await fetchPrice(ticker)
} catch (error) {
  if (error.message === 'RATE_LIMIT') {
    toasts.rateLimitError()
  }
}
```

## State Management

### Toast Queue

**Managed By:** Sonner library

**Behavior:**
- Max 3 visible toasts
- FIFO queue for overflow
- Auto-dismiss after 4 seconds (configurable)
- Manual dismiss via close button

### Loading State Updates

**Pattern:** Toast IDs for state transitions

```typescript
// Start
toast.loading('Processing...', { id: 'operation' })

// Update to success
toast.success('Done!', { id: 'operation' })

// Same toast transitions from loading → success
```

## Performance Considerations

### Bundle Size

- Sonner: ~5KB gzipped
- Toast utilities: ~2KB gzipped
- Total overhead: ~7KB

### Rendering Performance

- Toasts render in portal (outside main tree)
- Optimized animations (CSS transitions)
- Minimal re-renders (global state)

### Memory Management

- Toasts auto-cleanup after dismissal
- No memory leaks from unmounted components
- Event listeners properly cleaned up

## Accessibility Features

### Screen Reader Support

- ARIA live regions announce toasts
- Semantic role attributes
- Proper labeling

### Keyboard Navigation

- Tab to focus toasts
- Escape to dismiss
- Arrow keys for multiple toasts

### Visual Accessibility

- High contrast colors
- Clear focus indicators
- WCAG AA compliant

### Motion Preferences

- Respects `prefers-reduced-motion`
- Reduced animations for accessibility

## Security Considerations

### XSS Prevention

- All user input sanitized
- No unsafe HTML injection
- Sonner escapes content by default

### Information Disclosure

- Error messages don't leak sensitive data
- No stack traces in user-facing toasts
- Generic error messages for security failures

## Testing Strategy

### Unit Tests

Test toast utility functions:

```typescript
describe('toasts.portfolio', () => {
  it('should call toast.success with correct message', () => {
    toasts.portfolio.created()
    expect(toast.success).toHaveBeenCalledWith('Portfolio created successfully')
  })
})
```

### Integration Tests

Test Server Action + Toast flow:

```typescript
it('should show success toast on portfolio creation', async () => {
  const result = await createPortfolio(formData)
  expect(result.success).toBe(true)
  // Verify toast was called
})
```

### E2E Tests

Test complete user flow:

```typescript
test('portfolio creation shows toast', async ({ page }) => {
  await page.click('button:has-text("Create Portfolio")')
  await page.fill('input[name="name"]', 'Test')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Portfolio created successfully')).toBeVisible()
})
```

## Configuration

### Global Settings

```typescript
// app/layout.tsx
<Toaster
  position="top-right"      // Toast position
  duration={4000}           // Auto-dismiss time (ms)
  expand={true}             // Expand on hover
  richColors={true}         // Semantic colors
  closeButton={true}        // Show close button
/>
```

### Theme Integration

```typescript
// components/ui/sonner.tsx
const { theme = "system" } = useTheme()

<Sonner
  theme={theme as ToasterProps["theme"]}
  className="toaster group"
/>
```

## Extensibility

### Adding New Toast Categories

```typescript
// lib/utils/toast.ts
export const toasts = {
  // ... existing

  // New category
  reports: {
    generated: () => toast.success('Report generated'),
    downloadStarted: () => toast.success('Download started'),
    exportFailed: () => toast.error('Export failed'),
  },
}
```

### Custom Toast Styles

```typescript
toast.success('Custom message', {
  className: 'my-custom-class',
  style: {
    background: '#10b981',
    color: '#fff',
  },
})
```

### Custom Toast Actions

```typescript
toast.success('Action completed', {
  action: {
    label: 'Undo',
    onClick: () => undoAction(),
  },
})
```

## Migration Path

### Phase 1: Foundation (✅ Complete)
- Install Sonner
- Create toast utilities
- Add global Toaster
- Document patterns

### Phase 2: Server Actions (✅ Complete)
- Implement ActionResult pattern
- Create portfolio/investment actions
- Integrate with client components

### Phase 3: Expansion (Future)
- Add more toast categories
- Implement promise-based helpers
- Create toast templates for common patterns

## Related Documentation

- [Toast Notifications API](../api/toast-notifications.md)
- [Server Actions API](../api/server-actions.md)
- [Error Handling Patterns](./error-handling.md)
- [Form Validation](./form-patterns.md)

---

**Last Updated:** 2025-10-13
**Version:** 1.0.0
**Architecture Status:** ✅ Stable

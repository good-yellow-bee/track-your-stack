# Server Actions API

## Overview

This document describes the Server Actions API pattern used in Track Your Stack. Server Actions provide type-safe, server-side mutations without requiring separate API endpoints.

## Why Server Actions?

**Advantages over API Routes:**
- ✅ Type-safe by default (TypeScript end-to-end)
- ✅ No need to define separate API endpoints
- ✅ Automatic request handling (no manual parsing)
- ✅ Built-in error handling
- ✅ Direct database access (runs in Node.js runtime)
- ✅ Better performance (no HTTP round-trip overhead)

## Authentication & Authorization Pattern

### 🚨 Critical Security Rule

**ALWAYS verify user authentication AND ownership in Server Actions.**

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function updatePortfolio(portfolioId: string, data: any) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Verify ownership before ANY operation
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    throw new Error('Portfolio not found')
  }

  if (portfolio.userId !== user.id) {
    throw new Error('Forbidden: Not your portfolio')
  }

  // 3. Now safe to perform operation
  return await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      // ... your updates
    },
  })
}
```

### Authentication Helper Functions

**File:** `lib/auth.ts`

```typescript
/**
 * Require authentication (for Server Actions)
 * Throws error if not authenticated
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized: Please sign in')
  }

  return session.user
}
```

## Portfolio Actions

### createPortfolio

Creates a new portfolio for the authenticated user.

**File:** `lib/actions/portfolio.ts` (to be implemented)

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreatePortfolioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  baseCurrency: z.string().length(3, 'Invalid currency code'),
})

export async function createPortfolio(formData: FormData) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Validate input
  const validatedFields = CreatePortfolioSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    baseCurrency: formData.get('baseCurrency'),
  })

  if (!validatedFields.success) {
    return {
      error: 'Invalid input',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    // 3. Create portfolio for authenticated user
    const portfolio = await prisma.portfolio.create({
      data: {
        ...validatedFields.data,
        userId: user.id,
      },
    })

    // 4. Revalidate dashboard to show new portfolio
    revalidatePath('/dashboard')

    return { success: true, portfolio }
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return { error: 'Failed to create portfolio' }
  }
}
```

**Usage:**

```typescript
// In a Client Component
'use client'

import { createPortfolio } from '@/lib/actions/portfolio'

export function CreatePortfolioForm() {
  async function handleSubmit(formData: FormData) {
    const result = await createPortfolio(formData)

    if (result.error) {
      // Handle error
      console.error(result.error)
    } else {
      // Success - redirect or show success message
      console.log('Portfolio created:', result.portfolio)
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="description" />
      <select name="baseCurrency">
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
      </select>
      <button type="submit">Create Portfolio</button>
    </form>
  )
}
```

### updatePortfolio

Updates an existing portfolio owned by the user.

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updatePortfolio(
  portfolioId: string,
  formData: FormData
) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Verify ownership
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    return { error: 'Portfolio not found' }
  }

  if (portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your portfolio' }
  }

  // 3. Update portfolio
  try {
    const updated = await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      },
    })

    revalidatePath(`/portfolios/${portfolioId}`)

    return { success: true, portfolio: updated }
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return { error: 'Failed to update portfolio' }
  }
}
```

### deletePortfolio

Deletes a portfolio owned by the user.

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deletePortfolio(portfolioId: string) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Verify ownership
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    return { error: 'Portfolio not found' }
  }

  if (portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your portfolio' }
  }

  // 3. Delete portfolio (cascades to investments)
  try {
    await prisma.portfolio.delete({
      where: { id: portfolioId },
    })

    revalidatePath('/dashboard')
    redirect('/dashboard')
  } catch (error) {
    console.error('Failed to delete portfolio:', error)
    return { error: 'Failed to delete portfolio' }
  }
}
```

## Investment Actions

### createInvestment

Creates a new investment in a portfolio owned by the user.

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateInvestmentSchema = z.object({
  portfolioId: z.string().uuid(),
  ticker: z.string().min(1).max(10),
  assetType: z.enum(['STOCK', 'ETF', 'MUTUAL_FUND', 'CRYPTO']),
  quantity: z.number().positive(),
  averageCostBasis: z.number().positive(),
  purchaseCurrency: z.string().length(3),
})

export async function createInvestment(data: z.infer<typeof CreateInvestmentSchema>) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Validate input
  const validatedFields = CreateInvestmentSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      error: 'Invalid input',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // 3. Verify portfolio ownership
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: validatedFields.data.portfolioId },
    select: { userId: true },
  })

  if (!portfolio) {
    return { error: 'Portfolio not found' }
  }

  if (portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your portfolio' }
  }

  // 4. Create investment
  try {
    const investment = await prisma.investment.create({
      data: validatedFields.data,
    })

    revalidatePath(`/portfolios/${validatedFields.data.portfolioId}`)

    return { success: true, investment }
  } catch (error) {
    console.error('Failed to create investment:', error)
    return { error: 'Failed to create investment' }
  }
}
```

### updateInvestment

Updates an existing investment (verifies via portfolio ownership).

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateInvestment(
  investmentId: string,
  data: { quantity?: number; averageCostBasis?: number }
) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Get investment with portfolio relationship
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      portfolio: {
        select: { userId: true },
      },
    },
  })

  if (!investment) {
    return { error: 'Investment not found' }
  }

  // 3. Verify ownership via portfolio
  if (investment.portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your investment' }
  }

  // 4. Update investment
  try {
    const updated = await prisma.investment.update({
      where: { id: investmentId },
      data,
    })

    revalidatePath(`/portfolios/${investment.portfolioId}`)

    return { success: true, investment: updated }
  } catch (error) {
    console.error('Failed to update investment:', error)
    return { error: 'Failed to update investment' }
  }
}
```

### deleteInvestment

Deletes an investment from a portfolio owned by the user.

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteInvestment(investmentId: string) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Get investment with portfolio relationship
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      portfolio: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!investment) {
    return { error: 'Investment not found' }
  }

  // 3. Verify ownership via portfolio
  if (investment.portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your investment' }
  }

  // 4. Delete investment
  try {
    await prisma.investment.delete({
      where: { id: investmentId },
    })

    revalidatePath(`/portfolios/${investment.portfolio.id}`)

    return { success: true }
  } catch (error) {
    console.error('Failed to delete investment:', error)
    return { error: 'Failed to delete investment' }
  }
}
```

### refreshInvestmentPrice

Fetches latest price from Alpha Vantage and updates the investment.

```typescript
'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getStockQuote } from '@/lib/api/alphaVantage'

export async function refreshInvestmentPrice(investmentId: string) {
  // 1. Require authentication
  const user = await requireAuth()

  // 2. Get investment with portfolio relationship
  const investment = await prisma.investment.findUnique({
    where: { id: investmentId },
    include: {
      portfolio: {
        select: { userId: true, id: true },
      },
    },
  })

  if (!investment) {
    return { error: 'Investment not found' }
  }

  // 3. Verify ownership via portfolio
  if (investment.portfolio.userId !== user.id) {
    return { error: 'Forbidden: Not your investment' }
  }

  // 4. Fetch latest price
  try {
    const quote = await getStockQuote(investment.ticker)

    const updated = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentPrice: quote.price,
        priceUpdatedAt: new Date(),
      },
    })

    revalidatePath(`/portfolios/${investment.portfolio.id}`)

    return { success: true, investment: updated }
  } catch (error) {
    console.error('Failed to refresh price:', error)
    return { error: 'Failed to refresh price' }
  }
}
```

## Error Handling

### Standard Error Response

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { error: string; errors?: Record<string, string[]> }
```

### Error Types

```typescript
// Authentication errors
'Unauthorized: Please sign in'

// Authorization errors
'Forbidden: Not your portfolio'
'Forbidden: Not your investment'

// Validation errors
'Invalid input'
{ errors: { fieldName: ['error message'] } }

// Database errors
'Portfolio not found'
'Investment not found'
'Failed to create portfolio'
```

### Client-Side Error Handling

```typescript
'use client'

async function handleAction() {
  const result = await someAction(data)

  if ('error' in result) {
    // Handle error
    if (result.error === 'Unauthorized: Please sign in') {
      router.push('/auth/signin')
    } else if (result.errors) {
      // Validation errors
      setFieldErrors(result.errors)
    } else {
      // Generic error
      toast.error(result.error)
    }
  } else {
    // Success
    toast.success('Action completed successfully')
  }
}
```

## Input Validation

Always validate inputs using Zod before processing:

```typescript
import { z } from 'zod'

const Schema = z.object({
  field: z.string().min(1, 'Required'),
})

const result = Schema.safeParse(data)

if (!result.success) {
  return {
    error: 'Invalid input',
    errors: result.error.flatten().fieldErrors,
  }
}

// Use validated data
const validData = result.data
```

## Cache Revalidation

Use `revalidatePath()` to update cached data after mutations:

```typescript
import { revalidatePath } from 'next/cache'

// Revalidate specific page
revalidatePath('/dashboard')

// Revalidate specific portfolio
revalidatePath(`/portfolios/${portfolioId}`)

// Revalidate all portfolios
revalidatePath('/portfolios', 'layout')
```

## Security Checklist

**Before deploying any Server Action:**

- [ ] Authentication verified with `requireAuth()`
- [ ] User ownership verified before ANY operation
- [ ] Input validated with Zod schema
- [ ] Error messages don't leak sensitive data
- [ ] Proper cache revalidation after mutations
- [ ] Database queries use Prisma (prevents SQL injection)
- [ ] Returns type-safe responses

## Testing

```typescript
import { createPortfolio } from '@/lib/actions/portfolio'

describe('Portfolio Actions', () => {
  it('should require authentication', async () => {
    // Mock unauthenticated session
    const result = await createPortfolio(formData)
    expect(result.error).toBe('Unauthorized: Please sign in')
  })

  it('should create portfolio for authenticated user', async () => {
    // Mock authenticated session
    const result = await createPortfolio(formData)
    expect(result.success).toBe(true)
    expect(result.portfolio?.userId).toBe(mockUser.id)
  })

  it('should verify portfolio ownership before update', async () => {
    // Try to update another user's portfolio
    const result = await updatePortfolio(otherUsersPortfolioId, formData)
    expect(result.error).toBe('Forbidden: Not your portfolio')
  })
})
```

---

**Last Updated:** 2025-10-11
**Related:** [Authentication](./authentication.md) | [Security Review](../security/authentication-security-review.md)

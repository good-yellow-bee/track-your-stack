# F09: Price Refresh System

**Status:** ⬜ Not Started
**Priority:** 🟡 Important
**Estimated Time:** 3-4 hours
**Dependencies:** F05 (Alpha Vantage), F08 (Calculation Engine)

---

## 📋 Overview

Implement manual and automatic price refresh system using React Query for background updates, with smart caching and rate limit management.

**What this enables:**

- Manual price refresh on demand
- Automatic background refresh every 15 minutes
- Smart caching to minimize API calls
- Real-time UI updates
- Loading states during refresh

---

## 🎯 Acceptance Criteria

- [ ] Manual refresh button working
- [ ] Auto-refresh every 15 minutes
- [ ] React Query integration complete
- [ ] Loading states during refresh
- [ ] Error handling for failed refreshes
- [ ] Rate limit respecting
- [ ] Cache invalidation working
- [ ] Optimistic UI updates

---

## 🔧 Key Implementation Steps

### Setup React Query Provider

Update `app/layout.tsx`:

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchInterval: 15 * 60 * 1000, // 15 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

### Price Refresh Action

Create `lib/actions/prices.ts`:

```typescript
'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getAssetPrice } from '@/lib/services/priceService'
import { Decimal } from '@prisma/client/runtime/library'

export async function refreshPortfolioPrices(portfolioId: string) {
  try {
    const user = await requireAuth()

    // Verify ownership
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { investments: true },
    })

    if (!portfolio || portfolio.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Refresh prices for all investments
    const updates = await Promise.allSettled(
      portfolio.investments.map(async (investment) => {
        const price = await getAssetPrice(investment.ticker, investment.assetType)

        return prisma.investment.update({
          where: { id: investment.id },
          data: {
            currentPrice: new Decimal(price),
            priceUpdatedAt: new Date(),
          },
        })
      })
    )

    const successful = updates.filter((r) => r.status === 'fulfilled').length
    const failed = updates.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      message: `Updated ${successful} prices${failed > 0 ? `, ${failed} failed` : ''}`,
    }
  } catch (error) {
    console.error('Error refreshing prices:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh prices',
    }
  }
}

export async function refreshInvestmentPrice(investmentId: string) {
  try {
    const user = await requireAuth()

    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
      include: { portfolio: true },
    })

    if (!investment || investment.portfolio.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const price = await getAssetPrice(investment.ticker, investment.assetType)

    const updated = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentPrice: new Decimal(price),
        priceUpdatedAt: new Date(),
      },
    })

    return { success: true, investment: updated }
  } catch (error) {
    console.error('Error refreshing price:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh price',
    }
  }
}
```

### Refresh Button Component

Create `components/investment/RefreshPricesButton.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { refreshPortfolioPrices } from '@/lib/actions/prices'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface RefreshPricesButtonProps {
  portfolioId: string
}

export default function RefreshPricesButton({ portfolioId }: RefreshPricesButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()

  async function handleRefresh() {
    setIsRefreshing(true)

    try {
      const result = await refreshPortfolioPrices(portfolioId)

      if (result.success) {
        toast.success(result.message)
        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })
      } else {
        toast.error(result.error || 'Failed to refresh prices')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
    </Button>
  )
}
```

### Auto-Refresh Hook

Create `hooks/useAutoRefresh.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'

export function useAutoRefresh(
  queryKey: string[],
  queryFn: () => Promise<any>,
  interval: number = 15 * 60 * 1000 // 15 minutes
) {
  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: interval,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}
```

### Portfolio with Auto-Refresh

Update `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
'use client'

import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { getPortfolio } from '@/lib/actions/portfolio'
import RefreshPricesButton from '@/components/investment/RefreshPricesButton'

export default function PortfolioPage({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useAutoRefresh(
    ['portfolio', params.id],
    () => getPortfolio(params.id)
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading portfolio</div>
  if (!data?.success || !data.portfolio) return <div>Portfolio not found</div>

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>{data.portfolio.name}</h1>
        <RefreshPricesButton portfolioId={params.id} />
      </div>
      {/* Rest of portfolio view */}
    </div>
  )
}
```

---

## 🧪 Testing Requirements

- [ ] Manual refresh updates prices
- [ ] Auto-refresh triggers every 15 min
- [ ] Loading state shows during refresh
- [ ] Error toast on API failure
- [ ] Cache invalidation works
- [ ] Multiple portfolios refresh independently

---

## 📦 Deliverables

- [x] React Query provider setup
- [x] Price refresh Server Actions
- [x] Refresh button component
- [x] Auto-refresh hook
- [x] Loading/error states

---

## 🔗 Related Files

- `lib/actions/prices.ts`
- `components/investment/RefreshPricesButton.tsx`
- `hooks/useAutoRefresh.ts`
- `app/layout.tsx` (React Query provider)

---

## ⏭️ Next Feature

→ [F10: Portfolio Summary Cards](F10_portfolio_summary.md)

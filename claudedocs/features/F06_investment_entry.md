# F06: Investment Entry Form

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 5-6 hours
**Dependencies:** F04 (Portfolio CRUD), F05 (Alpha Vantage API)

---

## 📋 Overview

Create comprehensive form for adding new investments with ticker search autocomplete, asset type detection, and automatic average cost basis calculation when adding to existing holdings.

**What this enables:**

- Add investments to portfolios
- Real-time ticker search with autocomplete
- Auto-populate asset name from API
- Asset type detection (Stock, ETF, Crypto)
- Multiple purchase support for same ticker
- Automatic average cost basis calculation
- Purchase date and notes
- Multi-currency support

---

## 🎯 Acceptance Criteria

- [ ] Investment form with all required fields
- [ ] Ticker autocomplete working
- [ ] Asset name auto-populated from API
- [ ] Asset type auto-detected or selectable
- [ ] Quantity and price validation
- [ ] Purchase date picker
- [ ] Currency selector
- [ ] Optional notes field
- [ ] Preview before save
- [ ] Average cost calculation for existing holdings
- [ ] Success/error feedback
- [ ] Form accessible via portfolio detail page

---

## 📦 Dependencies to Install

```bash
# Date picker (if not already installed)
pnpm dlx shadcn-ui@latest add calendar popover

# Already installed:
# - react-hook-form
# - zod
# - date-fns
```

---

## 🔧 Implementation Steps

### Step 1: Create Investment Validation Schema (20 min)

Create `lib/validations/investment.ts`:

```typescript
import { z } from 'zod'
import { AssetType } from '@prisma/client'

export const createInvestmentSchema = z.object({
  portfolioId: z.string().cuid(),
  ticker: z.string().min(1, 'Ticker is required').max(10).toUpperCase(),
  assetName: z.string().min(1, 'Asset name is required').max(200),
  assetType: z.nativeEnum(AssetType),
  quantity: z
    .number()
    .positive('Quantity must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  pricePerUnit: z
    .number()
    .positive('Price must be positive')
    .or(z.string().transform((val) => parseFloat(val))),
  currency: z.string().length(3),
  purchaseDate: z.date().max(new Date(), 'Purchase date cannot be in the future'),
  notes: z.string().optional(),
})

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>
```

### Step 2: Create Investment Server Actions (90 min)

Create `lib/actions/investment.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createInvestmentSchema, CreateInvestmentInput } from '@/lib/validations/investment'
import { Decimal } from '@prisma/client/runtime/library'

export async function createInvestment(input: CreateInvestmentInput) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = createInvestmentSchema.parse(input)

    // Verify portfolio ownership
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: validated.portfolioId },
      select: { userId: true },
    })

    if (!portfolio || portfolio.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if investment already exists for this ticker
    const existing = await prisma.investment.findFirst({
      where: {
        portfolioId: validated.portfolioId,
        ticker: validated.ticker,
      },
      include: {
        transactions: true,
      },
    })

    if (existing) {
      // Add to existing investment - recalculate average cost basis
      const existingTotalCost =
        existing.averageCostBasis.toNumber() * existing.totalQuantity.toNumber()
      const newCost = validated.pricePerUnit * validated.quantity
      const newTotalQuantity = existing.totalQuantity.toNumber() + validated.quantity
      const newAverageCostBasis = (existingTotalCost + newCost) / newTotalQuantity

      // Update investment
      const updated = await prisma.investment.update({
        where: { id: existing.id },
        data: {
          totalQuantity: new Decimal(newTotalQuantity),
          averageCostBasis: new Decimal(newAverageCostBasis),
          transactions: {
            create: {
              quantity: new Decimal(validated.quantity),
              pricePerUnit: new Decimal(validated.pricePerUnit),
              currency: validated.currency,
              purchaseDate: validated.purchaseDate,
              notes: validated.notes,
            },
          },
        },
      })

      revalidatePath(`/portfolios/${validated.portfolioId}`)
      return { success: true, investment: updated, isUpdate: true }
    } else {
      // Create new investment
      const investment = await prisma.investment.create({
        data: {
          portfolioId: validated.portfolioId,
          ticker: validated.ticker,
          assetName: validated.assetName,
          assetType: validated.assetType,
          totalQuantity: new Decimal(validated.quantity),
          averageCostBasis: new Decimal(validated.pricePerUnit),
          purchaseCurrency: validated.currency,
          transactions: {
            create: {
              quantity: new Decimal(validated.quantity),
              pricePerUnit: new Decimal(validated.pricePerUnit),
              currency: validated.currency,
              purchaseDate: validated.purchaseDate,
              notes: validated.notes,
            },
          },
        },
      })

      revalidatePath(`/portfolios/${validated.portfolioId}`)
      return { success: true, investment, isUpdate: false }
    }
  } catch (error) {
    console.error('Error creating investment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create investment',
    }
  }
}
```

### Step 3: Create Ticker Search Component (60 min)

Create `components/investment/TickerSearch.tsx`:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchTickers } from '@/lib/services/priceService'
import { SymbolMatch } from '@/types/alpha-vantage'

interface TickerSearchProps {
  value?: string
  onSelect: (match: SymbolMatch) => void
  disabled?: boolean
}

export default function TickerSearch({ value, onSelect, disabled }: TickerSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SymbolMatch[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(search, 500)

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const matches = await searchTickers(query)
      setResults(matches.slice(0, 10)) // Limit to top 10
    } catch (error) {
      console.error('Ticker search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    performSearch(debouncedSearch)
  }, [debouncedSearch, performSearch])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value || 'Search ticker...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search ticker or company..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              'No results found'
            )}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup>
              {results.map((match) => (
                <CommandItem
                  key={match.symbol}
                  value={match.symbol}
                  onSelect={() => {
                    onSelect(match)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === match.symbol ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{match.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {match.name} • {match.type} • {match.region}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

Create `hooks/useDebounce.ts`:

```typescript
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### Step 4: Create Investment Form Component (90 min)

Create `components/investment/InvestmentForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { createInvestment } from '@/lib/actions/investment'
import { createInvestmentSchema, CreateInvestmentInput } from '@/lib/validations/investment'
import { CURRENCIES, ASSET_TYPES } from '@/lib/constants'
import { AssetType } from '@prisma/client'
import { SymbolMatch } from '@/types/alpha-vantage'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TickerSearch from './TickerSearch'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvestmentFormProps {
  portfolioId: string
  defaultCurrency: string
}

export default function InvestmentForm({ portfolioId, defaultCurrency }: InvestmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState<SymbolMatch | null>(null)

  const form = useForm<CreateInvestmentInput>({
    resolver: zodResolver(createInvestmentSchema),
    defaultValues: {
      portfolioId,
      ticker: '',
      assetName: '',
      assetType: 'STOCK',
      quantity: 0,
      pricePerUnit: 0,
      currency: defaultCurrency,
      purchaseDate: new Date(),
      notes: '',
    },
  })

  function handleTickerSelect(match: SymbolMatch) {
    setSelectedTicker(match)
    form.setValue('ticker', match.symbol)
    form.setValue('assetName', match.name)

    // Auto-detect asset type
    let assetType: AssetType = 'STOCK'
    if (match.type.includes('ETF')) assetType = 'ETF'
    else if (match.type.includes('Mutual Fund')) assetType = 'MUTUAL_FUND'
    else if (match.type.includes('Crypto')) assetType = 'CRYPTO'

    form.setValue('assetType', assetType)
  }

  async function onSubmit(data: CreateInvestmentInput) {
    setIsSubmitting(true)

    try {
      const result = await createInvestment(data)

      if (result.success) {
        toast.success(
          result.isUpdate
            ? 'Investment updated with new transaction'
            : 'Investment created successfully'
        )
        router.push(`/portfolios/${portfolioId}`)
      } else {
        toast.error(result.error || 'Failed to create investment')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Ticker Search */}
        <FormField
          control={form.control}
          name="ticker"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticker Symbol</FormLabel>
              <FormControl>
                <TickerSearch
                  value={field.value}
                  onSelect={handleTickerSelect}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Search for stock, ETF, or crypto symbol</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asset Name */}
        <FormField
          control={form.control}
          name="assetName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Apple Inc." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asset Type */}
        <FormField
          control={form.control}
          name="assetType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantity & Price */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.00000001"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricePerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Unit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="150.50"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Purchase Date */}
        <FormField
          control={form.control}
          name="purchaseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Purchase Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      disabled={isSubmitting}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this purchase..."
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Investment
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### Step 5: Create Add Investment Page (20 min)

Create `app/(dashboard)/portfolios/[id]/investments/new/page.tsx`:

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import InvestmentForm from '@/components/investment/InvestmentForm'

interface NewInvestmentPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: NewInvestmentPageProps): Promise<Metadata> {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    return { title: 'Add Investment' }
  }

  return {
    title: `Add Investment - ${result.portfolio.name}`,
    description: `Add a new investment to ${result.portfolio.name}`,
  }
}

export default async function NewInvestmentPage({ params }: NewInvestmentPageProps) {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Investment</h1>
        <p className="text-muted-foreground">
          Add a new investment to <strong>{portfolio.name}</strong>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
          <CardDescription>
            Search for a ticker and enter your purchase details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestmentForm
            portfolioId={portfolio.id}
            defaultCurrency={portfolio.baseCurrency}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] Ticker search returns results
- [ ] Selecting ticker populates asset name
- [ ] Asset type auto-detects correctly
- [ ] Can enter quantity and price
- [ ] Date picker works
- [ ] Currency selector works
- [ ] Form validation catches errors
- [ ] Adding to existing ticker calculates average cost
- [ ] Success message after submission
- [ ] Redirects to portfolio page

---

## 📚 Documentation Updates

### Changelog Entry

```markdown
## [0.6.0] - 2025-10-08

### Added

- Investment entry form with validation
- Ticker autocomplete search
- Auto-population of asset details
- Asset type auto-detection
- Average cost basis calculation
- Multi-currency support for purchases
- Purchase date picker
- Optional notes field
```

---

## 🔗 Related Files

- `lib/actions/investment.ts`
- `lib/validations/investment.ts`
- `components/investment/InvestmentForm.tsx`
- `components/investment/TickerSearch.tsx`
- `hooks/useDebounce.ts`
- `app/(dashboard)/portfolios/[id]/investments/new/page.tsx`

---

## ⏭️ Next Feature

After completing F06, proceed to:
→ [F07: Investment Management](F07_investment_management.md)

---

**Status Legend:**

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

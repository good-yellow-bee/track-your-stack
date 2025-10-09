# F04: Portfolio CRUD Operations

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 4-5 hours
**Dependencies:** F02 (Database Schema), F03 (Authentication)

---

## 📋 Overview

Implement complete Create, Read, Update, Delete (CRUD) operations for portfolios using Next.js Server Actions. Users can create multiple portfolios, view them, edit names/currencies, and delete with confirmation.

**What this enables:**

- Create new portfolios with custom names
- Select base currency for each portfolio
- View list of all user portfolios
- Edit portfolio details
- Delete portfolios with confirmation
- Type-safe server actions
- Optimistic UI updates

---

## 🎯 Acceptance Criteria

- [ ] Create portfolio form working
- [ ] Portfolio list displays all user portfolios
- [ ] Can edit portfolio name and currency
- [ ] Delete confirmation dialog appears
- [ ] Deleting portfolio removes investments (cascade)
- [ ] Server Actions properly validated
- [ ] Only owner can access their portfolios
- [ ] Error handling for all operations
- [ ] Loading states implemented
- [ ] Success/error toasts displayed

---

## 📦 Dependencies to Install

Additional packages needed:

```bash
# Toast notifications
pnpm add sonner

# Already installed in F01:
# - react-hook-form
# - zod
# - @hookform/resolvers
```

---

## 🔧 Implementation Steps

### Step 1: Create Portfolio Validation Schema (15 min)

Create `lib/validations/portfolio.ts`:

```typescript
import { z } from 'zod'

export const createPortfolioSchema = z.object({
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.string().min(3).max(3),
})

export const updatePortfolioSchema = z.object({
  id: z.string().cuid(),
  name: z
    .string()
    .min(1, 'Portfolio name is required')
    .max(100, 'Portfolio name must be less than 100 characters'),
  baseCurrency: z.string().min(3).max(3),
})

export const deletePortfolioSchema = z.object({
  id: z.string().cuid(),
})

export type CreatePortfolioInput = z.infer<typeof createPortfolioSchema>
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>
export type DeletePortfolioInput = z.infer<typeof deletePortfolioSchema>
```

### Step 2: Create Portfolio Server Actions (60 min)

Create `lib/actions/portfolio.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createPortfolioSchema,
  updatePortfolioSchema,
  deletePortfolioSchema,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  DeletePortfolioInput,
} from '@/lib/validations/portfolio'

export async function createPortfolio(input: CreatePortfolioInput) {
  try {
    // Authenticate user
    const user = await requireAuth()

    // Validate input
    const validated = createPortfolioSchema.parse(input)

    // Create portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: validated.name,
        baseCurrency: validated.baseCurrency,
      },
    })

    revalidatePath('/portfolios')
    revalidatePath('/dashboard')

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create portfolio',
    }
  }
}

export async function getPortfolios() {
  try {
    const user = await requireAuth()

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { investments: true },
        },
      },
    })

    return { success: true, portfolios }
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch portfolios',
    }
  }
}

export async function getPortfolio(id: string) {
  try {
    const user = await requireAuth()

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        investments: {
          include: {
            transactions: true,
          },
        },
      },
    })

    if (!portfolio) {
      return { success: false, error: 'Portfolio not found' }
    }

    // Verify ownership
    if (portfolio.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio',
    }
  }
}

export async function updatePortfolio(input: UpdatePortfolioInput) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = updatePortfolioSchema.parse(input)

    // Verify ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Portfolio not found' }
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update portfolio
    const portfolio = await prisma.portfolio.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        baseCurrency: validated.baseCurrency,
      },
    })

    revalidatePath('/portfolios')
    revalidatePath(`/portfolios/${portfolio.id}`)

    return { success: true, portfolio }
  } catch (error) {
    console.error('Error updating portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update portfolio',
    }
  }
}

export async function deletePortfolio(input: DeletePortfolioInput) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = deletePortfolioSchema.parse(input)

    // Verify ownership
    const existing = await prisma.portfolio.findUnique({
      where: { id: validated.id },
      select: { userId: true },
    })

    if (!existing) {
      return { success: false, error: 'Portfolio not found' }
    }

    if (existing.userId !== user.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Delete portfolio (cascade deletes investments)
    await prisma.portfolio.delete({
      where: { id: validated.id },
    })

    revalidatePath('/portfolios')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete portfolio',
    }
  }
}
```

### Step 3: Create Portfolio Form Component (45 min)

Create `components/portfolio/PortfolioForm.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createPortfolio, updatePortfolio } from '@/lib/actions/portfolio'
import { createPortfolioSchema, CreatePortfolioInput } from '@/lib/validations/portfolio'
import { CURRENCIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface PortfolioFormProps {
  mode: 'create' | 'edit'
  defaultValues?: {
    id?: string
    name: string
    baseCurrency: string
  }
  onSuccess?: () => void
}

export default function PortfolioForm({
  mode,
  defaultValues,
  onSuccess,
}: PortfolioFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreatePortfolioInput>({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      baseCurrency: defaultValues?.baseCurrency || 'USD',
    },
  })

  async function onSubmit(data: CreatePortfolioInput) {
    setIsSubmitting(true)

    try {
      const result =
        mode === 'create'
          ? await createPortfolio(data)
          : await updatePortfolio({ ...data, id: defaultValues!.id! })

      if (result.success) {
        toast.success(
          mode === 'create' ? 'Portfolio created successfully' : 'Portfolio updated successfully'
        )
        form.reset()
        onSuccess?.()
        if (mode === 'create') {
          router.push('/portfolios')
        }
      } else {
        toast.error(result.error || 'Something went wrong')
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
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Name</FormLabel>
              <FormControl>
                <Input placeholder="My Investment Portfolio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Portfolio' : 'Update Portfolio'}
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

### Step 4: Create Portfolio List Component (45 min)

Create `components/portfolio/PortfolioList.tsx`:

```typescript
import Link from 'next/link'
import { Portfolio } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle, ArrowRight } from 'lucide-react'
import PortfolioCard from './PortfolioCard'

interface PortfolioListProps {
  portfolios: (Portfolio & { _count: { investments: number } })[]
}

export default function PortfolioList({ portfolios }: PortfolioListProps) {
  if (portfolios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Portfolios Yet</CardTitle>
          <CardDescription>
            Create your first portfolio to start tracking your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/portfolios/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Portfolios</h2>
        <Link href="/portfolios/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Portfolio
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>
    </div>
  )
}
```

Create `components/portfolio/PortfolioCard.tsx`:

```typescript
import Link from 'next/link'
import { Portfolio } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet } from 'lucide-react'
import { CURRENCIES } from '@/lib/constants'

interface PortfolioCardProps {
  portfolio: Portfolio & { _count: { investments: number } }
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const currency = CURRENCIES.find((c) => c.code === portfolio.baseCurrency)

  return (
    <Link href={`/portfolios/${portfolio.id}`}>
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">{portfolio.name}</CardTitle>
            </div>
          </div>
          <CardDescription>
            {currency?.symbol} {currency?.code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investments</p>
              <p className="text-2xl font-bold">{portfolio._count.investments}</p>
            </div>
            <Button variant="ghost" size="sm">
              View <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

### Step 5: Create Portfolio Delete Component (30 min)

Create `components/portfolio/DeletePortfolioButton.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deletePortfolio } from '@/lib/actions/portfolio'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'

interface DeletePortfolioButtonProps {
  portfolioId: string
  portfolioName: string
  investmentCount: number
}

export default function DeletePortfolioButton({
  portfolioId,
  portfolioName,
  investmentCount,
}: DeletePortfolioButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const result = await deletePortfolio({ id: portfolioId })

      if (result.success) {
        toast.success('Portfolio deleted successfully')
        router.push('/portfolios')
      } else {
        toast.error(result.error || 'Failed to delete portfolio')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Delete Portfolio
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{portfolioName}</strong> and all of its{' '}
            <strong>{investmentCount} investment(s)</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Portfolio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Step 6: Create Portfolio Pages (60 min)

Create `app/(dashboard)/portfolios/page.tsx`:

```typescript
import { Metadata } from 'next'
import { getPortfolios } from '@/lib/actions/portfolio'
import PortfolioList from '@/components/portfolio/PortfolioList'

export const metadata: Metadata = {
  title: 'Portfolios - Track Your Stack',
  description: 'Manage your investment portfolios',
}

export default async function PortfoliosPage() {
  const result = await getPortfolios()

  if (!result.success) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
        <p className="text-muted-foreground">Manage your investment portfolios</p>
      </div>

      <PortfolioList portfolios={result.portfolios} />
    </div>
  )
}
```

Create `app/(dashboard)/portfolios/new/page.tsx`:

```typescript
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioForm from '@/components/portfolio/PortfolioForm'

export const metadata: Metadata = {
  title: 'Create Portfolio - Track Your Stack',
  description: 'Create a new investment portfolio',
}

export default function NewPortfolioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Portfolio</h1>
        <p className="text-muted-foreground">
          Create a new portfolio to track your investments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>
            Enter a name and select the base currency for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
```

Create `app/(dashboard)/portfolios/[id]/page.tsx`:

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DeletePortfolioButton from '@/components/portfolio/DeletePortfolioButton'
import { Edit, ArrowLeft } from 'lucide-react'

interface PortfolioPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `${result.portfolio.name} - Track Your Stack`,
    description: `View and manage ${result.portfolio.name}`,
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/portfolios"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolios
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
          <p className="text-muted-foreground">
            Base Currency: {portfolio.baseCurrency}
          </p>
        </div>

        <div className="flex gap-2">
          <Link href={`/portfolios/${portfolio.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeletePortfolioButton
            portfolioId={portfolio.id}
            portfolioName={portfolio.name}
            investmentCount={portfolio.investments.length}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investments</CardTitle>
          <CardDescription>
            {portfolio.investments.length === 0
              ? 'No investments yet'
              : `${portfolio.investments.length} investment(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Investment management will be implemented in F06
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

Create `app/(dashboard)/portfolios/[id]/edit/page.tsx`:

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioForm from '@/components/portfolio/PortfolioForm'

interface EditPortfolioPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: EditPortfolioPageProps): Promise<Metadata> {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `Edit ${result.portfolio.name} - Track Your Stack`,
    description: `Edit ${result.portfolio.name}`,
  }
}

export default async function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  const result = await getPortfolio(params.id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio</h1>
        <p className="text-muted-foreground">Update your portfolio details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>Update the name and base currency</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioForm
            mode="edit"
            defaultValues={{
              id: portfolio.id,
              name: portfolio.name,
              baseCurrency: portfolio.baseCurrency,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 7: Add Toast Notifications (15 min)

Update `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Track Your Stack',
  description: 'Investment Portfolio Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] Can create new portfolio with custom name
- [ ] Can select different currencies
- [ ] Portfolio appears in list after creation
- [ ] Can edit portfolio name
- [ ] Can edit portfolio currency
- [ ] Changes persist after edit
- [ ] Can delete empty portfolio
- [ ] Delete confirmation dialog appears
- [ ] Cannot access other user's portfolios
- [ ] Form validation works (empty name, etc.)
- [ ] Toast notifications appear for all actions
- [ ] Loading states show during operations

### Test Scenarios

**Scenario 1: Create Portfolio**

```bash
1. Go to /portfolios/new
2. Enter name: "Tech Stocks"
3. Select currency: USD
4. Click "Create Portfolio"
5. Should redirect to /portfolios
6. Should see "Tech Stocks" in list
7. Toast: "Portfolio created successfully"
```

**Scenario 2: Edit Portfolio**

```bash
1. Click on a portfolio card
2. Click "Edit" button
3. Change name to "Technology Stocks"
4. Change currency to EUR
5. Click "Update Portfolio"
6. Should see updated name and currency
7. Toast: "Portfolio updated successfully"
```

**Scenario 3: Delete Portfolio**

```bash
1. Click on a portfolio card
2. Click "Delete Portfolio" button
3. Confirmation dialog appears
4. Shows investment count
5. Click "Delete Portfolio" in dialog
6. Should redirect to /portfolios
7. Portfolio removed from list
8. Toast: "Portfolio deleted successfully"
```

---

## 📚 Documentation Updates

### Changelog Entry

```markdown
## [0.4.0] - 2025-10-08

### Added

- Portfolio CRUD operations with Server Actions
- Create portfolio form with validation
- Portfolio list view with cards
- Edit portfolio functionality
- Delete portfolio with confirmation dialog
- Portfolio detail page
- Toast notifications for all actions
- Authorization checks for portfolio access
- Loading states for async operations
```

---

## 🔀 Git Workflow

### Commit Messages

```bash
git commit -m "feat(portfolio): add portfolio validation schemas"
git commit -m "feat(portfolio): implement portfolio Server Actions"
git commit -m "feat(portfolio): create portfolio form component"
git commit -m "feat(portfolio): add portfolio list and cards"
git commit -m "feat(portfolio): implement delete with confirmation"
git commit -m "feat(portfolio): create portfolio pages and routes"
```

---

## ⚠️ Common Issues & Solutions

### Issue: Form not submitting

**Solution:** Check form validation, ensure all required fields filled

### Issue: Unauthorized error

**Solution:** Verify user is signed in and owns the portfolio

### Issue: Toast not appearing

**Solution:** Ensure Toaster component is in layout

### Issue: Delete not working

**Solution:** Check cascade delete in Prisma schema

---

## 📦 Deliverables

- [x] Portfolio Server Actions
- [x] Portfolio form component
- [x] Portfolio list and cards
- [x] Delete confirmation dialog
- [x] All portfolio pages
- [x] Toast notifications
- [x] Authorization checks
- [x] Loading states

---

## 🔗 Related Files

- `lib/actions/portfolio.ts`
- `lib/validations/portfolio.ts`
- `components/portfolio/PortfolioForm.tsx`
- `components/portfolio/PortfolioList.tsx`
- `components/portfolio/PortfolioCard.tsx`
- `components/portfolio/DeletePortfolioButton.tsx`
- `app/(dashboard)/portfolios/page.tsx`
- `app/(dashboard)/portfolios/new/page.tsx`
- `app/(dashboard)/portfolios/[id]/page.tsx`
- `app/(dashboard)/portfolios/[id]/edit/page.tsx`

---

## ⏭️ Next Feature

After completing F04, proceed to:
→ [F05: Alpha Vantage API Integration](F05_alpha_vantage_integration.md)

---

**Status Legend:**

- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPortfolio } from '@/lib/actions/portfolio'
import { toasts } from '@/lib/utils/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]

export function CreatePortfolioForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currency, setCurrency] = useState('USD')

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createPortfolio(formData)

      if (result.success) {
        toasts.portfolio.created()
        setOpen(false)
        router.refresh()
      } else {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Portfolio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
            Add a new portfolio to track your investments.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Investment Portfolio"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseCurrency">Base Currency</Label>
            <Select
              name="baseCurrency"
              value={currency}
              onValueChange={setCurrency}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Portfolio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

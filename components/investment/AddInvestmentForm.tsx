'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addInvestment } from '@/lib/actions/investment'
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

const ASSET_TYPES = [
  { value: 'STOCK', label: 'Stock' },
  { value: 'ETF', label: 'ETF' },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
  { value: 'CRYPTO', label: 'Cryptocurrency' },
]

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'BTC', 'ETH']

interface AddInvestmentFormProps {
  portfolioId: string
}

export function AddInvestmentForm({ portfolioId }: AddInvestmentFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [assetType, setAssetType] = useState('STOCK')
  const [currency, setCurrency] = useState('USD')

  async function handleSubmit(formData: FormData) {
    // Get ticker for better error messages
    const ticker = formData.get('ticker') as string

    startTransition(async () => {
      const result = await addInvestment(portfolioId, formData)

      if (result.success) {
        if (result.data?.aggregated) {
          const quantity = parseFloat(formData.get('quantity') as string)
          toasts.investment.aggregated(ticker.toUpperCase(), quantity)
        } else {
          toasts.investment.added(ticker.toUpperCase())
        }
        setOpen(false)
        router.refresh()
      } else {
        if (result.error === 'Unauthorized') {
          toasts.authError()
        } else if (result.error === 'Forbidden') {
          toasts.forbidden()
        } else if (result.error === 'Portfolio not found') {
          toasts.portfolio.notFound()
        } else if (result.error === 'Missing required fields') {
          toasts.validation.required('All fields')
        } else if (result.error?.includes('Quantity')) {
          toasts.validation.mustBePositive('Quantity')
        } else if (result.error?.includes('Price')) {
          toasts.validation.mustBePositive('Price per unit')
        } else {
          toasts.investment.addError(ticker)
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Investment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Investment</DialogTitle>
          <DialogDescription>
            Add a new investment to your portfolio. If the ticker already
            exists, it will be aggregated with weighted average cost.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol</Label>
              <Input
                id="ticker"
                name="ticker"
                placeholder="AAPL"
                required
                disabled={isPending}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type</Label>
              <Select
                value={assetType}
                onValueChange={setAssetType}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="assetType" value={assetType} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assetName">Asset Name</Label>
            <Input
              id="assetName"
              name="assetName"
              placeholder="Apple Inc."
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.00000001"
                min="0"
                placeholder="10"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit</Label>
              <Input
                id="pricePerUnit"
                name="pricePerUnit"
                type="number"
                step="0.00000001"
                min="0"
                placeholder="150.00"
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="currency" value={currency} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Additional notes..."
              disabled={isPending}
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Adding...' : 'Add Investment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

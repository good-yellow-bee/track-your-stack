'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toasts } from '@/lib/utils/toast'
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

export default function PortfolioForm({ mode, defaultValues, onSuccess }: PortfolioFormProps) {
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
        mode === 'create' ? toasts.portfolio.created() : toasts.portfolio.updated()
        form.reset()
        onSuccess?.()
        if (mode === 'create') {
          router.push('/portfolios')
        }
      } else {
        // Handle specific error types
        if (result.error?.includes('Unauthorized') || result.error?.includes('Authentication')) {
          toasts.authError()
        } else {
          mode === 'create' ? toasts.portfolio.createError() : toasts.portfolio.updateError()
        }
      }
    } catch {
      mode === 'create' ? toasts.portfolio.createError() : toasts.portfolio.updateError()
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

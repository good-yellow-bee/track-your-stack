'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toasts } from '@/lib/utils/toast'
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
        toasts.portfolio.deleted()
        router.push('/portfolios')
      } else {
        // Handle specific error types
        if (result.error?.includes('Unauthorized') || result.error?.includes('Authentication')) {
          toasts.authError()
        } else if (result.error?.includes('Forbidden') || result.error?.includes('permission')) {
          toasts.forbidden()
        } else {
          toasts.portfolio.deleteError()
        }
      }
    } catch {
      toasts.portfolio.deleteError()
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

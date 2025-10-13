'use client'

import { useEffect, useRef } from 'react'
import { toasts } from '@/lib/utils/toast'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const hasShownToast = useRef(false)

  useEffect(() => {
    // Only show toast once to prevent race conditions
    if (!hasShownToast.current) {
      // Log error to console for debugging
      console.error('Application error:', error)

      // Show user-friendly error toast
      toasts.error('Something went wrong. Please try again.')
      hasShownToast.current = true
    }
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground">
          We encountered an unexpected error. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-muted-foreground">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

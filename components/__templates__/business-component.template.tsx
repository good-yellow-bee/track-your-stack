/**
 * Business Component Template
 *
 * Use this template when creating custom components with business logic
 * that use shadcn/ui primitives (NOT Magic MCP).
 *
 * Use this for:
 * - Components with complex business calculations
 * - Components specific to your domain (portfolio, investment)
 * - Simple UI that doesn't need Magic MCP's advanced features
 *
 * Steps:
 * 1. Copy this template
 * 2. Replace placeholders with your component name
 * 3. Add your business logic and calculations
 * 4. Use shadcn/ui primitives for UI elements
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Import shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Import utilities and calculations
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { calculateGainLoss, calculateGainLossPercent } from '@/lib/calculations/investment'

// Import types
import type { Portfolio, Investment } from '@prisma/client'

interface BusinessComponentProps {
  /**
   * Main data for the component
   */
  data: any // TODO: Define specific type

  /**
   * Optional callback for actions
   */
  onAction?: () => void

  /**
   * Optional className for styling
   */
  className?: string
}

/**
 * [COMPONENT_NAME] Component
 *
 * [Brief description of what this component does]
 *
 * @example
 * ```tsx
 * <BusinessComponent
 *   data={portfolio}
 *   onAction={handleAction}
 * />
 * ```
 */
export function BusinessComponent({
  data,
  onAction,
  className,
}: BusinessComponentProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // TODO: Add your business logic calculations here
  // Example: Calculate portfolio metrics
  // const totalValue = calculateTotalValue(data)
  // const gainLoss = calculateGainLoss(data)
  // const gainLossPercent = calculateGainLossPercent(data)

  // TODO: Add your event handlers
  const handleClick = async () => {
    setIsLoading(true)
    try {
      // Business logic here
      if (onAction) {
        await onAction()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{/* TODO: Add title */}</CardTitle>

          {/* Optional: Status badge */}
          <Badge variant="secondary">{/* Status */}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* TODO: Add your content here */}

          {/* Example: Display metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Label 1</p>
              <p className="text-2xl font-bold">
                {/* TODO: Display value */}
                {/* {formatCurrency(value, currency)} */}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Label 2</p>
              <p
                className={cn(
                  'text-2xl font-bold',
                  // Conditional styling based on value
                  // gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {/* TODO: Display value */}
                {/* {formatCurrency(gainLoss, currency)} */}
              </p>
            </div>
          </div>

          {/* Example: Progress or status indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Label</span>
              <span className="font-medium">
                {/* TODO: Display percentage */}
                {/* {formatPercent(progress)} */}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  // TODO: Set width based on progress
                  // width: `${progress}%`
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Chart Component Wrapper Template
 *
 * Use this template when wrapping Magic-generated charts with business logic.
 *
 * Steps:
 * 1. Generate base chart component with Magic MCP
 * 2. Copy this template
 * 3. Replace placeholders with your component names
 * 4. Add data transformation and formatting logic
 */

'use client'

import { useState, useMemo } from 'react'

// Import your Magic-generated chart component
// TODO: Replace with actual generated component
import { YourChart } from './your-chart' // Magic-generated

// Import shadcn/ui components for controls
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Import utilities
import { formatCurrency, formatDate } from '@/lib/utils'

// Import types
import type { Portfolio, Investment } from '@prisma/client'

interface ChartWrapperProps {
  /**
   * Data to visualize
   */
  data: any[] // TODO: Define specific type

  /**
   * Chart title
   */
  title: string

  /**
   * Optional: Enable date range selector
   */
  enableDateRange?: boolean

  /**
   * Optional: Enable currency conversion
   */
  targetCurrency?: string

  /**
   * Optional: Chart type
   */
  chartType?: 'line' | 'bar' | 'pie' | 'area'
}

// Date range options
const DATE_RANGES = [
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '6 Months', value: '6M' },
  { label: '1 Year', value: '1Y' },
  { label: 'All Time', value: 'ALL' },
] as const

type DateRangeValue = (typeof DATE_RANGES)[number]['value']

/**
 * Wrapper component that adds controls and data processing to Magic-generated chart
 *
 * @example
 * ```tsx
 * <ChartWrapper
 *   data={performanceData}
 *   title="Portfolio Performance"
 *   enableDateRange={true}
 *   targetCurrency="USD"
 *   chartType="line"
 * />
 * ```
 */
export function ChartWrapper({
  data,
  title,
  enableDateRange = false,
  targetCurrency = 'USD',
  chartType = 'line',
}: ChartWrapperProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeValue>('1M')
  const [selectedChartType, setSelectedChartType] = useState(chartType)

  // Process data based on date range selection
  const filteredData = useMemo(() => {
    if (!enableDateRange || selectedDateRange === 'ALL') {
      return data
    }

    // TODO: Implement date filtering logic
    const now = new Date()
    const startDate = getStartDate(selectedDateRange, now)

    return data.filter((item) => {
      // Assuming data has a 'date' field
      // TODO: Adjust field name based on your data structure
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
  }, [data, selectedDateRange, enableDateRange])

  // Transform data for chart (calculations, formatting, etc.)
  const processedData = useMemo(() => {
    return filteredData.map((item) => ({
      ...item,
      // TODO: Add your data transformations
      // Example: Format values
      // value: formatCurrency(item.value, targetCurrency),
      // label: formatDate(item.date),
      // percentage: formatPercent(item.change),
    }))
  }, [filteredData, targetCurrency])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>

          <div className="flex items-center gap-2">
            {/* Chart type selector */}
            <Select
              value={selectedChartType}
              onValueChange={(value) => setSelectedChartType(value as any)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range selector */}
            {enableDateRange && (
              <div className="flex gap-1">
                {DATE_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant={selectedDateRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDateRange(range.value)}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Render Magic-generated chart */}
        <YourChart
          data={processedData}
          type={selectedChartType}
          // TODO: Adjust props based on your generated component's interface
        />
      </CardContent>
    </Card>
  )
}

/**
 * Helper function to calculate start date based on range
 */
function getStartDate(range: DateRangeValue, now: Date): Date {
  const date = new Date(now)

  switch (range) {
    case '1W':
      date.setDate(date.getDate() - 7)
      break
    case '1M':
      date.setMonth(date.getMonth() - 1)
      break
    case '3M':
      date.setMonth(date.getMonth() - 3)
      break
    case '6M':
      date.setMonth(date.getMonth() - 6)
      break
    case '1Y':
      date.setFullYear(date.getFullYear() - 1)
      break
    case 'ALL':
      return new Date(0) // Beginning of time
  }

  return date
}

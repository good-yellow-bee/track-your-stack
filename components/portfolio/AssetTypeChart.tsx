'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { AssetType } from '@prisma/client'

interface AssetTypeData {
  type: AssetType
  label: string
  value: number
  count: number
  percentage: number
  color: string
  [key: string]: string | number
}

interface AssetTypeChartProps {
  investments: Array<{
    assetType: AssetType
    currentValue: number
  }>
  baseCurrency: string
}

const TYPE_COLORS: Record<AssetType, string> = {
  STOCK: '#3b82f6', // blue-500
  ETF: '#10b981', // green-500
  MUTUAL_FUND: '#f59e0b', // amber-500
  CRYPTO: '#8b5cf6', // violet-500
}

const TYPE_LABELS: Record<AssetType, string> = {
  STOCK: 'Stocks',
  ETF: 'ETFs',
  MUTUAL_FUND: 'Mutual Funds',
  CRYPTO: 'Crypto',
}

export default function AssetTypeChart({ investments, baseCurrency }: AssetTypeChartProps) {
  const chartData = useMemo<AssetTypeData[]>(() => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)

    const typeMap = investments.reduce(
      (acc, inv) => {
        if (!acc[inv.assetType]) {
          acc[inv.assetType] = { value: 0, count: 0 }
        }
        acc[inv.assetType].value += inv.currentValue
        acc[inv.assetType].count += 1
        return acc
      },
      {} as Record<AssetType, { value: number; count: number }>
    )

    return Object.entries(typeMap).map(([type, data]) => ({
      type: type as AssetType,
      label: TYPE_LABELS[type as AssetType],
      value: data.value,
      count: data.count,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      color: TYPE_COLORS[type as AssetType],
    }))
  }, [investments])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card data-testid="asset-type-chart" role="img" aria-label="Asset type distribution chart">
      <CardHeader>
        <CardTitle>Asset Type Distribution</CardTitle>
        <CardDescription>Portfolio breakdown by asset class</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const entry = props.payload || props
                // Only show label if percentage >= 5%
                if (entry.percentage < 5) return ''
                return `${entry.label} ${entry.percentage.toFixed(0)}%`
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              aria-label="Asset type distribution pie chart"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  data-testid={`asset-type-segment-${entry.type}`}
                  aria-label={`${entry.label}: ${entry.percentage.toFixed(1)}%`}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload as AssetTypeData

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-semibold">{data.label}</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        Value: {formatCurrency(data.value, baseCurrency)}
                      </div>
                      <div className="text-sm">Count: {data.count} investment(s)</div>
                      <div className="text-sm">Allocation: {data.percentage.toFixed(2)}%</div>
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with color indicators */}
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs sm:gap-4 sm:text-sm">
          {chartData.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-1.5 sm:gap-2">
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">
                {entry.label} ({entry.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

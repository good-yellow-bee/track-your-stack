'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'

interface ChartData {
  name: string
  value: number
  ticker: string
  percentage: number
  color: string
  [key: string]: string | number
}

interface PortfolioPieChartProps {
  investments: Array<{
    ticker: string
    assetName: string
    currentValue: number
    percentOfPortfolio: number
  }>
  baseCurrency: string
  onSliceClick?: (ticker: string) => void
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
]

export default function PortfolioPieChart({
  investments,
  baseCurrency,
  onSliceClick,
}: PortfolioPieChartProps) {
  const chartData = useMemo<ChartData[]>(() => {
    return investments.map((inv, index) => ({
      name: inv.assetName,
      value: inv.currentValue,
      ticker: inv.ticker,
      percentage: inv.percentOfPortfolio,
      color: COLORS[index % COLORS.length],
    }))
  }, [investments])

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>No investments to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Add investments to see portfolio allocation
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatPercentLabel = (percentage: number) => {
    // Only show label if percentage is >= 3% to avoid clutter
    if (percentage < 3) return ''
    return `${percentage.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>Distribution of investments by current value</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: any) => {
                // eslint-disable-line @typescript-eslint/no-explicit-any
                const entry = props.payload || props
                const label = formatPercentLabel(entry.percentage)
                return label ? `${entry.ticker} ${label}` : ''
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={(data: ChartData) => onSliceClick?.(data.ticker)}
              style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null

                const data = payload[0].payload as ChartData

                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="font-semibold">{data.ticker}</div>
                    <div className="text-sm text-muted-foreground">{data.name}</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        Value: {formatCurrency(data.value, baseCurrency)}
                      </div>
                      <div className="text-sm">Allocation: {data.percentage.toFixed(2)}%</div>
                    </div>
                  </div>
                )
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {payload?.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-muted-foreground">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

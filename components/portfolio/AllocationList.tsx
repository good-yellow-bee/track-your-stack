import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatPercent } from '@/lib/utils/format'
import { InvestmentWithMetrics } from '@/lib/calculations/portfolio'

interface AllocationListProps {
  investments: InvestmentWithMetrics[]
  baseCurrency: string
}

export default function AllocationList({ investments, baseCurrency }: AllocationListProps) {
  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
          <CardDescription>No investments to display</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your first investment to see portfolio allocation
          </p>
        </CardContent>
      </Card>
    )
  }

  const sorted = [...investments].sort((a, b) => b.percentOfPortfolio - a.percentOfPortfolio)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <CardDescription>Portfolio distribution by investment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map(({ investment, percentOfPortfolio, metrics }) => (
          <div key={investment.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{investment.ticker}</span>
                <span className="ml-2 text-muted-foreground">{investment.assetName}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(metrics.currentValue, baseCurrency)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent(percentOfPortfolio, 1)}
                </div>
              </div>
            </div>
            <Progress value={percentOfPortfolio} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

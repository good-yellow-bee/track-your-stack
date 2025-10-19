import { Portfolio, Investment } from '@prisma/client'
import { calculatePortfolioSummary } from '@/lib/calculations/portfolio'
import { formatCurrency, formatPercent, getGainLossColor } from '@/lib/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Award } from 'lucide-react'

interface PortfolioSummaryProps {
  portfolio: Portfolio & { investments: Investment[] }
}

export default async function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const summary = await calculatePortfolioSummary(portfolio)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalValue, portfolio.baseCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">Current portfolio value</p>
        </CardContent>
      </Card>

      {/* Total Cost Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalCost, portfolio.baseCurrency)}
          </div>
          <p className="text-xs text-muted-foreground">Total invested</p>
        </CardContent>
      </Card>

      {/* Gain/Loss Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
          {summary.totalGainLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getGainLossColor(summary.totalGainLoss)}`}>
            {formatCurrency(summary.totalGainLoss, portfolio.baseCurrency)}
          </div>
          <p className={`text-xs ${getGainLossColor(summary.totalGainLossPercent)}`}>
            {formatPercent(summary.totalGainLossPercent)}
          </p>
        </CardContent>
      </Card>

      {/* Best Performer Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
          <Award className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {summary.bestPerformer ? (
            <>
              <div className="text-2xl font-bold">{summary.bestPerformer.ticker}</div>
              <p className="text-xs text-green-600">
                {(() => {
                  const investment = summary.investments.find(
                    (i) => i.investment.id === summary.bestPerformer?.id
                  )
                  return formatPercent(investment?.metrics.gainLossPercent || 0)
                })()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No investments</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

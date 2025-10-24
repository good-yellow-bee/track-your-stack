import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DeletePortfolioButton from '@/components/portfolio/DeletePortfolioButton'
import PortfolioSummary from '@/components/portfolio/PortfolioSummary'
import AllocationList from '@/components/portfolio/AllocationList'
import PortfolioPieChart from '@/components/portfolio/PortfolioPieChart'
import AssetTypeChart from '@/components/portfolio/AssetTypeChart'
import { calculatePortfolioSummary } from '@/lib/calculations/portfolio'
import { Edit, ArrowLeft, TrendingUp } from 'lucide-react'
import { TableHighlightProvider } from '@/lib/contexts/TableHighlightContext'

interface PortfolioPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.data) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `${result.data.name} - Track Your Stack`,
    description: `View and manage ${result.data.name}`,
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const portfolio = result.data
  const summary = await calculatePortfolioSummary(portfolio)

  return (
    <TableHighlightProvider>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/portfolios"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolios
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{portfolio.name}</h1>
            <p className="text-muted-foreground">Base Currency: {portfolio.baseCurrency}</p>
          </div>

          <div className="flex gap-2">
            <Link href={`/portfolios/${portfolio.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeletePortfolioButton
              portfolioId={portfolio.id}
              portfolioName={portfolio.name}
              investmentCount={portfolio.investments.length}
            />
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <PortfolioSummary portfolio={portfolio} />

        {/* Charts Section */}
        {portfolio.investments.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold tracking-tight">Visual Analysis</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <PortfolioPieChart
                investments={summary.investments.map((item) => ({
                  ticker: item.investment.ticker,
                  assetName: item.investment.assetName,
                  currentValue: item.metrics.currentValue,
                  percentOfPortfolio: item.percentOfPortfolio,
                }))}
                baseCurrency={portfolio.baseCurrency}
              />
              <AssetTypeChart
                investments={summary.investments.map((item) => ({
                  assetType: item.investment.assetType,
                  currentValue: item.metrics.currentValue,
                }))}
                baseCurrency={portfolio.baseCurrency}
              />
            </div>
          </div>
        )}

        {/* Allocation List */}
        <AllocationList investments={summary.investments} baseCurrency={portfolio.baseCurrency} />

        {/* Add Investment Button */}
        {portfolio.investments.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>Add your first investment to start tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Add investments to see portfolio allocation, charts, and performance metrics.
              </p>
              <Button asChild>
                <Link href={`/portfolios/${portfolio.id}/investments/new`}>Add Investment</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TableHighlightProvider>
  )
}

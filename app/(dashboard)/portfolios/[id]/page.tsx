import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DeletePortfolioButton from '@/components/portfolio/DeletePortfolioButton'
import { Edit, ArrowLeft } from 'lucide-react'

interface PortfolioPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.portfolio) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `${result.portfolio.name} - Track Your Stack`,
    description: `View and manage ${result.portfolio.name}`,
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.portfolio) {
    notFound()
  }

  const { portfolio } = result

  return (
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
          <p className="text-muted-foreground">
            Base Currency: {portfolio.baseCurrency}
          </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Investments</CardTitle>
          <CardDescription>
            {portfolio.investments.length === 0
              ? 'No investments yet'
              : `${portfolio.investments.length} investment(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Investment management will be implemented in F06
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

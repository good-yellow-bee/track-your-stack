import { Metadata } from 'next'
import { getPortfolios } from '@/lib/actions/portfolio'
import PortfolioList from '@/components/portfolio/PortfolioList'

export const metadata: Metadata = {
  title: 'Portfolios - Track Your Stack',
  description: 'Manage your investment portfolios',
}

export default async function PortfoliosPage() {
  const result = await getPortfolios()

  if (!result.success || !result.portfolios) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
        <p className="text-muted-foreground">Manage your investment portfolios</p>
      </div>

      <PortfolioList portfolios={result.portfolios} />
    </div>
  )
}

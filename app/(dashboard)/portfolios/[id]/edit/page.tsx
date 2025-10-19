import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPortfolio } from '@/lib/actions/portfolio'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioForm from '@/components/portfolio/PortfolioForm'

interface EditPortfolioPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditPortfolioPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.data) {
    return {
      title: 'Portfolio Not Found',
    }
  }

  return {
    title: `Edit ${result.data.name} - Track Your Stack`,
    description: `Edit ${result.data.name}`,
  }
}

export default async function EditPortfolioPage({ params }: EditPortfolioPageProps) {
  const { id } = await params
  const result = await getPortfolio(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const portfolio = result.data

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Portfolio</h1>
        <p className="text-muted-foreground">Update your portfolio details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>Update the name and base currency</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioForm
            mode="edit"
            defaultValues={{
              id: portfolio.id,
              name: portfolio.name,
              baseCurrency: portfolio.baseCurrency,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

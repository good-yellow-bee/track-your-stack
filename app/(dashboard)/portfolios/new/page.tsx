import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PortfolioForm from '@/components/portfolio/PortfolioForm'

export const metadata: Metadata = {
  title: 'Create Portfolio - Track Your Stack',
  description: 'Create a new investment portfolio',
}

export default function NewPortfolioPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Portfolio</h1>
        <p className="text-muted-foreground">Create a new portfolio to track your investments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Details</CardTitle>
          <CardDescription>
            Enter a name and select the base currency for your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}

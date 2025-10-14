import Link from 'next/link'
import { Portfolio } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import PortfolioCard from './PortfolioCard'

interface PortfolioListProps {
  portfolios: (Portfolio & { _count: { investments: number } })[]
}

export default function PortfolioList({ portfolios }: PortfolioListProps) {
  if (portfolios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Portfolios Yet</CardTitle>
          <CardDescription>
            Create your first portfolio to start tracking your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/portfolios/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Portfolios</h2>
        <Link href="/portfolios/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Portfolio
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {portfolios.map((portfolio) => (
          <PortfolioCard key={portfolio.id} portfolio={portfolio} />
        ))}
      </div>
    </div>
  )
}

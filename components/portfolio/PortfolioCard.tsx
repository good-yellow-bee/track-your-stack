import Link from 'next/link'
import { Portfolio } from '@prisma/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet } from 'lucide-react'
import { CURRENCIES } from '@/lib/constants'

interface PortfolioCardProps {
  portfolio: Portfolio & { _count: { investments: number } }
}

export default function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const currency = CURRENCIES.find((c) => c.code === portfolio.baseCurrency)

  return (
    <Link href={`/portfolios/${portfolio.id}`}>
      <Card className="transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl">{portfolio.name}</CardTitle>
            </div>
          </div>
          <CardDescription>
            {currency?.symbol} {currency?.code}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Investments</p>
              <p className="text-2xl font-bold">{portfolio._count.investments}</p>
            </div>
            <Button variant="ghost" size="sm">
              View <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

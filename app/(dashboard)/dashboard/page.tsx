import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - Track Your Stack',
  description: 'Your investment portfolio dashboard',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.name || 'Investor'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your investment portfolios and track your returns.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Create your first portfolio to start tracking your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/portfolios/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

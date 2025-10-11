import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24">
      <div className="z-10 w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Track Your Stack
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Your personal investment portfolio tracker with real-time updates
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {session ? (
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/auth/signin">Sign In with Google</Link>
            </Button>
          )}
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-3xl">📊</div>
            <h3 className="mb-1 font-semibold">Multiple Portfolios</h3>
            <p className="text-sm text-muted-foreground">
              Track different investment strategies
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl">💰</div>
            <h3 className="mb-1 font-semibold">Real-time Prices</h3>
            <p className="text-sm text-muted-foreground">
              Live market data via Alpha Vantage
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl">🌍</div>
            <h3 className="mb-1 font-semibold">Multi-currency</h3>
            <p className="text-sm text-muted-foreground">
              Support for global investments
            </p>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl">📈</div>
            <h3 className="mb-1 font-semibold">Gains & Losses</h3>
            <p className="text-sm text-muted-foreground">
              Track your portfolio performance
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

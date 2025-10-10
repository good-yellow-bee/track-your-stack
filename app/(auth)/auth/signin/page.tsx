import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import SignInButton from '@/components/auth/SignInButton'

export const metadata: Metadata = {
  title: 'Sign In - Track Your Stack',
  description: 'Sign in to your investment portfolio tracker',
}

export default async function SignInPage() {
  const session = await auth()

  // Redirect if already signed in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Track Your Stack</h1>
          <p className="mt-2 text-sm text-gray-600">Your personal investment portfolio tracker</p>
        </div>

        <div className="mt-8 space-y-4">
          <SignInButton />

          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">Features</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Track multiple portfolios
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Real-time price updates
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Multi-currency support
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              Gains & loss tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

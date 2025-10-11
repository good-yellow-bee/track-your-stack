import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication Error - Track Your Stack',
  description: 'An error occurred during authentication',
}

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    OAuthSignin: 'Error occurred while signing in with the provider.',
    OAuthCallback: 'Error occurred while processing the OAuth callback.',
    OAuthCreateAccount: 'Error occurred while creating your account.',
    EmailCreateAccount: 'Error occurred while creating your email account.',
    Callback: 'Error occurred during callback.',
    OAuthAccountNotLinked:
      'This email is already associated with another account. Please sign in using the original method.',
    EmailSignin: 'Failed to send verification email.',
    CredentialsSignin: 'Sign in failed. Check the credentials you provided.',
    SessionRequired: 'Please sign in to access this page.',
  }

  const params = await searchParams
  const error = params.error
  const message = error
    ? errorMessages[error] || 'An unexpected error occurred'
    : 'An unexpected error occurred'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Authentication Error</h1>
          <p className="mt-3 text-base text-gray-600">{message}</p>

          {error && (
            <p className="mt-2 text-sm text-gray-500">
              Error code: <code className="rounded bg-gray-100 px-2 py-1">{error}</code>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-lg bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Need help?</h3>
          <p className="mt-1 text-sm text-blue-800">If this problem persists, please try:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
            <li>Clearing your browser cookies and cache</li>
            <li>Using a different browser or incognito mode</li>
            <li>Checking your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

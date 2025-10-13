import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Track Your Stack',
  description: 'Investment Portfolio Tracker',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              success: 'border-green-500',
              error: 'border-red-500',
              warning: 'border-yellow-500',
            },
          }}
        />
      </body>
    </html>
  )
}

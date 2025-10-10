import Link from 'next/link'
import UserNav from './UserNav'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold">
          Track Your Stack
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Dashboard
          </Link>
          <Link
            href="/portfolios"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Portfolios
          </Link>
          <UserNav />
        </nav>
      </div>
    </header>
  )
}

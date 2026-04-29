import Link from 'next/link'
import { Gamepad2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Simple header */}
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Game<span className="text-primary-500">Shop</span>
          </span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  )
}

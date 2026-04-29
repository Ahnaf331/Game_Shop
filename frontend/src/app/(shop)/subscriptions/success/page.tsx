import Link from 'next/link'
import { Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/50">
      <div className="max-w-md w-full mx-4 rounded-2xl border border-gray-100 bg-white p-10 shadow-sm text-center">
        <div className="flex justify-center mb-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <Crown size={36} className="text-yellow-500" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome to Premium!</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Your subscription is now active. Enjoy exclusive discounts, double points, and early access to new releases.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link href="/catalog">
            <Button variant="outline" className="w-full">Browse Games</Button>
          </Link>
          <Link href="/profile">
            <Button className="w-full">My Account</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Library } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { paymentsApi } from '@/lib/api'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const confirmed = useRef(false)

  useEffect(() => {
    if (!orderId || confirmed.current) return
    confirmed.current = true
    paymentsApi.devSimulatePayment(orderId).catch(() => {})
  }, [orderId])

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50/50">
      <div className="max-w-md w-full mx-4 rounded-2xl border border-gray-100 bg-white p-10 shadow-sm text-center">
        <div className="flex justify-center mb-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
            <CheckCircle2 size={40} className="text-primary-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h1>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Your order has been confirmed. Your game keys will be available in your library shortly.
          You also earned loyalty points for this purchase!
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link href="/orders">
            <Button variant="outline" className="w-full gap-2">
              <Package size={15} />
              My Orders
            </Button>
          </Link>
          <Link href="/inventory">
            <Button className="w-full gap-2">
              <Library size={15} />
              My Library
            </Button>
          </Link>
        </div>

        <Link href="/catalog" className="mt-4 block text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

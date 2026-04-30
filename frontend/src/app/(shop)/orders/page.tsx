'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, Lock } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import type { Order } from '@/types'

const statusConfig: Record<Order['status'], { label: string; variant: 'green' | 'gray' | 'red' | 'yellow' }> = {
  paid: { label: 'Paid', variant: 'green' },
  pending: { label: 'Pending', variant: 'yellow' },
  failed: { label: 'Failed', variant: 'red' },
  refunded: { label: 'Refunded', variant: 'gray' },
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    ordersApi
      .getOrders()
      .then((res) => setOrders(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])


  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center page-container">
        <Lock size={40} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Sign in to view orders</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Order History</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Package size={40} className="mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">No orders yet</p>
            <p className="mt-1 text-sm text-gray-400">Your purchase history will appear here</p>
            <Link href="/catalog" className="mt-4">
              <Button size="sm">Browse Games</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
                      <Package size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

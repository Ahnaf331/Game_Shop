'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Order } from '@/types'

const statusConfig: Record<Order['status'], { label: string; variant: 'green' | 'gray' | 'red' | 'yellow' }> = {
  paid: { label: 'Paid', variant: 'green' },
  pending: { label: 'Pending', variant: 'yellow' },
  failed: { label: 'Failed', variant: 'red' },
  refunded: { label: 'Refunded', variant: 'gray' },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page-container py-8 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center page-container">
        <p className="text-gray-500">Order not found</p>
      </div>
    )
  }

  const status = statusConfig[order.status]

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <Link href="/orders" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors w-fit">
          <ArrowLeft size={14} /> My Orders
        </Link>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-gray-400">{formatDate(order.created_at)}</p>
          </div>
          <Badge variant={status.variant} size="md">{status.label}</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">Items</h2>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => {
                  const name = item.game_platform
                    ? `${item.game_platform.game?.title ?? 'Game'} (${item.game_platform.platform.name})`
                    : item.bundle?.name ?? 'Bundle'
                  return (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                          <Package size={14} className="text-primary-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.total_price)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 h-fit">
            <h2 className="mb-4 font-semibold text-gray-900">Payment</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.points_redeemed > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>Points discount</span>
                  <span>-{formatPrice(order.points_discount)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.points_redeemed > 0 && (
              <p className="mt-3 text-xs text-gray-400">
                {order.points_redeemed} loyalty points redeemed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

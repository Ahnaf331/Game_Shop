'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Lock, Tag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { ordersApi } from '@/lib/api'
import { formatPrice, getErrorMessage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/toastStore'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, subtotal } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [pointsToRedeem, setPointsToRedeem] = useState(0)

  const totalBeforePoints = subtotal()
  const pointsDiscount = Math.min(pointsToRedeem / 100, totalBeforePoints)
  const total = Math.max(0, totalBeforePoints - pointsDiscount)

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center page-container">
        <h2 className="text-xl font-bold text-gray-900">Sign in to checkout</h2>
        <p className="text-sm text-gray-500">You need an account to complete your purchase.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center page-container">
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <Link href="/catalog"><Button>Browse Games</Button></Link>
      </div>
    )
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        item_type: item.type,
        product_id: String(item.type === 'game' ? item.gamePlatformId : item.bundleId),
        quantity: item.quantity,
      }))

      const { data } = await ordersApi.createOrder({
        items: orderItems,
        points_to_redeem: pointsToRedeem,
      })

      clearCart()
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      toast.error(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setLoading(false)
    }
  }

  const maxPoints = Math.min(user?.points_balance ?? 0, Math.floor(totalBeforePoints * 100))

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <Link href="/catalog" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors w-fit">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-900">Order Summary ({items.length} items)</h2>
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.coverImage ? (
                        <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-primary-400 to-primary-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                      {item.platform && <p className="text-xs text-gray-400">{item.platform}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Points redemption */}
            {user && user.points_balance > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-primary-500" />
                  <h2 className="font-semibold text-gray-900">Loyalty Points</h2>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  You have <span className="font-semibold text-gray-900">{user.points_balance} points</span>
                  {' '}= {formatPrice(user.points_balance / 100)} discount
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={maxPoints}
                    step={100}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="flex-1 accent-primary-500"
                  />
                  <span className="text-sm font-semibold text-primary-600 w-24 text-right">
                    {pointsToRedeem > 0 ? `-${formatPrice(pointsDiscount)}` : 'None'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Price summary */}
          <div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sticky top-24">
              <h2 className="mb-4 font-semibold text-gray-900">Payment Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalBeforePoints)}</span>
                </div>
                {pointsToRedeem > 0 && (
                  <div className="flex justify-between text-primary-600">
                    <span>Points discount ({pointsToRedeem} pts)</span>
                    <span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2.5 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                className="mt-5 w-full gap-2"
                size="lg"
                onClick={handleCheckout}
                loading={loading}
              >
                <Lock size={15} />
                Pay with Stripe
              </Button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Secured by Stripe · 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

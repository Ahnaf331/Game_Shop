'use client'

import { useEffect, useState } from 'react'
import { Check, Crown, Loader2 } from 'lucide-react'
import { subscriptionsApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatPrice, getErrorMessage } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/store/toastStore'
import type { SubscriptionPlan, Subscription } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function SubscriptionsPage() {
  const { isAuthenticated } = useAuthStore()
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subsRes] = await Promise.allSettled([
          subscriptionsApi.getPlans(),
          isAuthenticated ? subscriptionsApi.getMySubscriptions() : Promise.reject(),
        ])
        if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data)
        if (subsRes.status === 'fulfilled') setMySubscriptions((subsRes.value as { data: Subscription[] }).data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const activeSub = mySubscriptions.find((s) => s.status === 'active')

  const handleSubscribe = async (planId: number) => {
    if (!isAuthenticated) { toast.error('Sign in to subscribe'); return }
    setCheckingOut(planId)
    try {
      const { data } = await subscriptionsApi.createCheckout(planId)
      window.location.href = data.checkout_url
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      toast.error(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setCheckingOut(null)
    }
  }

  const handleCancel = async (subId: string) => {
    try {
      await subscriptionsApi.cancel(subId)
      setMySubscriptions((subs) =>
        subs.map((s) => (s.id === subId ? { ...s, status: 'cancelled' } : s))
      )
      toast.success('Subscription cancelled')
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      toast.error(getErrorMessage(e?.response?.data ?? err))
    }
  }

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5">
            <Crown size={13} className="text-yellow-500" />
            <span className="text-xs font-medium text-yellow-700">Premium Membership</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose Your Plan</h1>
          <p className="mt-3 text-gray-500">Unlock exclusive deals, earn double points, and more.</p>
        </div>

        {/* Current subscription */}
        {activeSub && (
          <div className="mb-8 rounded-2xl border border-primary-200 bg-primary-50 p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown size={16} className="text-primary-600" />
                  <span className="font-semibold text-primary-800">Active: {activeSub.plan.name}</span>
                  <Badge variant="green">Active</Badge>
                </div>
                <p className="text-sm text-primary-600">
                  Renews {formatDate(activeSub.current_period_end)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(activeSub.id)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}

        {/* Plans */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6">
                <Skeleton className="h-6 w-1/2 mb-3" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((__, j) => <Skeleton key={j} className="h-4 w-full" />)}
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No plans available yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const isPopular = i === 1
              const isCurrentPlan = activeSub?.plan.id === plan.id
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 transition-all ${
                    isPopular
                      ? 'border-primary-400 bg-white shadow-lg shadow-primary-500/10 ring-1 ring-primary-400'
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white shadow">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">{formatPrice(plan.price)}</span>
                    <span className="text-sm text-gray-400">/{plan.billing_period}</span>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <Check size={14} className="text-primary-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6">
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant={isPopular ? 'primary' : 'outline'}
                        onClick={() => handleSubscribe(plan.id)}
                        loading={checkingOut === plan.id}
                      >
                        {!isAuthenticated ? 'Sign In to Subscribe' : 'Get Started'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isAuthenticated && (
          <p className="mt-8 text-center text-sm text-gray-400">
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700">Sign in</Link> or{' '}
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">create an account</Link> to subscribe.
          </p>
        )}
      </div>
    </div>
  )
}

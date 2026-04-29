'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Crown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const perks = [
  'Up to 30% off all purchases',
  'Early access to new releases',
  'Earn 2x loyalty points',
  'Exclusive members-only deals',
  'Priority customer support',
]

export function SubscriptionBanner() {
  return (
    <section className="relative overflow-hidden bg-[#0A0F1E] py-20">
      {/* Grid */}
      <div className="absolute inset-0 hero-grid opacity-60" />
      {/* Glow */}
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-primary-500/15 blur-[80px]" />

      <div className="page-container relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5">
              <Crown size={13} className="text-yellow-400" />
              <span className="text-xs font-medium text-yellow-300">Premium Membership</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
              Go Premium,
              <br />
              <span className="text-gradient">Save Big.</span>
            </h2>
            <p className="mt-5 text-gray-400 text-base leading-relaxed max-w-md">
              Unlock exclusive discounts, earn double points, and get early access to the hottest new releases. Starting at just $4.99/month.
            </p>
            <div className="mt-8">
              <Link href="/subscriptions">
                <Button size="lg" className="gap-2.5 glow-green shadow-lg shadow-primary-500/25">
                  See Premium Plans <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right — perks card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
                What you get
              </p>
              <ul className="space-y-4">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500/20">
                      <Check size={11} className="text-primary-400" />
                    </div>
                    <span className="text-sm text-gray-300">{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl border border-primary-500/20 bg-primary-500/10 p-4 text-center">
                <p className="text-2xl font-extrabold text-white">
                  $4.99<span className="text-base font-normal text-gray-400">/mo</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">Cancel anytime, no commitment</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

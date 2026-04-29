'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const floatingCards = [
  { title: 'Cyberpunk 2077', price: '$29.99', color: 'from-yellow-400 to-orange-500', delay: 0 },
  { title: 'Elden Ring', price: '$49.99', color: 'from-violet-500 to-purple-600', delay: 0.3 },
  { title: 'Baldur\'s Gate 3', price: '$59.99', color: 'from-blue-400 to-cyan-500', delay: 0.6 },
  { title: 'Hollow Knight', price: '$14.99', color: 'from-primary-400 to-primary-600', delay: 0.9 },
]

const pills = [
  { icon: Zap, label: 'Instant Delivery' },
  { icon: Shield, label: 'Secure Checkout' },
  { icon: Sparkles, label: '500+ Games' },
]

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0A0F1E]">
      {/* Grid background */}
      <div className="absolute inset-0 hero-grid opacity-100" />

      {/* Radial glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary-500/10 blur-[100px] animate-glow-pulse" />
      <div className="absolute left-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-primary-400/5 blur-[80px]" />

      <div className="page-container relative z-10 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-sm font-medium text-primary-300">500+ Games Available Now</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Level Up Your
              <br />
              <span className="text-gradient">Gaming</span>
              <br />
              Experience
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg text-gray-400 leading-relaxed"
            >
              Discover thousands of titles, get instant digital delivery, and earn points on every purchase. Your gaming universe starts here.
            </motion.p>

            {/* Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              {pills.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  <Icon size={13} className="text-primary-400" />
                  <span className="text-xs font-medium text-gray-300">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/catalog">
                <Button size="lg" className="glow-green gap-2.5 shadow-lg shadow-primary-500/25">
                  Browse Games
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/register">
                <button className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white/30">
                  Join Free
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right — floating game cards */}
          <div className="relative hidden lg:block">
            <div className="relative h-[480px]">
              {floatingCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 + card.delay }}
                  style={{
                    position: 'absolute',
                    top: `${i * 22}%`,
                    left: i % 2 === 0 ? '5%' : '35%',
                    animationDelay: `${card.delay}s`,
                  }}
                  className="animate-float"
                >
                  <div className="glass rounded-2xl p-0.5 shadow-2xl w-52">
                    <div className={`h-28 w-full rounded-xl bg-gradient-to-br ${card.color} flex items-end p-3`}>
                      <div>
                        <p className="text-xs font-medium text-white/80">PC / Console</p>
                        <p className="text-sm font-bold text-white">{card.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <span className="text-sm font-bold text-white">{card.price}</span>
                      <button className="rounded-lg bg-primary-500 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-400 transition-colors">
                        Buy
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Decorative dots */}
              <div className="absolute right-4 top-4 grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-primary-500/30" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-gray-600 p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-1.5 w-1 rounded-full bg-primary-500"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

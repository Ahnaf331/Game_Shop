'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GameCard } from '@/components/catalog/GameCard'
import { GameCardSkeleton } from '@/components/ui/Skeleton'
import { useFeaturedGames } from '@/hooks/useCatalog'

export function FeaturedGames() {
  const { games, isLoading } = useFeaturedGames()

  return (
    <section className="bg-gray-50/50 py-16">
      <div className="page-container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="section-title"
            >
              Featured Games
            </motion.h2>
            <p className="mt-1 text-sm text-gray-500">Hand-picked titles just for you</p>
          </div>
          <Link
            href="/catalog"
            className="hidden items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors sm:flex"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)
            : games.map((game, i) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
                >
                  <GameCard game={game} />
                </motion.div>
              ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600"
          >
            View all games <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}

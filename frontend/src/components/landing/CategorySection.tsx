'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Swords, Rocket, Brain, Trophy, Car, Music, Ghost, TreePine } from 'lucide-react'
import { useCatalog } from '@/hooks/useCatalog'

const categoryIcons: Record<string, React.ElementType> = {
  action: Swords,
  rpg: TreePine,
  strategy: Brain,
  sports: Trophy,
  racing: Car,
  puzzle: Ghost,
  adventure: Rocket,
  music: Music,
}

const gradients = [
  'from-red-400 to-rose-600',
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-500',
  'from-primary-400 to-emerald-600',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-blue-600',
  'from-teal-400 to-green-500',
]

export function CategorySection() {
  const { categories, isLoading } = useCatalog()

  const items = isLoading
    ? Array.from({ length: 8 }, (_, i) => ({ id: i, name: '', slug: '' }))
    : categories.slice(0, 8)

  return (
    <section className="bg-white py-16">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="section-title">Browse by Genre</h2>
          <p className="mt-1 text-sm text-gray-500">Find your perfect game type</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {items.map((cat, i) => {
            const Icon = categoryIcons[cat.slug] ?? Rocket
            const gradient = gradients[i % gradients.length]
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/catalog?category=${cat.slug}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    isLoading ? 'animate-pulse bg-gray-100' : 'bg-gray-50 hover:bg-white border border-gray-100'
                  }`}
                >
                  {!isLoading && (
                    <>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                        <Icon size={22} />
                      </div>
                      <span className="text-center text-xs font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">
                        {cat.name}
                      </span>
                    </>
                  )}
                  {isLoading && <div className="h-12 w-12 rounded-xl bg-gray-200" />}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

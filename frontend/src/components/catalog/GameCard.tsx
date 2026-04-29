'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import type { Game } from '@/types'

const PLACEHOLDER_COLORS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-cyan-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-primary-500 to-teal-600',
  'from-indigo-500 to-blue-700',
]

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const { addItem } = useCartStore()

  const cheapestPlatform = game.platforms
    .filter((p) => p.is_available)
    .sort((a, b) => parseFloat(a.effective_price) - parseFloat(b.effective_price))[0]

  const colorClass = PLACEHOLDER_COLORS[parseInt(game.id as unknown as string, 16) % PLACEHOLDER_COLORS.length]
  const hasDiscount = cheapestPlatform && parseFloat(cheapestPlatform.discount_pct) > 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!cheapestPlatform) return
    addItem({
      id: `gp-${cheapestPlatform.id}`,
      type: 'game',
      gamePlatformId: cheapestPlatform.id,
      title: game.title,
      platform: cheapestPlatform.platform.name,
      price: parseFloat(cheapestPlatform.effective_price),
      coverImage: game.cover_image,
    })
    toast.success(`${game.title} added to cart`)
  }

  return (
    <Link href={`/catalog/${game.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white card-lift shadow-sm">
        {/* Cover */}
        <div className="relative h-44 w-full overflow-hidden bg-gray-100">
          {game.cover_image ? (
            <Image
              src={game.cover_image}
              alt={game.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-end bg-gradient-to-br ${colorClass} p-3`}>
              <p className="text-xs font-bold text-white/90 drop-shadow">{game.title}</p>
            </div>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute right-2 top-2">
              <Badge variant="red" className="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white border-0">
                -{cheapestPlatform.discount_pct}%
              </Badge>
            </div>
          )}

          {/* Platform badges */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {game.platforms.slice(0, 2).map((p) => (
              <span
                key={p.id}
                className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
              >
                {p.platform.name}
              </span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-3.5">
          <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {game.title}
          </h3>

          {/* Categories */}
          {game.categories.length > 0 && (
            <p className="mb-2.5 truncate text-xs text-gray-400">
              {game.categories.slice(0, 2).map((c) => c.name).join(' · ')}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              {cheapestPlatform ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(cheapestPlatform.effective_price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(cheapestPlatform.base_price)}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">Unavailable</span>
              )}
            </div>

            {cheapestPlatform && (
              <button
                onClick={handleAddToCart}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-all duration-200 hover:bg-primary-500 hover:text-white"
              >
                <ShoppingCart size={14} />
              </button>
            )}
          </div>

          {/* Rating */}
          {game.average_rating && (
            <div className="mt-2 flex items-center gap-1">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{game.average_rating.toFixed(1)}</span>
              {game.review_count && (
                <span className="text-xs text-gray-400">({game.review_count})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

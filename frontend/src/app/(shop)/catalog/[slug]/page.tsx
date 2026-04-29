'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Star, Tag, Monitor } from 'lucide-react'
import { catalogApi } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Game, GamePlatform } from '@/types'

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<GamePlatform | null>(null)
  const { addItem } = useCartStore()

  useEffect(() => {
    catalogApi
      .getGame(slug)
      .then((res) => {
        setGame(res.data)
        const available = res.data.platforms.filter((p) => p.is_available)
        if (available.length) setSelectedPlatform(available[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!game || !selectedPlatform) return
    addItem({
      id: `gp-${selectedPlatform.id}`,
      type: 'game',
      gamePlatformId: selectedPlatform.id,
      title: game.title,
      platform: selectedPlatform.platform.name,
      price: parseFloat(selectedPlatform.current_price),
      coverImage: game.cover_image,
    })
    toast.success(`${game.title} added to cart`)
  }

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-lg font-semibold text-gray-700">Game not found</p>
        <Link href="/catalog"><Button variant="outline">Back to Store</Button></Link>
      </div>
    )
  }

  const hasDiscount = selectedPlatform && selectedPlatform.discount_percent > 0

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        {/* Breadcrumb */}
        <Link
          href="/catalog"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors w-fit"
        >
          <ArrowLeft size={14} /> Back to Store
        </Link>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Cover */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
              {game.cover_image ? (
                <Image src={game.cover_image} alt={game.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-700">
                  <p className="text-center px-8 text-xl font-bold text-white">{game.title}</p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-3">
            {/* Categories */}
            <div className="mb-3 flex flex-wrap gap-2">
              {game.categories.map((cat) => (
                <Badge key={cat.id} variant="green">{cat.name}</Badge>
              ))}
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{game.title}</h1>

            {game.developer && (
              <p className="mt-2 text-sm text-gray-500">
                by <span className="font-medium text-gray-700">{game.developer}</span>
                {game.publisher && game.publisher !== game.developer && ` · Published by ${game.publisher}`}
              </p>
            )}

            {game.average_rating && (
              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(game.average_rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                  />
                ))}
                <span className="text-sm font-semibold text-gray-700">{game.average_rating.toFixed(1)}</span>
                {game.review_count && (
                  <span className="text-xs text-gray-400">({game.review_count} reviews)</span>
                )}
              </div>
            )}

            <p className="mt-5 text-sm leading-relaxed text-gray-600">{game.description}</p>

            {/* Platform selector */}
            {game.platforms.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Select Platform
                </p>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => p.is_available && setSelectedPlatform(p)}
                      disabled={!p.is_available}
                      className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                        selectedPlatform?.id === p.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : p.is_available
                          ? 'border-gray-200 text-gray-600 hover:border-primary-300'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <Monitor size={13} />
                      {p.platform.name}
                      {!p.is_available && <span className="text-[10px]">(Out of stock)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price + CTA */}
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
              {selectedPlatform ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-gray-900">
                        {formatPrice(selectedPlatform.current_price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(selectedPlatform.base_price)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <Badge variant="red" className="mt-1">
                        <Tag size={10} className="mr-1" />
                        {selectedPlatform.discount_percent}% off
                      </Badge>
                    )}
                  </div>
                  <Button size="lg" onClick={handleAddToCart} className="gap-2">
                    <ShoppingCart size={17} />
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">This game is currently unavailable.</p>
              )}
            </div>

            {/* Meta */}
            {game.release_date && (
              <p className="mt-4 text-xs text-gray-400">Released: {game.release_date}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

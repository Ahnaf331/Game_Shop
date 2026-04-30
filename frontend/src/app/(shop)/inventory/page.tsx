'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Library, Lock, Monitor } from 'lucide-react'
import { inventoryApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import type { InventoryItem } from '@/types'

export default function InventoryPage() {
  const { isAuthenticated } = useAuthStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    inventoryApi
      .getInventory()
      .then((res) => setItems(res.data.results))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center page-container">
        <Lock size={40} className="text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900">Sign in to view your library</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
            {!loading && (
              <p className="mt-0.5 text-sm text-gray-500">{items.length} game{items.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <Library size={40} className="mb-3 text-gray-300" />
            <p className="font-semibold text-gray-700">Your library is empty</p>
            <p className="mt-1 text-sm text-gray-400">Purchase games to see them here</p>
            <Link href="/catalog" className="mt-4">
              <Button size="sm">Browse Games</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all"
              >
                {item.cover_image ? (
                  <div className="relative h-32 w-full bg-gray-100">
                    <Image src={item.cover_image} alt={item.game_title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                    <p className="text-white font-bold text-center px-4 text-sm">{item.game_title}</p>
                  </div>
                )}
                <div className="p-4">
                  <p className="font-semibold text-gray-900 truncate">{item.game_title}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Monitor size={11} />
                    {item.platform_name}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Added {formatDate(item.acquired_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

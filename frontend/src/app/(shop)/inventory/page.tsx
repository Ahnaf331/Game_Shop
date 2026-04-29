'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Library, Copy, CheckCheck, Lock } from 'lucide-react'
import { inventoryApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/toastStore'
import type { InventoryItem } from '@/types'

function KeyDisplay({ itemKey }: { itemKey: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(itemKey)
    setCopied(true)
    toast.success('Key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded-lg bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-700 border border-gray-100">
        {itemKey}
      </code>
      <button
        onClick={copy}
        className="rounded-lg p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
      >
        {copied ? <CheckCheck size={13} className="text-primary-500" /> : <Copy size={13} />}
      </button>
    </div>
  )
}

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
          <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-primary-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {item.game_platform?.game?.title ?? 'Game'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.game_platform?.platform?.name}
                    </p>
                  </div>
                  <Badge variant={item.redeemed_at ? 'gray' : 'green'}>
                    {item.redeemed_at ? 'Redeemed' : 'Available'}
                  </Badge>
                </div>
                <KeyDisplay itemKey={item.key} />
                <p className="mt-2.5 text-xs text-gray-400">
                  Added {formatDate(item.created_at)}
                  {item.redeemed_at && ` · Redeemed ${formatDate(item.redeemed_at)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

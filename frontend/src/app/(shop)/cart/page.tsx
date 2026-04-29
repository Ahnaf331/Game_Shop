'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 page-container text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
          <ShoppingCart size={32} className="text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-sm text-gray-400">Add some games to get started</p>
        <Link href="/catalog"><Button>Browse Games</Button></Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {item.coverImage ? (
                    <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-400 to-primary-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                  {item.platform && <p className="text-xs text-gray-400">{item.platform}</p>}
                  <p className="mt-1 text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <p className="w-16 text-right font-bold text-gray-900 text-sm shrink-0">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="rounded-lg p-1.5 text-gray-300 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 h-fit sticky top-24">
            <h2 className="mb-4 font-semibold text-gray-900">Summary</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold text-gray-900">{formatPrice(subtotal())}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full gap-2" size="lg">
                Proceed to Checkout <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="ghost" className="w-full mt-2 text-gray-500" size="sm">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

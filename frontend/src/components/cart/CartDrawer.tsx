'use client'

import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore()
  const total = subtotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} className="text-primary-500" />
                <span className="font-semibold text-gray-900">
                  Cart {items.length > 0 && <span className="text-gray-400 font-normal">({items.length})</span>}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                    <ShoppingCart size={28} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your cart is empty</p>
                    <p className="mt-1 text-sm text-gray-400">Add some games to get started</p>
                  </div>
                  <Link href="/catalog" onClick={closeCart}>
                    <Button size="sm">Browse Games</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3"
                    >
                      {/* Cover */}
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {item.coverImage ? (
                          <Image src={item.coverImage} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary-400 to-primary-600" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                          {item.platform && (
                            <p className="text-xs text-gray-400">{item.platform}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {/* Qty */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="self-start rounded-lg p-1 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout <ArrowRight size={16} />
                  </Button>
                </Link>
                <button
                  onClick={closeCart}
                  className="mt-2.5 w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

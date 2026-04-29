'use client'

import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-yellow-500" />,
}

const borders = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
  warning: 'border-l-yellow-500',
}

export function Toaster() {
  const { toasts, remove } = useToastStore()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-xl border-l-4 bg-white px-4 py-3 shadow-lg',
            'animate-fade-up border border-gray-100',
            borders[t.type]
          )}
        >
          <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
          <p className="flex-1 text-sm text-gray-700">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

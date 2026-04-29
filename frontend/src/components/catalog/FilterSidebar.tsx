'use client'

import { cn } from '@/lib/utils'
import type { Category, Platform } from '@/types'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FilterSidebarProps {
  categories: Category[]
  platforms: Platform[]
  selectedCategory: string
  selectedPlatform: string
  selectedSort: string
  onCategoryChange: (value: string) => void
  onPlatformChange: (value: string) => void
  onSortChange: (value: string) => void
}

const sortOptions = [
  { value: '', label: 'Relevance' },
  { value: '-created_at', label: 'Newest First' },
  { value: 'current_price', label: 'Price: Low to High' },
  { value: '-current_price', label: 'Price: High to Low' },
  { value: 'title', label: 'A–Z' },
]

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-800 hover:text-gray-900"
      >
        {title}
        <ChevronDown size={15} className={cn('transition-transform text-gray-400', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

export function FilterSidebar({
  categories,
  platforms,
  selectedCategory,
  selectedPlatform,
  selectedSort,
  onCategoryChange,
  onPlatformChange,
  onSortChange,
}: FilterSidebarProps) {
  return (
    <aside className="w-full">
      <FilterGroup title="Sort By">
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                selectedSort === opt.value
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Category">
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              !selectedCategory
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.slug)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                selectedCategory === cat.slug
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Platform">
        <div className="space-y-1">
          <button
            onClick={() => onPlatformChange('')}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              !selectedPlatform
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            All Platforms
          </button>
          {platforms.map((plat) => (
            <button
              key={plat.id}
              onClick={() => onPlatformChange(plat.slug)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                selectedPlatform === plat.slug
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {plat.name}
            </button>
          ))}
        </div>
      </FilterGroup>
    </aside>
  )
}

'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { GameCard } from '@/components/catalog/GameCard'
import { FilterSidebar } from '@/components/catalog/FilterSidebar'
import { SearchBar } from '@/components/catalog/SearchBar'
import { GameCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useGames, useCatalog } from '@/hooks/useCatalog'
import { cn } from '@/lib/utils'

function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')
  const [platform, setPlatform] = useState(searchParams.get('platform') ?? '')
  const [sort, setSort] = useState(searchParams.get('sort') ?? '')
  const [page, setPage] = useState(1)

  const { games, count, isLoading } = useGames({ search, category, platform, sort, page })
  const { categories, platforms } = useCatalog()

  const activeFiltersCount = [search, category, platform, sort].filter(Boolean).length

  const clearAll = useCallback(() => {
    setSearch('')
    setCategory('')
    setPlatform('')
    setSort('')
    setPage(1)
  }, [])

  return (
    <div className="bg-gray-50/50 min-h-screen">
      <div className="page-container py-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Game Store</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isLoading ? 'Loading...' : `${count} games available`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar value={search} onChange={setSearch} className="w-full sm:w-64" />
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className={cn(
                'relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors lg:hidden',
                sidebarOpen || activeFiltersCount > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Active filters:</span>
            {search && (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch('')}><X size={11} /></button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                {categories.find((c) => c.slug === category)?.name ?? category}
                <button onClick={() => setCategory('')}><X size={11} /></button>
              </span>
            )}
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 transition-colors font-medium">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={cn(
            'w-56 shrink-0',
            'hidden lg:block',
            sidebarOpen && 'fixed inset-0 z-30 block overflow-y-auto bg-white p-5 lg:relative lg:inset-auto lg:bg-transparent lg:p-0'
          )}>
            {sidebarOpen && (
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <span className="font-semibold text-gray-900">Filters</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            )}
            <FilterSidebar
              categories={categories}
              platforms={platforms}
              selectedCategory={category}
              selectedPlatform={platform}
              selectedSort={sort}
              onCategoryChange={(v) => { setCategory(v); setPage(1) }}
              onPlatformChange={(v) => { setPlatform(v); setPage(1) }}
              onSortChange={(v) => { setSort(v); setPage(1) }}
            />
          </div>

          {/* Game grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 12 }).map((_, i) => <GameCardSkeleton key={i} />)
                : games.map((game) => <GameCard key={game.id} game={game} />)}
            </div>

            {!isLoading && games.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                <p className="text-lg font-semibold text-gray-700">No games found</p>
                <p className="mt-1 text-sm text-gray-400">Try adjusting your search or filters</p>
                {activeFiltersCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {count > 20 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  Page {page} of {Math.ceil(count / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(count / 20)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  )
}

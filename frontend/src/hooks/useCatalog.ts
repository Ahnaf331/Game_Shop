'use client'

import { useState, useEffect } from 'react'
import { catalogApi } from '@/lib/api'
import type { Game, Category, Platform } from '@/types'

export function useFeaturedGames() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    catalogApi
      .getFeaturedGames()
      .then((res) => setGames(res.data.results))
      .catch(() => setGames([]))
      .finally(() => setIsLoading(false))
  }, [])

  return { games, isLoading }
}

export function useCatalog() {
  const [categories, setCategories] = useState<Category[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([catalogApi.getCategories(), catalogApi.getPlatforms()])
      .then(([cats, plats]) => {
        setCategories(cats.data)
        setPlatforms(plats.data)
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return { categories, platforms, isLoading }
}

interface UseGamesOptions {
  search?: string
  category?: string
  platform?: string
  sort?: string
  page?: number
}

export function useGames(options: UseGamesOptions = {}) {
  const [games, setGames] = useState<Game[]>([])
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    catalogApi
      .getGames({
        search: options.search,
        category: options.category,
        platform: options.platform,
        ordering: options.sort,
        page: options.page ?? 1,
        page_size: 20,
      })
      .then((res) => {
        setGames(res.data.results)
        setCount(res.data.count)
      })
      .catch(() => setGames([]))
      .finally(() => setIsLoading(false))
  }, [options.search, options.category, options.platform, options.sort, options.page])

  return { games, count, isLoading }
}

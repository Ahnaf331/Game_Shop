'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'
import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'

interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  clearError: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await authApi.login(email, password)
          const tokens: AuthTokens = { access: data.access, refresh: data.refresh }
          localStorage.setItem('auth_tokens', JSON.stringify(tokens))
          set({ tokens, isAuthenticated: true })
          await get().fetchProfile()
        } catch (err: unknown) {
          const e = err as { response?: { data?: unknown } }
          set({ error: getErrorMessage(e?.response?.data ?? err) })
          throw err
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const { data: res } = await authApi.register(data)
          if (res.tokens) {
            localStorage.setItem('auth_tokens', JSON.stringify(res.tokens))
            set({ tokens: res.tokens, user: res.user, isAuthenticated: true })
          }
        } catch (err: unknown) {
          const e = err as { response?: { data?: unknown } }
          set({ error: getErrorMessage(e?.response?.data ?? err) })
          throw err
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        const { tokens } = get()
        try {
          if (tokens?.refresh) await authApi.logout(tokens.refresh)
        } finally {
          localStorage.removeItem('auth_tokens')
          set({ user: null, tokens: null, isAuthenticated: false })
        }
      },

      fetchProfile: async () => {
        try {
          const { data } = await authApi.getProfile()
          set({ user: data, isAuthenticated: true })
        } catch {
          set({ user: null, tokens: null, isAuthenticated: false })
          localStorage.removeItem('auth_tokens')
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ tokens: s.tokens, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
)

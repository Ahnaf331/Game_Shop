import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type {
  User, AuthTokens, Game, Category, Platform, Order, InventoryItem,
  SubscriptionPlan, Subscription, PaginatedResponse,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const tokens = localStorage.getItem('auth_tokens')
    if (tokens) {
      const { access } = JSON.parse(tokens) as AuthTokens
      config.headers.Authorization = `Bearer ${access}`
    }
  }
  return config
})

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const tokens = localStorage.getItem('auth_tokens')
        if (!tokens) throw new Error('No tokens')
        const { refresh } = JSON.parse(tokens) as AuthTokens
        const { data } = await axios.post<{ access: string }>(`${BASE_URL}/accounts/token/refresh/`, { refresh })
        const newTokens: AuthTokens = { access: data.access, refresh }
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.removeItem('auth_tokens')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; first_name: string; last_name: string }) =>
    api.post<{ user: User; tokens: AuthTokens }>('/accounts/register/', data),

  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string; role?: string; email_verified?: boolean }>('/accounts/login/', { email, password }),

  logout: (refresh: string) =>
    api.post('/accounts/logout/', { refresh }),

  getProfile: () =>
    api.get<User>('/accounts/profile/'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/accounts/profile/', data),

  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post('/accounts/change-password/', data),

  forgotPassword: (email: string) =>
    api.post('/accounts/password/reset/', { email }),

  resetPassword: (data: { token: string; new_password: string }) =>
    api.post('/accounts/password/reset/confirm/', data),

  verifyEmail: (token: string) =>
    api.post('/accounts/verify-email/', { token }),
}

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const catalogApi = {
  getGames: (params?: Record<string, string | number | undefined>) =>
    api.get<PaginatedResponse<Game>>('/catalog/games/', { params }),

  getGame: (slug: string) =>
    api.get<Game>(`/catalog/games/${slug}/`),

  getCategories: () =>
    api.get<Category[]>('/catalog/categories/'),

  getPlatforms: () =>
    api.get<Platform[]>('/catalog/platforms/'),

  getFeaturedGames: () =>
    api.get<PaginatedResponse<Game>>('/catalog/games/', { params: { is_featured: true, page_size: 8 } }),
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  createOrder: (data: {
    items: Array<{ item_type: string; product_id: string; quantity: number }>
    points_to_redeem?: number
  }) => api.post<{ order: Order; checkout_url: string }>('/orders/checkout/', data),

  getOrders: () =>
    api.get<PaginatedResponse<Order>>('/orders/'),

  getOrder: (id: string) =>
    api.get<Order>(`/orders/${id}/`),
}

// ─── Payments ────────────────────────────────────────────────────────────────

export const paymentsApi = {
  createCheckout: (orderId: string) =>
    api.post<{ checkout_url: string }>('/payments/checkout/', { order_id: orderId }),
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export const subscriptionsApi = {
  getPlans: () =>
    api.get<SubscriptionPlan[]>('/subscriptions/plans/'),

  getMySubscriptions: () =>
    api.get<Subscription[]>('/subscriptions/my/'),

  createCheckout: (planId: number) =>
    api.post<{ checkout_url: string }>('/subscriptions/checkout/', { plan_id: planId }),

  cancel: (subscriptionId: string) =>
    api.post(`/subscriptions/${subscriptionId}/cancel/`),
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventoryApi = {
  getInventory: () =>
    api.get<PaginatedResponse<InventoryItem>>('/inventory/me/'),
}

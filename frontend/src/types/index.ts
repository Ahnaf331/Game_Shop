export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'customer' | 'admin'
  points_balance: number
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface Platform {
  id: number
  name: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
}

export interface GamePlatform {
  id: number
  platform: Platform
  game?: { title: string; slug: string; cover_image?: string | null }
  base_price: string
  effective_price: string
  discount_pct: string
  is_available: boolean
}

export interface Game {
  id: number
  title: string
  slug: string
  description: string
  cover_image: string | null
  categories: Category[]
  platforms: GamePlatform[]
  average_rating?: number
  review_count?: number
  release_date?: string
  developer?: string
  publisher?: string
  is_featured?: boolean
}

export interface BundleItem {
  id: number
  game_platform: GamePlatform
  quantity: number
}

export interface Bundle {
  id: number
  name: string
  slug: string
  description: string
  price: string
  items: BundleItem[]
  is_active: boolean
}

export interface OrderItem {
  id: number
  game_platform: GamePlatform | null
  bundle: Bundle | null
  quantity: number
  unit_price: string
  total_price: string
}

export interface Order {
  id: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  items: OrderItem[]
  subtotal: string
  points_redeemed: number
  points_discount: string
  total: string
  created_at: string
}

export interface InventoryItem {
  id: string
  game_platform: GamePlatform
  key: string
  redeemed_at: string | null
  created_at: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  description: string
  price: string
  billing_period: 'monthly' | 'yearly'
  features: string[]
  is_active: boolean
  stripe_price_id?: string
}

export interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
  cancelled_at: string | null
}

export interface Payment {
  id: string
  order: string
  amount: string
  status: 'pending' | 'succeeded' | 'failed'
  created_at: string
}

export interface CartItem {
  id: string
  type: 'game' | 'bundle'
  gamePlatformId?: number
  bundleId?: number
  title: string
  platform?: string
  price: number
  coverImage?: string | null
  quantity: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message: string
  detail?: string
  [key: string]: unknown
}

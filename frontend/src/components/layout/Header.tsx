'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ShoppingCart, Menu, X, Gamepad2, ChevronDown, User, LogOut, Package, Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { cn, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { toast } from '@/store/toastStore'

const navLinks = [
  { href: '/catalog', label: 'Store' },
  { href: '/subscriptions', label: 'Premium' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { toggleCart, itemCount } = useCartStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isHome = pathname === '/'
  const count = itemCount()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        isHome && !scrolled
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
      )}
    >
      <nav className="page-container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span
            className={cn(
              'text-lg transition-colors',
              isHome && !scrolled ? 'text-white' : 'text-gray-900'
            )}
          >
            Game<span className="text-primary-500">Shop</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-primary-50 text-primary-600'
                  : isHome && !scrolled
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <button
            onClick={toggleCart}
            className={cn(
              'relative rounded-lg p-2 transition-colors',
              isHome && !scrolled
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className={cn(
                  'hidden items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors md:flex',
                  isHome && !scrolled
                    ? 'text-white/90 hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
                  {getInitials(user.first_name, user.last_name)}
                </div>
                {user.first_name}
                <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="mt-1 text-xs font-medium text-primary-600">{user.points_balance} pts</p>
                  </div>
                  {[
                    { href: '/profile', icon: User, label: 'Profile' },
                    { href: '/orders', icon: Package, label: 'My Orders' },
                    { href: '/inventory', icon: Star, label: 'Library' },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={15} className="text-gray-400" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(isHome && !scrolled && 'text-white/80 hover:text-white hover:bg-white/10')}
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              'rounded-lg p-2 transition-colors md:hidden',
              isHome && !scrolled ? 'text-white' : 'text-gray-600'
            )}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Profile</Link>
              <button onClick={handleLogout} className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Log out</button>
            </>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button className="w-full">Sign up free</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

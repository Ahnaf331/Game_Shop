import Link from 'next/link'
import { Gamepad2, Github, Twitter, Mail } from 'lucide-react'

const links = {
  Shop: [
    { href: '/catalog', label: 'Browse Games' },
    { href: '/catalog?sort=newest', label: 'New Releases' },
    { href: '/catalog?sale=true', label: 'On Sale' },
    { href: '/subscriptions', label: 'Premium Plans' },
  ],
  Account: [
    { href: '/profile', label: 'My Profile' },
    { href: '/orders', label: 'Order History' },
    { href: '/inventory', label: 'My Library' },
    { href: '/subscriptions', label: 'Subscription' },
  ],
  Company: [
    { href: '#', label: 'About Us' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Contact' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="page-container py-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Gamepad2 size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Game<span className="text-primary-500">Shop</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-gray-500 leading-relaxed">
              Your one-stop destination for PC and console games. Discover, buy, and play instantly.
            </p>
            <div className="mt-5 flex gap-3">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-primary-300 hover:text-primary-500"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {items.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} GameShop. Portfolio project — not a real store.
          </p>
          <p className="text-xs text-gray-400">
            Built with Next.js 15 + Django REST Framework
          </p>
        </div>
      </div>
    </footer>
  )
}

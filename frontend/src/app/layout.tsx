import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/Toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'GameShop — Your Gaming Universe', template: '%s | GameShop' },
  description: 'Discover and buy the latest PC and console games at unbeatable prices.',
  keywords: ['games', 'gaming', 'buy games', 'PC games', 'console games'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

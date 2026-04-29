import { Hero } from '@/components/landing/Hero'
import { StatsSection } from '@/components/landing/StatsSection'
import { FeaturedGames } from '@/components/landing/FeaturedGames'
import { CategorySection } from '@/components/landing/CategorySection'
import { SubscriptionBanner } from '@/components/landing/SubscriptionBanner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsSection />
        <FeaturedGames />
        <CategorySection />
        <SubscriptionBanner />
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}

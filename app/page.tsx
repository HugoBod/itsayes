import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero'
import { CommunitySection } from '@/components/landing/CommunitySection'
import { NavbarEnhanced } from '@/components/landing/NavbarEnhanced'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: "It's a Yes - Professional Wedding Planning Platform",
  description: "The ultimate wedding planning platform for couples and professional planners. Manage budgets, timelines, vendors, and guests all in one place. Start planning your dream wedding today.",
  keywords: ["wedding planning", "event management", "wedding planner", "budget tracking", "vendor management", "guest management", "wedding timeline"],
  openGraph: {
    title: "It's a Yes - Professional Wedding Planning Platform",
    description: "The ultimate wedding planning platform for couples and professional planners. Manage budgets, timelines, vendors, and guests all in one place.",
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "It's a Yes Wedding Planning Platform",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "It's a Yes - Professional Wedding Planning Platform",
    description: "The ultimate wedding planning platform for couples and professional planners.",
    images: ['/og-image.jpg'],
  },
}

export default function HomePage() {
  return (
    <>
      <NavbarEnhanced />
      <main className="min-h-screen">
        <div className="min-h-screen bg-gradient-to-b from-white from-20% via-primary/60 via-50% to-primary/80">
          <Hero />
          <CommunitySection />
        </div>
      </main>
      <Footer />
    </>
  )
}

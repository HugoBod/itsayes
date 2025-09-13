'use client'

import { usePathname } from 'next/navigation'
import { NavbarEnhanced } from '@/components/landing/NavbarEnhanced'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Clean layout for individual project pages (when clicking widgets)
  // Matches: /community/[slug], /community/[id], /community/project/[id]
  // But NOT: /community (main gallery page)
  const isProjectPage = (
    (pathname.match(/^\/community\/[^\/]+$/) && !pathname.endsWith('/community')) || // /community/[slug or id]
    pathname.match(/^\/community\/project\/[^\/]+$/) // /community/project/[id]
  )

  if (isProjectPage) {
    return (
      <div className="min-h-screen bg-white">
        {/* Minimal back button - matches summary page aesthetic */}
        <header className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="bg-white/80 backdrop-blur-sm border border-neutral-200 hover:bg-white/90 text-neutral-700"
          >
            <Icon name="arrowLeft" className="mr-2 h-4 w-4" />
            Back to Community
          </Button>
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    )
  }

  // Default layout with header/footer for community gallery and other pages
  return (
    <>
      <NavbarEnhanced />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
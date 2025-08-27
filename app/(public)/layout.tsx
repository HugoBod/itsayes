import { NavbarEnhanced } from '@/components/landing/NavbarEnhanced'
import { Footer } from '@/components/landing/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
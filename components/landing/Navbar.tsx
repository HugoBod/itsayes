'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      id="secondary-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-sm' 
          : 'bg-transparent'
      }`}
      style={{
        // Aide Next.js à identifier cette navbar pour l'auto-scroll
        contain: 'layout style'
      }}
    >
      <div className={`transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className={`mx-auto px-0 sm:px-0 lg:px-1 transition-all duration-300 ${
          isScrolled ? 'max-w-4xl' : 'max-w-7xl'
        }`}>
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/90 backdrop-blur-lg rounded-full px-6 py-2 shadow-lg border border-neutral-200/50 mx-4' 
              : 'px-0'
          }`}>
            <div className="flex items-center gap-8">
              <Link href="/" className="">
                <Logo className="hidden sm:block" size="lg" />
                <Logo className="block sm:hidden" size="md" />
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link 
                  href="/community" 
                  className="text-[15px] text-neutral-700 hover:text-foreground font-medium transition-colors"
                >
                  Community
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-[15px] text-neutral-700 hover:text-foreground font-medium transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-warm hover:text-foreground hover:bg-muted/80"
                asChild
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button 
                size="sm" 
                className="btn-primary hover-lift border-0 shadow-sm"
                asChild
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
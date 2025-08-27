'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useAuthStatus } from '@/hooks/useAuthStatus'
import { onboardingService } from '@/lib/onboarding'

export function NavbarEnhanced() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, userEmail } = useAuthStatus()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
    >
      <div className={`mx-auto px-0 sm:px-0 lg:px-1 transition-all duration-500 ease-out ${
        isScrolled ? 'max-w-5xl' : 'max-w-7xl'
      }`}>
        <div className={`flex items-center justify-between transition-all duration-500 ease-out ${
          isScrolled 
            ? 'bg-white/70 backdrop-blur-2xl backdrop-saturate-150 rounded-full px-6 py-2 shadow-xl mx-4' 
            : 'px-0'
        }`}>
          <div className="flex items-center gap-8">
            <Link href="/" className="group cursor-pointer">
              <Logo className="hidden sm:block" size="md" />
              <Logo className="block sm:hidden" size="sm" />
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              <Link 
                href="/features" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Features
              </Link>
              <Link 
                href="/community" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Community
              </Link>
              <Link 
                href="/pricing" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Pricing
              </Link>
            </div>

            <div className="hidden md:flex lg:hidden items-center gap-4">
              <Link 
                href="/features" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Features
              </Link>
              <Link 
                href="/community" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Community
              </Link>
              <Link 
                href="/pricing" 
                className="text-[14px] text-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
              >
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Welcome back!</span>
                </div>
                <DashboardButton />
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-[14px] font-medium"
                  asChild
                >
                  <Link href="/auth/logout">Sign out</Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[14px] text-foreground hover:text-foreground bg-neutral-100 hover:bg-neutral-200 border-neutral-200 font-medium"
                  asChild
                >
                  <Link href="/auth/signin">Log in</Link>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 shadow-md hover:shadow-lg transition-all text-[14px] font-medium px-4"
                  asChild
                >
                  <Link href="/auth/signup">Try for free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Smart Dashboard Button - implements Phase 3 onboarding completion logic
function DashboardButton() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleDashboardClick = async () => {
    setIsChecking(true)
    try {
      // Check if onboarding is completed according to Phase 3 architecture
      console.log('🔍 Checking onboarding completion status...')
      const { completed, error } = await onboardingService.isOnboardingComplete()
      console.log('🔍 isOnboardingComplete() result:', { completed, error })
      
      if (error) {
        console.error('❌ Error checking onboarding status:', error)
        // On error, default to onboarding
        router.push('/onboarding')
        return
      }

      // Smart routing according to architecture
      if (completed) {
        console.log('✅ Onboarding completed, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('⏳ Onboarding not completed, redirecting to onboarding')
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error in dashboard click:', error)
      // Fallback to onboarding on error
      router.push('/onboarding')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-[14px] text-foreground hover:text-foreground bg-neutral-100 hover:bg-neutral-200 border-neutral-200 font-medium"
      onClick={handleDashboardClick}
      disabled={isChecking}
    >
      {isChecking ? 'Checking...' : 'Dashboard'}
    </Button>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onboardingService } from '@/lib/onboarding'
import { supabase } from '@/lib/supabase-client'

export default function PrivateLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/signin')
          return
        }

        // Check onboarding completion (client-side, same session as the working debug)
        const { completed, error } = await onboardingService.isOnboardingComplete()
        
        if (error) {
          console.error('Error checking onboarding status:', error)
          router.push('/onboarding')
          return
        }

        if (!completed) {
          console.log('🔄 Client Layout: Onboarding not completed, redirecting to /onboarding')
          router.push('/onboarding')
          return
        }
        
        console.log('✅ Client Layout: Onboarding completed, allowing access to dashboard')
        setIsAuthorized(true)
      } catch (error) {
        console.error('Error in client layout check:', error)
        router.push('/onboarding')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndOnboarding()
  }, [router])

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
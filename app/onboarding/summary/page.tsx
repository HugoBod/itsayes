'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ElegantMagazineMoodboard } from '@/components/magazine'
import { Icon } from '@/components/ui/icons'
import { Logo } from '@/components/ui/logo'
import { useOnboardingMoodboard } from '@/hooks/useOnboardingMoodboard'

export default function SummaryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { 
    onboardingData,
    isLoadingOnboarding,
    onboardingError,
    moodboard,
    isGeneratingMoodboard,
    moodboardError,
    hasGenerated,
    isReady,
    generateMoodboard,
    completeOnboardingWithMigration
  } = useOnboardingMoodboard()

  // Auto-generate moodboard when onboarding data is ready (with debounce)
  useEffect(() => {
    if (isReady && !moodboard && !isGeneratingMoodboard && !hasGenerated && !moodboardError) {
      console.log('🎨 Auto-generating moodboard...')
      
      // Small delay to prevent rapid re-renders
      const timer = setTimeout(() => {
        generateMoodboard()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isReady, moodboard, isGeneratingMoodboard, hasGenerated, moodboardError, generateMoodboard])


  // Handle completion with migration
  const handleCompleteWithMigration = useCallback(async () => {
    setIsSubmitting(true)
    
    // Navigate immediately for better UX
    router.push('/dashboard')
    
    // Run migration in background - don't block navigation
    try {
      console.log('🎯 Starting background migration...')
      
      // Non-blocking migration
      completeOnboardingWithMigration().then((result) => {
        if (!result.success) {
          console.error('❌ Background migration failed:', result.error)
        } else {
          console.log('✅ Background migration completed successfully!')
        }
      }).catch((error) => {
        console.error('Error in background migration:', error)
      })
      
    } catch (error) {
      console.error('Error starting background migration:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [completeOnboardingWithMigration, router])

  // Loading state
  if (isLoadingOnboarding || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse" style={{
          animation: 'heartbeat 1.5s ease-in-out infinite'
        }}>
          <Logo size="lg" heartColor="bg-primary" textColor="text-primary" className="scale-[3]" />
        </div>
        <style jsx>{`
          @keyframes heartbeat {
            0% { transform: scale(3); }
            50% { transform: scale(3.6); }
            100% { transform: scale(3); }
          }
        `}</style>
      </div>
    )
  }

  // Error state for onboarding data
  if (onboardingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 max-w-md">
          <Icon name="alertCircle" className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Unable to Load Your Details</h1>
            <p className="text-gray-600">{onboardingError}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/onboarding')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Icon name="arrowLeft" className="h-4 w-4 mr-2 inline" />
              Return to Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show generating state
  if (isGeneratingMoodboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse" style={{
          animation: 'heartbeat 1.5s ease-in-out infinite'
        }}>
          <Logo size="lg" heartColor="bg-primary" textColor="text-primary" className="scale-[3]" />
        </div>
        <style jsx>{`
          @keyframes heartbeat {
            0% { transform: scale(3); }
            50% { transform: scale(3.6); }
            100% { transform: scale(3); }
          }
        `}</style>
      </div>
    )
  }

  // Show moodboard error state
  if (moodboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4 max-w-md">
          <Icon name="image" className="h-16 w-16 text-gray-400 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 font-serif">Moodboard Creation Failed</h1>
            <p className="text-gray-600">{moodboardError}</p>
            <p className="text-sm text-gray-500">You can continue to your dashboard</p>
          </div>
          <button 
            onClick={handleCompleteWithMigration}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Please wait..." : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    )
  }

  // Debug logs
  console.log('🔍 Debug state:', {
    isReady,
    hasMoodboard: !!moodboard,
    isGeneratingMoodboard,
    moodboardError,
    hasGenerated,
    onboardingDataKeys: Object.keys(onboardingData || {})
  })

  // Main elegant magazine moodboard display
  if (moodboard && isReady && moodboard.source_images) {
    console.log('✅ Showing elegant magazine moodboard')
    return (
      <ElegantMagazineMoodboard
        onboardingData={onboardingData}
        moodboardData={moodboard}
        onComplete={handleCompleteWithMigration}
      />
    )
  }

  // Fallback state (should not reach here normally)
  console.log('⚠️ Fallback state reached')
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Logo size="lg" heartColor="bg-primary" textColor="text-primary" className="scale-[2]" />
        <p className="text-gray-600 font-serif mt-4">Preparing your wedding vision...</p>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-4 space-y-1">
            <p>isReady: {String(isReady)}</p>
            <p>hasMoodboard: {String(!!moodboard)}</p>
            <p>isGenerating: {String(isGeneratingMoodboard)}</p>
            <p>hasError: {String(!!moodboardError)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { MoodboardWidget } from '@/components/moodboard/MoodboardWidget'
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

  // Auto-generate moodboard when onboarding data is ready
  useEffect(() => {
    if (isReady && !moodboard && !isGeneratingMoodboard && !hasGenerated && !moodboardError) {
      console.log('🎨 Auto-generating moodboard...')
      generateMoodboard()
    }
  }, [isReady, moodboard, isGeneratingMoodboard, hasGenerated, moodboardError, generateMoodboard])


  // Handle completion with migration
  const handleCompleteWithMigration = useCallback(async () => {
    setIsSubmitting(true)
    try {
      console.log('🎯 Starting onboarding completion...')
      
      const result = await completeOnboardingWithMigration()
      
      if (!result.success) {
        console.error('❌ Onboarding completion failed:', result.error)
        // Still redirect to dashboard - user can see error there
      } else {
        console.log('✅ Onboarding completed successfully!')
      }
      
      // Redirect to main dashboard (not moodboard-reveal)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect - better than being stuck
      router.push('/dashboard')
    } finally {
      setIsSubmitting(false)
    }
  }, [completeOnboardingWithMigration, router])

  // Loading state
  if (isLoadingOnboarding || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2ED]">
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2ED]">
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2ED]">
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
      <div className="min-h-screen flex items-center justify-center bg-[#F6F2ED]">
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

  // Main cinematic moodboard experience
  if (moodboard && isReady) {
    console.log('✅ Showing cinematic moodboard')
    return (
      <MoodboardWidget
        moodboard={moodboard}
        onboardingData={onboardingData}
        onComplete={handleCompleteWithMigration}
      />
    )
  }

  // Fallback state (should not reach here normally)
  console.log('⚠️ Fallback state reached')
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F2ED]">
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
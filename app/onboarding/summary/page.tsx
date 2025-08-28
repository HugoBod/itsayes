'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { MoodboardGrid } from '@/components/moodboard/MoodboardGrid'
import { MoodboardGeneratingState } from '@/components/moodboard/MoodboardGeneratingState'
import { OnboardingDataSummary } from '@/components/onboarding/OnboardingDataSummary'
import { Icon } from '@/components/ui/icons'
import { useOnboardingMoodboard } from '@/hooks/useOnboardingMoodboard'

export default function SummaryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatingMessage, setGeneratingMessage] = useState("✨ Analyzing your style preferences")
  
  const { 
    onboardingData,
    isLoadingOnboarding,
    onboardingError,
    moodboard,
    isGeneratingMoodboard,
    moodboardError,
    hasGenerated,
    isReady,
    canProceed,
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

  // Progress loading messages during generation
  useEffect(() => {
    if (!isGeneratingMoodboard) return

    const messages = [
      "✨ Analyzing your style preferences",
      "🎨 Crafting your color palette", 
      "💝 Incorporating your special wishes",
      "🏰 Designing your perfect venue vibe",
      "✨ Adding final magical touches"
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length
      setGeneratingMessage(messages[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [isGeneratingMoodboard])

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Icon name="loader" className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-purple-600">
            {isSubmitting ? "Creating your personalized wedding journey..." : "Loading your wedding details..."}
          </p>
        </div>
      </div>
    )
  }

  // Error state for onboarding data
  if (onboardingError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4 max-w-md">
          <Icon name="alertCircle" className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Unable to Load Your Details</h1>
            <p className="text-gray-600">{onboardingError}</p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/onboarding')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Icon name="arrowLeft" className="h-4 w-4 mr-2 inline" />
              Return to Onboarding
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare left content (moodboard or loading state)
  const leftContent = () => {
    if (isGeneratingMoodboard) {
      return <MoodboardGeneratingState message={generatingMessage} variant="onboarding" />
    }
    
    if (moodboard) {
      return (
        <div className="w-full h-full">
          <MoodboardGrid
            imageUrl={moodboard.image_url}
            layout="single"
          />
        </div>
      )
    }
    
    if (moodboardError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center space-y-2 p-4">
            <Icon name="image" className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500">Moodboard generation failed</p>
            <p className="text-xs text-gray-400">You can still continue</p>
          </div>
        </div>
      )
    }
    
    // Fallback - should not reach here with auto-generation
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-2 p-4">
          <Icon name="sparkles" className="h-8 w-8 text-purple-400 mx-auto" />
          <p className="text-xs text-purple-600">Preparing your moodboard...</p>
        </div>
      </div>
    )
  }

  // Navigation handlers
  const handleBack = () => {
    router.push('/onboarding/budget-guests')
  }

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={7}
      customLeftContent={leftContent()}
      showDefaultImage={false}
      leftContentClassName="bg-white"
      title={moodboard ? "Your Wedding Vision" : "Almost Ready"}
      subtitle={moodboard ? "AI-crafted inspiration just for you" : undefined}
      description={moodboard 
        ? "We've created a personalized moodboard and summary based on your preferences. Continue to start planning your dream wedding."
        : "We're creating your personalized wedding vision. This will only take a moment..."
      }
      onBack={handleBack}
      onNext={handleCompleteWithMigration}
      nextButtonText={canProceed ? "Continue to Dashboard" : "Please wait..."}
      canProceed={canProceed}
      isNavigating={isSubmitting}
      loadingText="Creating your personalized wedding journey..."
    >
      {/* Wedding Data Summary */}
      {isReady && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Wedding Details</h3>
          <OnboardingDataSummary 
            onboardingData={onboardingData}
          />
          
          {/* Debug: Show raw data structure */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                🔍 Debug: Raw onboarding data
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(onboardingData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </OnboardingLayout>
  )
}
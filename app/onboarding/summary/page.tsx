'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { Icon } from '@/components/ui/icons'
import { useSimpleOnboardingNavigation } from '@/hooks/useOnboardingNavigation'
import { onboardingService } from '@/lib/onboarding'
import { supabase } from '@/lib/supabase-client'

interface OnboardingData {
  weddingStage?: {
    stage: string
    location: string
  }
  coupleDetails?: {
    partner1Name: string
    partner2Name: string
    weddingDate?: string
    stillDeciding?: boolean
    budgetValue: number
    currency: string
  }
  guestInfo?: {
    guestCount: number
    internationalGuests: string
    specialRequirements?: object
  }
  weddingStyle?: {
    themes?: string[]
    colorPalette?: string
  }
  experiencesExtras?: {
    ceremonyType: string
    experiences?: string[]
  }
}

export default function SummaryPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load all onboarding data from localStorage
    const weddingStage = localStorage.getItem('wedding_stage')
    const coupleDetails = localStorage.getItem('couple_details')
    const guestInfo = localStorage.getItem('guest_info')
    const weddingStyle = localStorage.getItem('wedding_style')
    const experiencesExtras = localStorage.getItem('experiences_extras')

    setOnboardingData({
      weddingStage: weddingStage ? JSON.parse(weddingStage) : undefined,
      coupleDetails: coupleDetails ? JSON.parse(coupleDetails) : undefined,
      guestInfo: guestInfo ? JSON.parse(guestInfo) : undefined,
      weddingStyle: weddingStyle ? JSON.parse(weddingStyle) : undefined,
      experiencesExtras: experiencesExtras ? JSON.parse(experiencesExtras) : undefined,
    })
  }, [])

  const handleComplete = async () => {
    setIsSubmitting(true)
    try {
      // Save final onboarding data to localStorage (for now)
      localStorage.setItem('complete_onboarding_data', JSON.stringify({
        type: 'couples',
        responses: onboardingData,
        completedAt: new Date().toISOString()
      }))
      
      // Mark onboarding as completed in Supabase
      console.log('🎯 Calling completeOnboarding()...')
      const result = await onboardingService.completeOnboarding()
      console.log('🎯 completeOnboarding() result:', result)
      
      if (!result.success) {
        console.error('❌ Failed to complete onboarding:', result.error)
        // Still redirect to dashboard even if completion fails
      } else {
        console.log('✅ Onboarding marked as completed successfully!')
      }
      
      // Use window.location instead of router.push to force server re-evaluation
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still redirect to dashboard on error
      window.location.href = '/dashboard'
    } finally {
      setIsSubmitting(false)
    }
  }

  const { handleBack, handleNext } = useSimpleOnboardingNavigation(
    6, // step number
    '/onboarding/budget-guests',
    '/dashboard'
  )

  const handleCompleteWithRedirect = () => {
    handleComplete()
  }

  // DEBUG: Direct database check
  const debugDatabaseState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🔍 DEBUG: Current user:', user?.email, user?.id)
      
      if (user) {
        const { data: workspace, error } = await supabase
          .from('workspaces')
          .select(`
            id,
            name,
            onboarding_completed_at,
            workspace_members!inner(user_id, role)
          `)
          .eq('workspace_members.user_id', user.id)
          .single()
        
        console.log('🔍 DEBUG: Workspace query result:', { workspace, error })
        console.log('🔍 DEBUG: onboarding_completed_at:', workspace?.onboarding_completed_at)
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error:', error)
    }
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Icon name="loader" className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-purple-600">Creating your personalized wedding journey...</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingLayout
      currentStep={7}
      imageIcon="checkCircle"
      imageTitle="Almost Ready"
      imageSubtitle="Your Journey Begins"
      title="Perfect! Here's what we've learned about your dream wedding."
      description="We'll use this information to create your personalized wedding planning experience."
      onBack={handleBack}
      onNext={handleCompleteWithRedirect}
      nextButtonText="Complete Setup"
      canProceed={true}
      isNavigating={false}
    >
      {/* Summary Cards */}
      <div className="space-y-4">
        {onboardingData.coupleDetails && (
          <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
            <div className="flex items-start space-x-3">
              <Icon name="heart" className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Your Love Story</h3>
                <p className="text-sm text-gray-600">
                  {onboardingData.coupleDetails.partner1Name} & {onboardingData.coupleDetails.partner2Name}
                  {onboardingData.coupleDetails.weddingDate && 
                    ` • Wedding: ${new Date(onboardingData.coupleDetails.weddingDate).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {onboardingData.guestInfo && (
          <div className="p-4 border-2 border-secondary/20 rounded-lg bg-secondary/5">
            <div className="flex items-start space-x-3">
              <Icon name="users" className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Guest Details</h3>
                <p className="text-sm text-gray-600">
                  {onboardingData.guestInfo.guestCount} guests • {onboardingData.guestInfo.internationalGuests} international
                </p>
              </div>
            </div>
          </div>
        )}

        {onboardingData.weddingStyle && (
          <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
            <div className="flex items-start space-x-3">
              <Icon name="sparkles" className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Style & Vision</h3>
                <p className="text-sm text-gray-600">
                  {onboardingData.weddingStyle.themes?.join(', ')} • {onboardingData.weddingStyle.colorPalette || 'Custom palette'}
                </p>
              </div>
            </div>
          </div>
        )}

        {onboardingData.experiencesExtras && (
          <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <div className="flex items-start space-x-3">
              <Icon name="calendar" className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Ceremony & Experiences</h3>
                <p className="text-sm text-gray-600">
                  {onboardingData.experiencesExtras.ceremonyType} ceremony • {onboardingData.experiencesExtras.experiences?.length || 0} special experiences
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* DEBUG: Temporary debug button */}
      <div className="mt-4 text-center">
        <button
          onClick={debugDatabaseState}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
        >
          🔍 Debug Database State
        </button>
      </div>
    </OnboardingLayout>
  )
}
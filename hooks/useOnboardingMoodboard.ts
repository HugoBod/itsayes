'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMoodboard } from './useMoodboard'
import { onboardingService } from '@/lib/onboarding'

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
    inspiration?: string
  }
  experiencesExtras?: {
    ceremonyType: string
    experiences?: string[]
    specialWishes?: string
  }
}

interface UseOnboardingMoodboardReturn {
  // Onboarding data
  onboardingData: OnboardingData
  isLoadingOnboarding: boolean
  onboardingError: string | null
  
  // Moodboard data (from useMoodboard hook)
  moodboard: any | null
  isGeneratingMoodboard: boolean
  moodboardError: string | null
  hasGenerated: boolean
  
  // Combined states
  isReady: boolean  // Onboarding data loaded
  canProceed: boolean  // Has moodboard or can skip + onboarding complete
  
  // Actions
  generateMoodboard: () => Promise<void>
  completeOnboardingWithMigration: () => Promise<{ success: boolean; error?: string }>
  refreshOnboardingData: () => Promise<void>
}

export function useOnboardingMoodboard(): UseOnboardingMoodboardReturn {
  const router = useRouter()
  
  // Onboarding state
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true)
  const [onboardingError, setOnboardingError] = useState<string | null>(null)
  
  // Moodboard state (using existing hook)
  const { 
    moodboard, 
    isGenerating: isGeneratingMoodboard, 
    error: moodboardError, 
    hasGenerated,
    actions: moodboardActions 
  } = useMoodboard()

  // Load onboarding data on mount
  const loadOnboardingData = useCallback(async () => {
    try {
      setIsLoadingOnboarding(true)
      setOnboardingError(null)
      
      const { data: allSteps, error } = await onboardingService.getAllSteps()
      
      if (error) {
        setOnboardingError(error)
        return
      }

      // Transform raw data to expected format
      const transformedData: OnboardingData = {}

      console.log('🔍 DEBUG: Raw allSteps data:', JSON.stringify(allSteps, null, 2))

      // Step 2: Couple details (names, date, budget, location) - ACTUAL DATA LOCATION
      if (allSteps?.step_2) {
        transformedData.coupleDetails = {
          partner1Name: allSteps.step_2.partner1Name || '',
          partner2Name: allSteps.step_2.partner2Name || '',
          weddingDate: allSteps.step_2.weddingDate,
          stillDeciding: allSteps.step_2.stillDeciding,
          budgetValue: allSteps.step_2.budgetValue || 0,
          currency: allSteps.step_2.currency || 'USD'
        }
        // Also extract wedding stage & location from step_2
        transformedData.weddingStage = {
          stage: allSteps.step_2.stage || '',
          location: allSteps.step_2.weddingLocation || ''
        }
      }

      // Step 3: Guest info - ACTUAL DATA LOCATION
      if (allSteps?.step_3) {
        transformedData.guestInfo = {
          guestCount: allSteps.step_3.guestCount || 0,
          internationalGuests: allSteps.step_3.internationalGuests || '',
          specialRequirements: allSteps.step_3.specialRequirements
        }
      }

      // Step 4: Wedding style & themes - ACTUAL DATA LOCATION
      if (allSteps?.step_4) {
        transformedData.weddingStyle = {
          themes: Array.isArray(allSteps.step_4.themes) ? allSteps.step_4.themes : 
                  allSteps.step_4.themes ? [allSteps.step_4.themes] : [],
          colorPalette: allSteps.step_4.colorPalette || allSteps.step_4.selectedColorPalette,
          inspiration: allSteps.step_4.inspiration
        }
      }

      // Step 5: Experiences & ceremony - ACTUAL DATA LOCATION
      if (allSteps?.step_5) {
        transformedData.experiencesExtras = {
          ceremonyType: allSteps.step_5.ceremonyType || '',
          experiences: allSteps.step_5.experiences || [],
          specialWishes: allSteps.step_5.specialWishes
        }
      }

      setOnboardingData(transformedData)
    } catch (error) {
      console.error('Error loading onboarding data:', error)
      setOnboardingError('Failed to load onboarding data')
    } finally {
      setIsLoadingOnboarding(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadOnboardingData()
  }, [loadOnboardingData])

  // Generate moodboard wrapper
  const generateMoodboard = useCallback(async () => {
    try {
      await moodboardActions.generateMoodboard()
    } catch (error) {
      console.error('Error generating moodboard:', error)
    }
  }, [moodboardActions])

  // Complete onboarding with migration
  const completeOnboardingWithMigration = useCallback(async () => {
    try {
      console.log('🎯 Starting onboarding completion with migration...')
      
      // Call the migration service
      const result = await onboardingService.completeOnboarding()
      
      if (!result.success) {
        console.error('❌ Migration failed:', result.error)
        return { success: false, error: result.error }
      }
      
      console.log('✅ Onboarding completed and migrated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }, [])

  // Computed states
  const isReady = !isLoadingOnboarding && Object.keys(onboardingData).length > 0
  const canProceed = isReady && (hasGenerated || moodboard !== null || moodboardError !== null)

  return {
    // Onboarding data
    onboardingData,
    isLoadingOnboarding,
    onboardingError,
    
    // Moodboard data
    moodboard,
    isGeneratingMoodboard,
    moodboardError,
    hasGenerated,
    
    // Combined states
    isReady,
    canProceed,
    
    // Actions
    generateMoodboard,
    completeOnboardingWithMigration,
    refreshOnboardingData: loadOnboardingData
  }
}

export default useOnboardingMoodboard
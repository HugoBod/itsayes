'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { onboardingService } from '@/lib/onboarding'

interface UseOnboardingNavigationOptions {
  step: number
  prevPath: string
  nextPath: string
  validateData?: () => boolean
  getStepData?: () => Record<string, any>
  loadingDelay?: number
}

interface UseOnboardingNavigationReturn {
  isNavigating: boolean
  isSaving: boolean
  error: string | null
  handleBack: () => void
  handleNext: () => Promise<void>
  setIsNavigating: (value: boolean) => void
  clearError: () => void
}

export function useOnboardingNavigation({
  step,
  prevPath,
  nextPath,
  validateData = () => true,
  getStepData = () => ({}),
  loadingDelay = 800
}: UseOnboardingNavigationOptions): UseOnboardingNavigationReturn {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleBack = useCallback(() => {
    setError(null)
    router.push(prevPath)
  }, [router, prevPath])

  const handleNext = useCallback(async () => {
    setError(null)
    
    if (!validateData()) {
      return
    }

    setIsSaving(true)
    
    try {
      const stepData = getStepData()
      const { success, error: saveError } = await onboardingService.saveStep(step, stepData)
      
      if (!success) {
        setError(saveError || 'Failed to save progress')
        setIsSaving(false)
        return
      }

      setIsNavigating(true)
      
      setTimeout(() => {
        router.push(nextPath)
      }, loadingDelay)
    } catch (err) {
      setError('An unexpected error occurred while saving')
      setIsSaving(false)
    }
  }, [step, validateData, getStepData, router, nextPath, loadingDelay])

  return {
    isNavigating,
    isSaving,
    error,
    handleBack,
    handleNext,
    setIsNavigating,
    clearError
  }
}

// Hook spécialisé pour les pages sans validation ni sauvegarde
export function useSimpleOnboardingNavigation(
  step: number,
  prevPath: string,
  nextPath: string
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    step,
    prevPath,
    nextPath,
    validateData: () => true,
    getStepData: () => ({}),
    loadingDelay: 0
  })
}

// Hook avec validation seulement
export function useValidatedOnboardingNavigation(
  step: number,
  prevPath: string,
  nextPath: string,
  validateData: () => boolean
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    step,
    prevPath,
    nextPath,
    validateData,
    getStepData: () => ({}),
    loadingDelay: 800
  })
}

// Hook complet avec validation et sauvegarde
export function useCompleteOnboardingNavigation(
  step: number,
  prevPath: string,
  nextPath: string,
  validateData: () => boolean,
  getStepData: () => Record<string, any>,
  loadingDelay = 800
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    step,
    prevPath,
    nextPath,
    validateData,
    getStepData,
    loadingDelay
  })
}

// Hook pour charger les données d'une étape depuis Supabase
export function useOnboardingStepData(step: number) {
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStepData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: stepData, error: loadError } = await onboardingService.getStep(step)
      
      if (loadError) {
        setError(loadError)
      } else {
        setData(stepData)
      }
    } catch (err) {
      setError('Failed to load step data')
    } finally {
      setLoading(false)
    }
  }, [step])

  return {
    data,
    loading,
    error,
    loadStepData
  }
}
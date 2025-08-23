'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseOnboardingNavigationOptions {
  prevPath: string
  nextPath: string
  validateData?: () => boolean
  saveData?: () => void
  loadingDelay?: number
}

interface UseOnboardingNavigationReturn {
  isNavigating: boolean
  handleBack: () => void
  handleNext: () => void
  setIsNavigating: (value: boolean) => void
}

export function useOnboardingNavigation({
  prevPath,
  nextPath,
  validateData = () => true,
  saveData = () => {},
  loadingDelay = 800
}: UseOnboardingNavigationOptions): UseOnboardingNavigationReturn {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const handleBack = useCallback(() => {
    router.push(prevPath)
  }, [router, prevPath])

  const handleNext = useCallback(() => {
    if (validateData()) {
      setIsNavigating(true)
      saveData()
      
      setTimeout(() => {
        router.push(nextPath)
      }, loadingDelay)
    }
  }, [validateData, saveData, router, nextPath, loadingDelay])

  return {
    isNavigating,
    handleBack,
    handleNext,
    setIsNavigating
  }
}

// Hook spécialisé pour les pages sans validation ni sauvegarde
export function useSimpleOnboardingNavigation(
  prevPath: string,
  nextPath: string
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    prevPath,
    nextPath,
    validateData: () => true,
    saveData: () => {},
    loadingDelay: 0
  })
}

// Hook avec validation seulement
export function useValidatedOnboardingNavigation(
  prevPath: string,
  nextPath: string,
  validateData: () => boolean
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    prevPath,
    nextPath,
    validateData,
    saveData: () => {},
    loadingDelay: 800
  })
}

// Hook complet avec validation et sauvegarde
export function useCompleteOnboardingNavigation(
  prevPath: string,
  nextPath: string,
  validateData: () => boolean,
  saveData: () => void,
  loadingDelay = 800
): UseOnboardingNavigationReturn {
  return useOnboardingNavigation({
    prevPath,
    nextPath,
    validateData,
    saveData,
    loadingDelay
  })
}
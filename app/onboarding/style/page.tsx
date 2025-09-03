'use client'

import { useState, useEffect } from 'react'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { Icon } from '@/components/ui/icons'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompleteOnboardingNavigation, useOnboardingStepData } from '@/hooks/useOnboardingNavigation'

const THEME_OPTIONS = [
  { value: 'classic', label: 'Classic', icon: 'award' },
  { value: 'modern', label: 'Modern', icon: 'target' },
  { value: 'bohemian', label: 'Bohemian', icon: 'sparkles' },
  { value: 'luxury', label: 'Luxury', icon: 'crown' },
  { value: 'rustic', label: 'Rustic', icon: 'flower' },
  { value: 'minimalist', label: 'Minimalist', icon: 'circle' }
]

const COLOR_PALETTE = [
  { name: 'Blush & Gold', colors: ['#F8BBD9', '#FFD700'] },
  { name: 'Classic White', colors: ['#FFFFFF', '#F5F5F5'] },
  { name: 'Sage & Cream', colors: ['#87A96B', '#FFF8DC'] },
  { name: 'Navy & Rose', colors: ['#1E3A5F', '#E8B4B8'] },
  { name: 'Burgundy & Gold', colors: ['#800020', '#FFD700'] },
  { name: 'Dusty Blue', colors: ['#6B8CAE', '#E6F2FF'] },
  { name: 'Terracotta & Cream', colors: ['#C65D32', '#FFF8DC'] },
  { name: 'Lavender & Silver', colors: ['#B19CD9', '#C0C0C0'] }
]

export default function WeddingStylePage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [selectedColorPalette, setSelectedColorPalette] = useState('')
  const [colorPalette, setColorPalette] = useState('')
  const [inspiration, setInspiration] = useState('')
  const [otherTheme, setOtherTheme] = useState('')

  // Load existing step data
  const { data: stepData, loadStepData } = useOnboardingStepData(4)

  useEffect(() => {
    loadStepData()
  }, [loadStepData])

  useEffect(() => {
    if (stepData) {
      setSelectedThemes(stepData.themes || [])
      setOtherTheme(stepData.otherTheme || '')
      setSelectedColorPalette(stepData.selectedColorPalette || '')
      setColorPalette(stepData.colorPalette || '')
      setInspiration(stepData.inspiration || '')
    }
  }, [stepData])

  const canProceed = selectedThemes.length > 0

  const { handleBack, handleNext, isNavigating, error } = useCompleteOnboardingNavigation(
    4, // Step number for wedding style
    '/onboarding/guest-info',
    '/onboarding/budget-guests',
    () => canProceed,
    () => ({
      themes: selectedThemes,
      otherTheme,
      selectedColorPalette,
      colorPalette,
      inspiration
    })
  )

  const handleThemeChange = (theme: string, checked: boolean) => {
    if (checked) {
      setSelectedThemes(prev => [...prev, theme])
    } else {
      setSelectedThemes(prev => prev.filter(t => t !== theme))
    }
  }

  return (
    <OnboardingLayout
      currentStep={5}
      imageIcon="sparkles"
      imageTitle="Your Style"
      imageSubtitle="Express Yourself"
      title="Your wedding should reflect your unique style."
      description="Select the tones and themes that bring your love story to life."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isNavigating={isNavigating}
      loadingText="Curating your style..."
    >
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 mb-6">
          <div className="flex items-center">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        </div>
      )}

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Which overall theme or inspiration speaks to you?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((theme) => (
            <div key={theme.value} className="flex items-center space-x-2">
              <Checkbox
                id={theme.value}
                checked={selectedThemes.includes(theme.value)}
                onCheckedChange={(checked: boolean) => handleThemeChange(theme.value, checked)}
              />
              <label htmlFor={theme.value} className="text-sm text-gray-700 cursor-pointer">
                {theme.label}
              </label>
            </div>
          ))}
        </div>
        
      </div>

      {/* Color Palette */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Do you already have a color palette in mind?
        </label>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          {COLOR_PALETTE.map((palette, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedColorPalette(palette.name)
                setColorPalette(palette.name)
              }}
              className={`cursor-pointer p-2 rounded-lg border-2 transition-all duration-200 ${
                selectedColorPalette === palette.name
                  ? 'border-primary shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex gap-1 relative">
                {palette.colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="h-8 flex-1 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {selectedColorPalette === palette.name && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="checkCircle" className="h-4 w-4 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Inspiration References */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Any references I should consider?
        </label>
        <textarea
          value={inspiration}
          onChange={(e) => setInspiration(e.target.value)}
          placeholder="Pinterest boards, celebrity weddings, mood boards, etc."
          rows={1}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm resize-none"
        />
      </div>
    </OnboardingLayout>
  )
}
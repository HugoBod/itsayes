'use client'

import { useState, useEffect } from 'react'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { OnboardingButton } from '@/components/ui/onboarding-button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompleteOnboardingNavigation, useOnboardingStepData } from '@/hooks/useOnboardingNavigation'
import { INTERNATIONAL_GUEST_OPTIONS } from '@/lib/constants'

export default function GuestInfoPage() {
  const [guestCountValue, setGuestCountValue] = useState([50])
  const [internationalGuests, setInternationalGuests] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState({
    allergies: false,
    accessibility: false,
    otherNotes: ''
  })

  // Load existing step data
  const { data: stepData, loadStepData } = useOnboardingStepData(3)

  useEffect(() => {
    loadStepData()
  }, [loadStepData])

  useEffect(() => {
    if (stepData) {
      setGuestCountValue([stepData.guestCount || 50])
      setInternationalGuests(stepData.internationalGuests || '')
      setSpecialRequirements(stepData.specialRequirements || {
        allergies: false,
        accessibility: false,
        otherNotes: ''
      })
    }
  }, [stepData])

  const canProceed = guestCountValue[0] && internationalGuests

  const { handleBack, handleNext, isNavigating, error } = useCompleteOnboardingNavigation(
    3, // Step number for guest info
    '/onboarding/couple-details',
    '/onboarding/style',
    () => canProceed,
    () => ({
      guestCount: guestCountValue[0],
      internationalGuests,
      specialRequirements
    })
  )

  const handleSpecialRequirementChange = (key: string, value: boolean | string) => {
    setSpecialRequirements(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <OnboardingLayout
      currentStep={4}
      imageIcon="users"
      imageTitle="Your Guests"
      imageSubtitle="Who Will Join You"
      title="Let's talk about your guests."
      description="Knowing a little about who will join you helps me prepare seating, meals, and travel with care."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isNavigating={isNavigating}
      loadingText="Organizing your guest details..."
    >
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 mb-6">
          <div className="flex items-center">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        </div>
      )}

      {/* Guest Count Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          How many guests are you expecting?
        </label>
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={guestCountValue}
              onValueChange={setGuestCountValue}
              max={300}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
          <div className="text-center">
            <span className="text-2xl font-semibold text-primary">
              {guestCountValue[0]} guests
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Slide to adjust your guest count
            </p>
          </div>
        </div>
      </div>

      {/* International Guests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Will some of your guests travel from abroad?
        </label>
        <div className="space-y-3">
          {INTERNATIONAL_GUEST_OPTIONS.map((option) => (
            <OnboardingButton
              key={option.value}
              title={option.title}
              icon={option.icon}
              isSelected={internationalGuests === option.value}
              onClick={() => setInternationalGuests(option.value)}
              variant="simple"
            />
          ))}
        </div>
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Any special requirements I should be aware of?
        </label>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="allergies"
                checked={specialRequirements.allergies}
                onCheckedChange={(checked: boolean) => handleSpecialRequirementChange('allergies', checked)}
              />
              <label htmlFor="allergies" className="text-sm text-gray-700 cursor-pointer">
                Food allergies / special meals
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accessibility"
                checked={specialRequirements.accessibility}
                onCheckedChange={(checked: boolean) => handleSpecialRequirementChange('accessibility', checked)}
              />
              <label htmlFor="accessibility" className="text-sm text-gray-700 cursor-pointer">
                Mobility or accessibility needs
              </label>
            </div>
          </div>

          <div>
            <textarea
              value={specialRequirements.otherNotes}
              onChange={(e) => handleSpecialRequirementChange('otherNotes', e.target.value)}
              placeholder="Other notes..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm resize-none"
            />
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
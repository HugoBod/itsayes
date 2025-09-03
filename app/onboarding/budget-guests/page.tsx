'use client'

import { useState } from 'react'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { OnboardingButton } from '@/components/ui/onboarding-button'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompleteOnboardingNavigation } from '@/hooks/useOnboardingNavigation'

const CEREMONY_TYPES = [
  { value: 'religious', label: 'Religious' },
  { value: 'civil', label: 'Civil' },
  { value: 'symbolic', label: 'Symbolic' },
  { value: 'mixed', label: 'Mixed' }
]

const RELIGIOUS_OPTIONS = [
  'Catholic',
  'Christian (non-Catholic)', 
  'Muslim',
  'Jewish',
  'Hindu',
  'Buddhist',
  'Other'
]

const EXPERIENCES = [
  { value: 'photobooth', label: 'Photobooth' },
  { value: 'live-music', label: 'Live band / DJ' },
  { value: 'traditions', label: 'Cultural or family traditions' },
  { value: 'other', label: 'Other' }
]

export default function BudgetGuestsPage() {
  const [ceremonyType, setCeremonyType] = useState('')
  const [religiousType, setReligiousType] = useState('')
  const [otherReligious, setOtherReligious] = useState('')
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([])
  const [otherExperience, setOtherExperience] = useState('')
  const [specialWishes, setSpecialWishes] = useState('')

  const canProceed = ceremonyType

  const { handleBack, handleNext, isNavigating, error } = useCompleteOnboardingNavigation(
    5, // Step number for experiences/extras
    '/onboarding/style',
    '/onboarding/summary',
    () => canProceed,
    () => ({
      ceremonyType,
      religiousType: ceremonyType === 'religious' ? religiousType : '',
      otherReligious: religiousType === 'Other' ? otherReligious : '',
      experiences: selectedExperiences,
      otherExperience,
      specialWishes
    })
  )

  const handleExperienceChange = (experience: string, checked: boolean) => {
    if (checked) {
      setSelectedExperiences(prev => [...prev, experience])
    } else {
      setSelectedExperiences(prev => prev.filter(e => e !== experience))
      if (experience === 'other') {
        setOtherExperience('')
      }
    }
  }

  return (
    <OnboardingLayout
      currentStep={6}
      imageIcon="heart"
      imageTitle="Experiences"
      imageSubtitle="Make It Memorable"
      title="Let's make your celebration unforgettable."
      description="This step is simply to share what truly matters to you."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isNavigating={isNavigating}
      loadingText="Finalizing your preferences..."
    >
      {/* Type of ceremony */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Which kind of ceremony will you have in mind (for now)?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CEREMONY_TYPES.map((ceremony) => (
            <OnboardingButton
              key={ceremony.value}
              title={ceremony.label}
              icon="heart"
              isSelected={ceremonyType === ceremony.value}
              onClick={() => setCeremonyType(ceremony.value)}
              variant="simple"
            />
          ))}
        </div>

        {/* Religious dropdown */}
        {ceremonyType === 'religious' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which religious tradition?
            </label>
            <select
              value={religiousType}
              onChange={(e) => setReligiousType(e.target.value)}
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
            >
              <option value="">Select a tradition</option>
              {RELIGIOUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            {religiousType === 'Other' && (
              <input
                type="text"
                value={otherReligious}
                onChange={(e) => setOtherReligious(e.target.value)}
                placeholder="Please specify..."
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base mt-2"
              />
            )}
          </div>
        )}
      </div>

      {/* Experiences & Entertainment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Are there any experiences or traditions you&apos;d like to include?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {EXPERIENCES.map((experience) => (
            <div key={experience.value} className="flex items-start space-x-3">
              <Checkbox
                id={experience.value}
                checked={selectedExperiences.includes(experience.value)}
                onCheckedChange={(checked: boolean) => handleExperienceChange(experience.value, checked)}
              />
              <label htmlFor={experience.value} className="text-sm text-gray-700 cursor-pointer">
                {experience.label}
              </label>
            </div>
          ))}
        </div>

        {selectedExperiences.includes('other') && (
          <input
            type="text"
            value={otherExperience}
            onChange={(e) => setOtherExperience(e.target.value)}
            placeholder="Tell us about your special experience..."
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base mt-3"
          />
        )}
      </div>

      {/* Special wishes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any must-have wishes to make your wedding stand out?
        </label>
        <textarea
          value={specialWishes}
          onChange={(e) => setSpecialWishes(e.target.value)}
          placeholder="culinary experience, unique venue, special surprise for guests..."
          rows={1}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm resize-none"
        />
      </div>
    </OnboardingLayout>
  )
}
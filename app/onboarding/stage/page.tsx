'use client'

import { useState } from 'react'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { OnboardingButton } from '@/components/ui/onboarding-button'
import { useCompleteOnboardingNavigation } from '@/hooks/useOnboardingNavigation'

const WEDDING_STAGES = [
  {
    value: 'engaged',
    title: 'Fiancé(e)',
    subtitle: 'Just got engaged and starting to dream',
    icon: 'heart',
    color: 'from-pink-500 to-rose-500'
  },
  {
    value: 'planning',
    title: 'Planning Phase',
    subtitle: 'Actively planning and making decisions',
    icon: 'calendar',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    value: 'venue-booked',
    title: 'Venue Booked',
    subtitle: 'Venue secured, working on details',
    icon: 'mapPin',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    value: 'idea-gathering',
    title: 'Idea Gathering',
    subtitle: 'Exploring styles and inspiration',
    icon: 'lightbulb',
    color: 'from-amber-500 to-orange-500'
  }
]

export default function WeddingStageSelectionPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [venueLocation, setVenueLocation] = useState('')

  const { handleBack, handleNext, isNavigating } = useCompleteOnboardingNavigation(
    2,  // step number
    '/onboarding',  // prevPath (back button)
    '/onboarding/couple-details',  // nextPath (continue button)
    () => !!selectedStage && venueLocation.trim().length > 0,  // validateData
    () => {  // getStepData
      const stageData = {
        stage: selectedStage,
        weddingLocation: venueLocation
      }
      return stageData
    }
  )

  const handleStageSelection = (stage: string) => {
    setSelectedStage(stage)
  }

  return (
    <OnboardingLayout
      currentStep={2}
      imageIcon="calendar"
      imageTitle="Your Journey"
      imageSubtitle="Every Chapter Matters"
      title="Your story deserves its own path"
      subtitle="What chapter of wedding planning are you in?"
      description="This helps me personalize your experience and provide the most relevant guidance for where you are right now."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={!!selectedStage && venueLocation.trim().length > 0}
      isNavigating={isNavigating}
      loadingText="Setting up your wedding story..."
    >
      {/* Stage Selection Grid */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {WEDDING_STAGES.map((stage) => (
            <OnboardingButton
              key={stage.value}
              title={stage.title}
              subtitle={stage.subtitle}
              icon={stage.icon}
              isSelected={selectedStage === stage.value}
              onClick={() => handleStageSelection(stage.value)}
              variant="selection"
            />
          ))}
        </div>
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 text-left">
          Wedding location
        </label>
        <input
          type="text"
          value={venueLocation}
          onChange={(e) => setVenueLocation(e.target.value)}
          placeholder="Search for a specific venue, place, city or country..."
          className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
        />
      </div>
    </OnboardingLayout>
  )
}
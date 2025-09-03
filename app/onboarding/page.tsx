'use client'

import { useState } from 'react'
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { useCompleteOnboardingNavigation } from '@/hooks/useOnboardingNavigation'

export default function OnboardingPage() {
  const [selectedType, setSelectedType] = useState<'couples' | 'planners' | null>(null)

  const { handleBack, handleNext, isNavigating } = useCompleteOnboardingNavigation(
    1,  // step number
    '/',  // prevPath (back to landing)
    '/onboarding/stage',  // nextPath (couples only for now)
    () => selectedType === 'couples',  // validateData (only couples supported)
    () => {  // getStepData
      if (selectedType === 'couples') {
        return { user_type: selectedType }
      }
      return {}
    }
  )

  const handleUserTypeSelection = (type: 'couples' | 'planners') => {
    setSelectedType(type)
  }


  return (
    <OnboardingLayout
      imageIcon="heart"
      imageTitle="Your Dream Wedding"
      imageSubtitle="Awaits Your Vision"
      title="Welcome! Every detail of your perfect day awaits."
      subtitle="Who will I have the pleasure of assisting today?"
      description="From the first 'yes' to the final details, I'll guide you every step of the way."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={!!selectedType}
      isNavigating={isNavigating}
      loadingText="Preparing your wedding journey..."
      showHeader={false}
    >
      <div className="space-y-3 sm:space-y-4">
        <Button 
          size="lg"
          variant={selectedType === 'couples' ? 'default' : 'outline'}
          className={`w-full h-12 text-base sm:text-lg font-semibold transition-all duration-200 border-2 justify-start ${
            selectedType === 'couples' 
              ? 'bg-primary hover:bg-primary-dark border-primary text-white shadow-primary' 
              : 'border-border hover:border-primary hover:bg-muted hover:text-primary bg-card text-foreground'
          } shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
          onClick={() => handleUserTypeSelection('couples')}
        >
          <Icon name="heart" className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
          We are a Couple
        </Button>

        <Button 
          size="lg"
          variant="outline"
          disabled={true}
          className="w-full h-12 text-base sm:text-lg font-semibold transition-all duration-200 border-2 justify-start border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed shadow-lg"
        >
          <Icon name="briefcase" className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
          I am a Wedding Planner (Coming Soon)
        </Button>
      </div>
    </OnboardingLayout>
  )
}
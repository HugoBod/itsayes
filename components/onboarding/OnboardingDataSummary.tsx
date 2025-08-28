'use client'

import { memo } from 'react'
import { Icon } from '@/components/ui/icons'

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
    specialRequirements?: {
      allergies?: boolean
      accessibility?: boolean
      otherNotes?: string
    }
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

interface OnboardingDataSummaryProps {
  onboardingData: OnboardingData
  className?: string
}

export const OnboardingDataSummary = memo(function OnboardingDataSummary({
  onboardingData,
  className = ''
}: OnboardingDataSummaryProps) {

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Wedding Stage & Location */}
      {onboardingData.weddingStage && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="mapPin" className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Wedding Planning</h3>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Planning Stage:</span>
              <span className="text-sm text-gray-900 capitalize">{onboardingData.weddingStage.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Wedding Location:</span>
              <span className="text-sm text-gray-900">{onboardingData.weddingStage.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Couple Details */}
      {onboardingData.coupleDetails && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="heart" className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Couple Information</h3>
          </div>
          <div className="bg-red-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Partners:</span>
              <span className="text-sm text-gray-900">
                {onboardingData.coupleDetails.partner1Name} & {onboardingData.coupleDetails.partner2Name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Wedding Date:</span>
              <span className="text-sm text-gray-900">
                {onboardingData.coupleDetails.stillDeciding 
                  ? "Still deciding" 
                  : onboardingData.coupleDetails.weddingDate 
                    ? formatDate(onboardingData.coupleDetails.weddingDate)
                    : "Not set"
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Budget:</span>
              <span className="text-sm text-gray-900">
                {onboardingData.coupleDetails.currency} {onboardingData.coupleDetails.budgetValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Guest Information */}
      {onboardingData.guestInfo && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="users" className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Guest Details</h3>
          </div>
          <div className="bg-green-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Expected Guests:</span>
              <span className="text-sm text-gray-900">{onboardingData.guestInfo.guestCount} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">International Guests:</span>
              <span className="text-sm text-gray-900 capitalize">{onboardingData.guestInfo.internationalGuests}</span>
            </div>
            {onboardingData.guestInfo.specialRequirements && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-700">Special Requirements:</span>
                <div className="ml-4 space-y-1">
                  {onboardingData.guestInfo.specialRequirements.allergies && (
                    <div className="flex items-center space-x-2">
                      <Icon name="check" className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">Allergy considerations needed</span>
                    </div>
                  )}
                  {onboardingData.guestInfo.specialRequirements.accessibility && (
                    <div className="flex items-center space-x-2">
                      <Icon name="check" className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-gray-600">Accessibility requirements</span>
                    </div>
                  )}
                  {onboardingData.guestInfo.specialRequirements.otherNotes && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500 italic">
                        "{onboardingData.guestInfo.specialRequirements.otherNotes}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wedding Style */}
      {onboardingData.weddingStyle && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="sparkles" className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Wedding Style</h3>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 space-y-3">
            {onboardingData.weddingStyle.themes && onboardingData.weddingStyle.themes.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Preferred Themes:</span>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.weddingStyle.themes.map((theme, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onboardingData.weddingStyle.colorPalette && (
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Color Palette:</span>
                <span className="text-sm text-gray-900">{onboardingData.weddingStyle.colorPalette}</span>
              </div>
            )}
            {onboardingData.weddingStyle.inspiration && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Inspiration:</span>
                <p className="text-sm text-gray-600 italic">"{onboardingData.weddingStyle.inspiration}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ceremony & Experiences */}
      {onboardingData.experiencesExtras && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="calendar" className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ceremony & Experiences</h3>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Ceremony Type:</span>
              <span className="text-sm text-gray-900 capitalize">{onboardingData.experiencesExtras.ceremonyType}</span>
            </div>
            {onboardingData.experiencesExtras.experiences && onboardingData.experiencesExtras.experiences.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-2">Special Experiences:</span>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.experiencesExtras.experiences.map((experience, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                    >
                      {experience}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onboardingData.experiencesExtras.specialWishes && (
              <div>
                <span className="text-sm font-medium text-gray-700 block mb-1">Special Wishes:</span>
                <p className="text-sm text-gray-600 italic">"{onboardingData.experiencesExtras.specialWishes}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default OnboardingDataSummary
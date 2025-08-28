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

interface OnboardingSummaryCardsProps {
  onboardingData: OnboardingData
  className?: string
  variant?: 'default' | 'compact'
}

export const OnboardingSummaryCards = memo(function OnboardingSummaryCards({
  onboardingData,
  className = '',
  variant = 'default'
}: OnboardingSummaryCardsProps) {
  const isCompact = variant === 'compact'

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Wedding Stage & Location */}
      {onboardingData.weddingStage && (
        <div className={`${isCompact ? 'p-3' : 'p-4'} border border-blue-200 rounded-lg bg-blue-50/50`}>
          <div className="flex items-start space-x-3">
            <Icon name="mapPin" className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600 mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>Planning Stage</h4>
              <p className={`text-gray-600 ${isCompact ? 'text-xs truncate' : 'text-sm'}`}>
                {onboardingData.weddingStage.stage} • {onboardingData.weddingStage.location}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Couple Details */}
      {onboardingData.coupleDetails && (
        <div className={`${isCompact ? 'p-3' : 'p-4'} border border-primary/20 rounded-lg bg-primary/5`}>
          <div className="flex items-start space-x-3">
            <Icon name="heart" className={`${isCompact ? 'h-4 w-4' : 'h-5 w-5'} text-primary mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>Your Love Story</h4>
              <p className={`text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                {onboardingData.coupleDetails.partner1Name} & {onboardingData.coupleDetails.partner2Name}
                {onboardingData.coupleDetails.weddingDate && !onboardingData.coupleDetails.stillDeciding && 
                  ` • ${new Date(onboardingData.coupleDetails.weddingDate).toLocaleDateString()}`
                }
              </p>
              {!isCompact && (
                <p className="text-sm text-gray-500 mt-1">
                  Budget: {onboardingData.coupleDetails.currency} {onboardingData.coupleDetails.budgetValue.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guest Information */}
      {onboardingData.guestInfo && (
        <div className="p-3 border border-secondary/20 rounded-lg bg-secondary/5">
          <div className="flex items-start space-x-2">
            <Icon name="users" className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm">Guest Details</h4>
              <p className="text-xs text-gray-600">
                {onboardingData.guestInfo.guestCount} guests • {onboardingData.guestInfo.internationalGuests} international
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wedding Style */}
      {onboardingData.weddingStyle && (
        <div className="p-3 border border-green-200 rounded-lg bg-green-50/50">
          <div className="flex items-start space-x-2">
            <Icon name="sparkles" className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm">Style & Vision</h4>
              <p className="text-xs text-gray-600">
                {onboardingData.weddingStyle.themes?.join(', ') || 'Custom themes'}
                {onboardingData.weddingStyle.colorPalette && ` • ${onboardingData.weddingStyle.colorPalette}`}
              </p>
              {!isCompact && onboardingData.weddingStyle.inspiration && (
                <p className="text-xs text-gray-500 mt-1 italic truncate">
                  "{onboardingData.weddingStyle.inspiration}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ceremony & Experiences */}
      {onboardingData.experiencesExtras && (
        <div className="p-3 border border-purple-200 rounded-lg bg-purple-50/50">
          <div className="flex items-start space-x-2">
            <Icon name="calendar" className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm">Ceremony & Experiences</h4>
              <p className="text-xs text-gray-600">
                {onboardingData.experiencesExtras.ceremonyType} ceremony
                {onboardingData.experiencesExtras.experiences && onboardingData.experiencesExtras.experiences.length > 0 && 
                  ` • ${onboardingData.experiencesExtras.experiences.length} special experiences`
                }
              </p>
              {!isCompact && onboardingData.experiencesExtras.specialWishes && (
                <p className="text-xs text-gray-500 mt-1 italic truncate">
                  "{onboardingData.experiencesExtras.specialWishes}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default OnboardingSummaryCards
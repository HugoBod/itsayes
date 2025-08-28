'use client'

import { memo } from 'react'
import { Icon } from '@/components/ui/icons'

interface MoodboardGeneratingStateProps {
  message?: string
  className?: string
  variant?: 'onboarding' | 'full'
}

export const MoodboardGeneratingState = memo(function MoodboardGeneratingState({
  message = "✨ Creating your unique wedding vision...",
  className = '',
  variant = 'onboarding'
}: MoodboardGeneratingStateProps) {
  const isOnboarding = variant === 'onboarding'

  return (
    <div className={`w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center ${className}`}>
      <div className="text-center space-y-4 p-6">
        {/* Animated Icons */}
        <div className="relative">
          <div className="animate-spin">
            <Icon name="sparkles" className={`${isOnboarding ? 'h-8 w-8' : 'h-12 w-12'} text-purple-600`} />
          </div>
          <div className="absolute inset-0 animate-ping">
            <Icon name="heart" className={`${isOnboarding ? 'h-8 w-8' : 'h-12 w-12'} text-pink-400 opacity-30`} />
          </div>
        </div>
        
        {/* Loading Message */}
        <div className="space-y-2">
          <p className={`${isOnboarding ? 'text-sm' : 'text-base'} font-medium text-purple-900 animate-pulse`}>
            {message}
          </p>
          {isOnboarding && (
            <p className="text-xs text-purple-600">
              This usually takes 15-30 seconds
            </p>
          )}
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-1">
          <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
          <div className="h-2 w-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
          <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  )
})

export default MoodboardGeneratingState
'use client'

import { memo } from 'react'
import { PixelHeartMicro } from '@/components/ui/icons/pixel-heart-micro'

interface LoadingProps {
  variant?: 'bounce' | 'pulse'
  size?: 'micro' | 'tiny' | 'small' | 'medium' | 'large'
  text?: string
  className?: string
}

// Basic loading component with animated PixelHeart
export const Loading = memo(function Loading({ 
  variant = 'bounce',
  size = 'medium',
  text = 'Loading...',
  className = ''
}: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <PixelHeartMicro variant={variant} size={size} />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
})

// Full page loading component
export const LoadingPage = memo(function LoadingPage({ 
  variant = 'bounce',
  size = 'large',
  text = 'Loading...',
  className = ''
}: LoadingProps) {
  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${className}`}>
      <div className="text-center space-y-6">
        <PixelHeartMicro variant={variant} size={size} />
        {text && (
          <p className="text-base text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  )
})

// Inline loading component for smaller areas
export const LoadingInline = memo(function LoadingInline({ 
  variant = 'pulse',
  size = 'small',
  text,
  className = ''
}: LoadingProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <PixelHeartMicro variant={variant} size={size} />
      {text && (
        <span className="text-xs text-gray-500 animate-pulse">{text}</span>
      )}
    </div>
  )
})

// Export alias for compatibility
export const LoadingSpinner = Loading
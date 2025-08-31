'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import { AIInsights } from '@/components/moodboard/AIInsights'

interface MoodboardData {
  image_url: string
  wedding_summary: string
  ai_insights: string[]
  style_guide: {
    color_palette: string
    style_keywords: string[]
    themes: string[]
  }
  generation_metadata: {
    prompt_used: string
    model: string
    generated_at: string
  }
}

interface MoodboardContentProps {
  moodboard: MoodboardData
  variant?: 'onboarding' | 'reveal'
  showInsights?: boolean
  maxInsights?: number
  className?: string
}

export const MoodboardContent = memo(function MoodboardContent({
  moodboard,
  variant = 'onboarding',
  showInsights = true,
  maxInsights = variant === 'onboarding' ? 3 : undefined,
  className = ''
}: MoodboardContentProps) {
  const isOnboarding = variant === 'onboarding'

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Wedding Summary */}
      <Card className={`p-4 ${isOnboarding ? 'bg-white/90' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-pink-100 rounded-full">
              <Icon name="heart" className="h-5 w-5 text-pink-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`${isOnboarding ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>
                Your Wedding Story
              </h3>
              {!isOnboarding && moodboard.generation_metadata?.generated_at && (
                <span className="text-xs text-gray-500">
                  {new Date(moodboard.generation_metadata.generated_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className={`text-gray-700 leading-relaxed ${isOnboarding ? 'text-sm' : ''}`}>
              {moodboard.wedding_summary}
            </p>
          </div>
        </div>
      </Card>

      {/* Style Guide */}
      <Card className={`p-4 ${isOnboarding ? 'bg-white/90' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="p-2 bg-purple-100 rounded-full">
              <Icon name="palette" className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className={`${isOnboarding ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-3`}>
              Your Style Guide
            </h3>
            
            <div className="space-y-3">
              {/* Color Palette */}
              <div>
                <h4 className="font-medium text-gray-800 mb-1 flex items-center text-sm">
                  <Icon name="droplet" className="h-3 w-3 mr-1 text-blue-500" />
                  Color Palette
                </h4>
                <p className="text-gray-600 text-xs bg-blue-50 p-2 rounded">
                  {moodboard.style_guide.color_palette}
                </p>
              </div>

              {/* Style Keywords */}
              <div>
                <h4 className="font-medium text-gray-800 mb-1 flex items-center text-sm">
                  <Icon name="tag" className="h-3 w-3 mr-1 text-purple-500" />
                  Style Keywords
                </h4>
                <div className="flex flex-wrap gap-1">
                  {moodboard.style_guide.style_keywords.slice(0, isOnboarding ? 4 : undefined).map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                  {isOnboarding && moodboard.style_guide.style_keywords.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{moodboard.style_guide.style_keywords.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Themes */}
              <div>
                <h4 className="font-medium text-gray-800 mb-1 flex items-center text-sm">
                  <Icon name="sparkles" className="h-3 w-3 mr-1 text-pink-500" />
                  Themes
                </h4>
                <div className="flex flex-wrap gap-1">
                  {moodboard.style_guide.themes.map((theme, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      {showInsights && (
        <AIInsights 
          insights={maxInsights ? moodboard.ai_insights.slice(0, maxInsights) : moodboard.ai_insights}
          isLoadingMore={false}
        />
      )}

      {/* Show truncation notice in onboarding */}
      {isOnboarding && maxInsights && moodboard.ai_insights.length > maxInsights && (
        <div className="text-center">
          <p className="text-xs text-gray-500">
            +{moodboard.ai_insights.length - maxInsights} more insights in your full moodboard
          </p>
        </div>
      )}
    </div>
  )
})

export default MoodboardContent
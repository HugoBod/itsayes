'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'

interface StyleGuide {
  color_palette: string
  style_keywords: string[]
  themes: string[]
}

interface WeddingCharacteristicsProps {
  weddingSummary: string
  styleGuide: StyleGuide
  generatedAt?: string
}

export const WeddingCharacteristics = memo(function WeddingCharacteristics({
  weddingSummary,
  styleGuide,
  generatedAt
}: WeddingCharacteristicsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Wedding Story */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-pink-100 rounded-full">
              <Icon name="heart" className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">Your Wedding Story</h2>
              {generatedAt && (
                <span className="text-xs text-gray-500">
                  {formatDate(generatedAt)}
                </span>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">
              {weddingSummary}
            </p>
          </div>
        </div>
      </Card>

      {/* Style Guide */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="p-3 bg-purple-100 rounded-full">
              <Icon name="palette" className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Style Guide</h2>
            
            <div className="space-y-4">
              {/* Color Palette */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Icon name="droplet" className="h-4 w-4 mr-2 text-blue-500" />
                  Color Palette
                </h3>
                <p className="text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">
                  {styleGuide.color_palette}
                </p>
              </div>

              {/* Style Keywords */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Icon name="tag" className="h-4 w-4 mr-2 text-purple-500" />
                  Style Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {styleGuide.style_keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium transition-colors hover:bg-purple-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Icon name="sparkles" className="h-4 w-4 mr-2 text-pink-500" />
                  Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {styleGuide.themes.map((theme, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium transition-colors hover:bg-pink-200"
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
    </div>
  )
})

export default WeddingCharacteristics
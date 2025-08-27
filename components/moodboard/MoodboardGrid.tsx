'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { Skeleton } from '@/components/ui/skeleton'

interface MoodboardGridProps {
  imageUrl: string | string[]  // Can be single image or array of 4 images
  onRegenerate?: () => void
  onShare?: () => void
  isRegenerating?: boolean
  layout?: '2x2' | 'single'  // Layout type
}

export const MoodboardGrid = memo(function MoodboardGrid({
  imageUrl,
  onRegenerate,
  onShare,
  isRegenerating = false,
  layout = 'single'
}: MoodboardGridProps) {
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({ 0: true })
  const [imageError, setImageError] = useState<Record<number, boolean>>({ 0: false })
  
  // Normalize imageUrl to array format and validate
  const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  const validImages = images.filter(img => img && img.trim() !== '')
  const isGrid = layout === '2x2' && validImages.length >= 4
  
  // Fallback for empty or invalid images
  const displayImages = validImages.length > 0 ? validImages : ['/images/home/moodboard/wedding-1.webp']

  // Single image render component
  const renderImage = (src: string, index: number, className?: string) => (
    <div key={index} className={`relative group ${className || ''}`}>
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
        {isRegenerating ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center space-y-2">
              <div className="animate-spin">
                <Icon name="sparkles" className="h-8 w-8 text-purple-600" />
              </div>
              {index === 0 && <p className="text-purple-600 font-medium text-sm">Regenerating...</p>}
            </div>
          </div>
        ) : (
          <>
            {imageLoading[index] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            )}
            <Image
              src={imageError[index] ? '/images/home/moodboard/wedding-1.webp' : src}
              alt={`Wedding Moodboard ${isGrid ? `Section ${index + 1}` : ''}`}
              fill
              className={`object-cover transition-transform group-hover:scale-105 ${
                imageLoading[index] ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(prev => ({ ...prev, [index]: false }))}
              onError={() => {
                setImageError(prev => ({ ...prev, [index]: true }))
                setImageLoading(prev => ({ ...prev, [index]: false }))
              }}
              priority={index === 0}
              sizes={isGrid ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            />
          </>
        )}
      </div>
    </div>
  )

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <div className="space-y-4">
        {/* Moodboard Grid */}
        <div className="relative group">
          {isGrid ? (
            /* 2x2 Grid Layout */
            <div className="grid grid-cols-2 gap-3">
              {displayImages.slice(0, 4).map((img, index) => 
                renderImage(img, index)
              )}
            </div>
          ) : (
            /* Single Image Layout */
            <div className="aspect-square">
              {renderImage(displayImages[0], 0)}
            </div>
          )}
          
          {/* Overlay Actions */}
          {!isRegenerating && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl">
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  {onRegenerate && (
                    <Button
                      onClick={onRegenerate}
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Icon name="refresh" className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  )}
                  {onShare && (
                    <Button
                      onClick={onShare}
                      variant="secondary"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Icon name="share" className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Info */}
        <div className="text-center space-y-1">
          <h3 className="font-semibold text-gray-900">Your Wedding Moodboard</h3>
          <p className="text-sm text-gray-500">
            {isGrid ? '4-section mood board tailored for you' : 'AI-generated inspiration tailored for you'}
          </p>
        </div>
      </div>
    </Card>
  )
})

export default MoodboardGrid
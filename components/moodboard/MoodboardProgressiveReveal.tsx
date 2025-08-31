'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icons'

interface MoodboardData {
  image_url: string
  wedding_summary: string
  ai_insights: string[]
  style_guide: {
    color_palette: string
    style_keywords: string[]
    themes: string[]
  }
  source_images?: {
    type: 'venue-ceremony' | 'style-decor' | 'reception-dining' | string
    url: string
    prompt_used: string
  }[]
  generation_metadata: {
    prompt_used: string
    model: string
    generated_at: string
  }
}

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
    selectedColorPalette?: string
    inspiration?: string
  }
  experiencesExtras?: {
    ceremonyType: string
    experiences?: string[]
    specialWishes?: string
  }
}

interface MoodboardProgressiveRevealProps {
  moodboard: MoodboardData | null
  onboardingData?: OnboardingData
  isGenerating: boolean
  onComplete?: () => void
  className?: string
}

type RevealStage = 'loading' | 'palette-reveal' | 'images-reveal' | 'complete'

export function MoodboardProgressiveReveal({
  moodboard,
  onboardingData,
  isGenerating,
  onComplete,
  className = ''
}: MoodboardProgressiveRevealProps) {
  const [currentStage, setCurrentStage] = useState<RevealStage>('loading')
  const [microTextIndex, setMicroTextIndex] = useState(0)
  const [revealedImages, setRevealedImages] = useState<number[]>([])
  const [showPalette, setShowPalette] = useState(false)

  const microTexts = [
    "We're preparing something magical for you…",
    "Adding your unique floral touch 💍",
    "Crafting your perfect atmosphere ✨",
    "Weaving dreams into reality 🌸",
    "Creating your wedding story 💝"
  ]

  // Reset when generation starts
  useEffect(() => {
    if (isGenerating) {
      setCurrentStage('loading')
      setRevealedImages([])
      setShowPalette(false)
      setMicroTextIndex(0)
    }
  }, [isGenerating])

  // Cycle through micro-texts every 2.5 seconds during loading
  useEffect(() => {
    if (currentStage === 'loading') {
      const interval = setInterval(() => {
        setMicroTextIndex(prev => (prev + 1) % microTexts.length)
      }, 2500)
      
      return () => clearInterval(interval)
    }
  }, [currentStage, microTexts.length])

  // Start progression when moodboard is ready
  useEffect(() => {
    if (!moodboard || isGenerating) return

    // Step 1: Show palette after 5 seconds
    const paletteTimer = setTimeout(() => {
      setShowPalette(true)
      setCurrentStage('palette-reveal')
    }, 5000)

    // Step 2: Start image reveals after 6 seconds
    const imageTimer = setTimeout(() => {
      setCurrentStage('images-reveal')
      
      // Reveal images one by one with 0.5s stagger
      const revealTimers = [0, 500, 1000].map((delay, index) => 
        setTimeout(() => {
          setRevealedImages(prev => [...prev, index])
        }, delay)
      )

      // Complete after all images + final celebration
      setTimeout(() => {
        setCurrentStage('complete')
        onComplete?.()
      }, 4000)

      return () => revealTimers.forEach(clearTimeout)
    }, 6000)

    return () => {
      clearTimeout(paletteTimer)
      clearTimeout(imageTimer)
    }
  }, [moodboard, isGenerating, onComplete])

  // Get actual selected color palette from user onboarding data
  const getSelectedColorPalette = () => {
    const COLOR_PALETTES = [
      { name: 'Blush & Gold', colors: ['#F8BBD9', '#FFD700'], displayName: 'Blush' },
      { name: 'Classic White', colors: ['#FFFFFF', '#F5F5F5'], displayName: 'Classic' },
      { name: 'Sage & Cream', colors: ['#87A96B', '#FFF8DC'], displayName: 'Sage' },
      { name: 'Navy & Rose', colors: ['#1E3A5F', '#E8B4B8'], displayName: 'Navy' },
      { name: 'Burgundy & Gold', colors: ['#800020', '#FFD700'], displayName: 'Burgundy' },
      { name: 'Dusty Blue', colors: ['#6B8CAE', '#E6F2FF'], displayName: 'Dusty Blue' },
      { name: 'Terracotta & Cream', colors: ['#C65D32', '#FFF8DC'], displayName: 'Terracotta' },
      { name: 'Lavender & Silver', colors: ['#B19CD9', '#C0C0C0'], displayName: 'Lavender' }
    ]

    const selectedPaletteName = onboardingData?.weddingStyle?.selectedColorPalette || onboardingData?.weddingStyle?.colorPalette
    
    if (selectedPaletteName) {
      const selectedPalette = COLOR_PALETTES.find(p => p.name === selectedPaletteName)
      if (selectedPalette) {
        return selectedPalette
      }
    }
    
    return COLOR_PALETTES[0] // Fallback
  }

  const selectedPalette = getSelectedColorPalette()

  // Skeleton loader component
  const SkeletonTile = ({ className = '' }) => (
    <div className={`relative bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl overflow-hidden ${className}`}>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
    </div>
  )

  // Color palette tile
  const ColorPaletteTile = () => (
    <div className={`relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 h-full w-full flex flex-col items-center justify-center transition-all duration-700 ${
      showPalette ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      {showPalette && (
        <>
          <div className="text-center space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Your Colors</h3>
            <div className="flex space-x-3">
              {selectedPalette.colors.map((color, index) => (
                <div 
                  key={index}
                  className="w-12 h-12 rounded-full border-4 border-white/90 shadow-lg"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600">{selectedPalette.name}</p>
          </div>
        </>
      )}
    </div>
  )

  // Image tile with reveal animation
  const ImageTile = ({ imageUrl, index, animationType }: { imageUrl: string, index: number, animationType: 'wipe' | 'slide' | 'scale' }) => {
    const isRevealed = revealedImages.includes(index)
    
    const getAnimationClasses = () => {
      if (!isRevealed) return 'opacity-0 scale-95'
      
      switch (animationType) {
        case 'wipe':
          return 'opacity-100 scale-105 animate-fade-in duration-1000'
        case 'slide':
          return 'opacity-100 translate-y-0 animate-fade-in duration-1000'
        case 'scale':
          return 'opacity-100 scale-100 animate-bounce duration-1000'
        default:
          return 'opacity-100 scale-100'
      }
    }

    return (
      <div className="relative bg-gray-200 rounded-xl overflow-hidden h-full w-full">
        {!isRevealed ? (
          <SkeletonTile />
        ) : (
          <div className={`relative w-full h-full transition-all ${getAnimationClasses()}`}>
            <img
              src={imageUrl}
              alt={`Wedding inspiration ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col justify-center p-6 ${className}`}>
      {/* 2x2 Grid */}
      <div className="w-full h-full max-w-none flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 w-full h-[70vh] max-h-[500px] mb-4">
          {/* Image Tiles */}
          {moodboard?.source_images?.slice(0, 3).map((image, index) => (
            <ImageTile 
              key={index}
              imageUrl={image.url}
              index={index}
              animationType={index === 0 ? 'wipe' : index === 1 ? 'slide' : 'scale'}
            />
          ))}
          
          {/* Color Palette Tile */}
          <ColorPaletteTile />
        </div>
      </div>

      {/* Loading Messages */}
      {currentStage === 'loading' && (
        <div className="text-center space-y-2 animate-fade-in mt-4">
          <div className="flex items-center justify-center space-x-2">
            <Icon name="sparkles" className="h-5 w-5 text-purple-500 animate-spin" />
            <p className="text-base text-purple-700 font-medium">
              {microTexts[microTextIndex]}
            </p>
          </div>
        </div>
      )}

      {/* Celebration Message */}
      {currentStage === 'complete' && (
        <div className="text-center animate-fade-in delay-500 mt-4">
          <p className="text-xl font-semibold text-purple-800 mb-2">
            Here's your wedding preview 💍✨
          </p>
          <p className="text-base text-purple-600">
            Your magical wedding vision awaits
          </p>
        </div>
      )}
    </div>
  )
}

export default MoodboardProgressiveReveal
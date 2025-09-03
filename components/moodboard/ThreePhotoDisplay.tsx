'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Icon } from '@/components/ui/icons'
import { generate4ColorPalette, getPaletteName } from '@/lib/color-palette-generator'

interface ThreePhotoDisplayProps {
  sourceImages: {
    type: string
    url: string
    prompt_used: string
    generation_metadata?: {
      category?: string
      elements_included?: string[]
    }
  }[]
  onboardingData: any
  moodboard?: any // Pour accéder à style_guide
  onComplete?: () => void
  className?: string
}

export const ThreePhotoDisplay = memo(function ThreePhotoDisplay({
  sourceImages,
  onboardingData,
  moodboard,
  onComplete,
  className = ''
}: ThreePhotoDisplayProps) {
  const [showImages, setShowImages] = useState<boolean[]>([false, false, false])
  const [showPalette, setShowPalette] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const partner1 = onboardingData?.coupleDetails?.partner1Name || ''
  const partner2 = onboardingData?.coupleDetails?.partner2Name || ''
  const title = partner1 && partner2 ? `${partner1} & ${partner2}` : 'Wedding Vision'

  // Generate color palette
  const selectedPaletteName = onboardingData?.weddingStyle?.colorPalette || 
                             onboardingData?.weddingStyle?.selectedColorPalette ||
                             moodboard?.style_guide?.color_palette
  const palette = generate4ColorPalette(selectedPaletteName)

  // Animation sequence for showing images one by one
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Show first image after 500ms
    timers.push(setTimeout(() => {
      setShowImages([true, false, false])
    }, 500))

    // Show second image after 1000ms
    timers.push(setTimeout(() => {
      setShowImages([true, true, false])
    }, 1000))

    // Show third image after 1500ms
    timers.push(setTimeout(() => {
      setShowImages([true, true, true])
    }, 1500))

    // Show palette after 2000ms
    timers.push(setTimeout(() => {
      setShowPalette(true)
    }, 2000))

    // Show controls after 2500ms
    timers.push(setTimeout(() => {
      setShowControls(true)
    }, 2500))

    return () => timers.forEach(clearTimeout)
  }, [])

  const [isNavigating, setIsNavigating] = useState(false)

  const handleReplay = () => {
    // Reset animation
    setShowImages([false, false, false])
    setShowPalette(false)
    setShowControls(false)
    
    // Restart animation sequence
    setTimeout(() => {
      const timers: NodeJS.Timeout[] = []
      
      timers.push(setTimeout(() => setShowImages([true, false, false]), 500))
      timers.push(setTimeout(() => setShowImages([true, true, false]), 1000))
      timers.push(setTimeout(() => setShowImages([true, true, true]), 1500))
      timers.push(setTimeout(() => setShowPalette(true), 2000))
      timers.push(setTimeout(() => setShowControls(true), 2500))
    }, 200)
  }

  const handleComplete = () => {
    setIsNavigating(true)
    if (onComplete) {
      onComplete()
    }
  }

  return (
    <div className={`w-full h-screen bg-[#F6F2ED] overflow-hidden flex flex-col ${className}`}>
      {/* Header with couple names and color palette */}
      <div className="pt-3 pb-1 md:pt-4 md:pb-2 flex-shrink-0 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between max-w-6xl mx-auto">
          {/* Title Section - Left */}
          <div className="text-center md:text-left mb-2 md:mb-0">
            <motion.h1 
              className="text-xl md:text-3xl lg:text-4xl font-serif text-gray-800 mb-0 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {title}
            </motion.h1>
            <motion.p 
              className="text-gray-600 font-light text-xs md:text-sm mb-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Your unique wedding vision
            </motion.p>
          </div>
          
          {/* Color Palette - Right */}
          <AnimatePresence>
            {showPalette && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center md:justify-end"
              >
                <div className="flex gap-1 md:gap-2">
                  {palette.map((color, index) => (
                    <motion.div 
                      key={color.hex}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div 
                        className="w-8 h-10 md:w-10 md:h-12 rounded-sm shadow-md"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-xs text-gray-600 font-mono text-center mt-0.5 tracking-wide hidden md:block">
                        {color.hex.toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Three photos in a responsive grid */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-8 pt-1 md:pt-2">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
            {sourceImages.slice(0, 3).map((image, index) => (
              <motion.div
                key={index}
                className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-lg h-[45vh] md:h-[50vh] lg:h-[55vh]"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ 
                  opacity: showImages[index] ? 1 : 0,
                  y: showImages[index] ? 0 : 40,
                  scale: showImages[index] ? 1 : 0.95
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
              >
                <Image
                  src={image.url}
                  alt={`Wedding inspiration ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                
                {/* Category label overlay */}
                {image.generation_metadata?.category && (
                  <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 md:px-3 md:py-2">
                      <p className="text-white text-xs md:text-sm font-medium capitalize">
                        {image.generation_metadata.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>


      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
              {/* Continue Button */}
              {onComplete && (
                <motion.button
                  whileHover={!isNavigating ? { scale: 1.05 } : {}}
                  whileTap={!isNavigating ? { scale: 0.95 } : {}}
                  onClick={handleComplete}
                  disabled={isNavigating}
                  className={`flex items-center gap-2 px-6 py-2 text-sm rounded-full transition-all duration-200 ${
                    isNavigating 
                      ? 'bg-gray-600 text-gray-300 cursor-wait' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isNavigating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full" />
                      Navigating...
                    </>
                  ) : (
                    <>
                      <Icon name="home" className="h-4 w-4" />
                      Continue to Dashboard
                    </>
                  )}
                </motion.button>
              )}

              {/* Replay Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReplay}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                title="Replay animation"
              >
                <Icon name="refresh" className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default ThreePhotoDisplay
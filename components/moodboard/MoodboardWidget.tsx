'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generate4ColorPalette, getPaletteName } from '@/lib/color-palette-generator'
import { Icon } from '@/components/ui/icons'

interface MoodboardWidgetProps {
  moodboard: any
  onboardingData: any
  onComplete?: () => void
  className?: string
}

export const MoodboardWidget = memo(function MoodboardWidget({
  moodboard,
  onboardingData,
  onComplete,
  className = ''
}: MoodboardWidgetProps) {
  const [showBorder, setShowBorder] = useState(true)
  const [showImages, setShowImages] = useState<boolean[]>([false, false, false])
  const [showPalette, setShowPalette] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showPaletteLabels, setShowPaletteLabels] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Extract data
  const images = moodboard.source_images || []
  const selectedPaletteName = onboardingData?.weddingStyle?.colorPalette || 
                             onboardingData?.weddingStyle?.selectedColorPalette
  const palette = generate4ColorPalette(selectedPaletteName)
  
  const partner1 = onboardingData?.coupleDetails?.partner1Name || ''
  const partner2 = onboardingData?.coupleDetails?.partner2Name || ''
  const title = partner1 && partner2 ? `${partner1} & ${partner2}` : 'Wedding Vision'

  // Get images with fallback to main image
  const mainImage = moodboard.image_url
  const heroLandscape = images.find((img: any) => 
    img.type === 'venue-ceremony' || img.type === 'reception-dining'
  )?.url || images[0]?.url || mainImage
  
  const heroPortrait = images.find((img: any) => 
    img.type === 'style-decor'
  )?.url || images[1]?.url || mainImage
  
  const accentSquare = images[2]?.url || images[1]?.url || mainImage

  // Control functions
  const handleReplay = () => {
    // Reset all animation states to replay the sequence
    setShowBorder(false)
    setShowImages([false, false, false])
    setShowPalette(false)
    setShowControls(false)
    
    // Restart the animation sequence after a brief delay
    setTimeout(() => {
      const timers: NodeJS.Timeout[] = []

      // Replay the same sequence
      timers.push(setTimeout(() => setShowBorder(true), 500))
      timers.push(setTimeout(() => setShowImages([true, false, false]), 1000))
      timers.push(setTimeout(() => setShowImages([true, true, false]), 1300))
      timers.push(setTimeout(() => setShowImages([true, true, true]), 1600))
      timers.push(setTimeout(() => setShowPalette(true), 2000))
      timers.push(setTimeout(() => setShowControls(true), 2500))
    }, 200)
  }

  const handleShare = async () => {
    try {
      // Create a poster image URL or use the main moodboard image
      const posterUrl = mainImage
      await navigator.clipboard.writeText(posterUrl)
      
      // Could show a toast notification here
      console.log('✅ Poster image URL copied to clipboard!')
    } catch (error) {
      console.error('❌ Failed to copy to clipboard:', error)
    }
  }

  const togglePaletteLabels = () => {
    setShowPaletteLabels(!showPaletteLabels)
  }

  // Animation sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // 1. Show border after 500ms
    timers.push(setTimeout(() => {
      setShowBorder(true)
    }, 500))

    // 2. Show images one by one starting at 1000ms
    timers.push(setTimeout(() => {
      setShowImages([true, false, false])
    }, 1000))

    timers.push(setTimeout(() => {
      setShowImages([true, true, false])
    }, 1300))

    timers.push(setTimeout(() => {
      setShowImages([true, true, true])
    }, 1600))

    // 3. Show palette at 2000ms
    timers.push(setTimeout(() => {
      setShowPalette(true)
    }, 2000))

    // 4. Show controls at 2500ms
    timers.push(setTimeout(() => {
      setShowControls(true)
    }, 2500))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`w-full h-screen bg-[#F6F2ED] flex items-center justify-center ${className}`}>
      <motion.div 
        className="relative w-[1800px] h-[900px] bg-white"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: showBorder ? 1 : 0.95, 
          opacity: showBorder ? 1 : 0
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
          
          {/* New Layout: 3 photos horizontal + palette bottom right */}
          <div className="w-full h-full flex flex-col">
            
            {/* Top: 3 Photos Horizontal */}
            <div className="w-full h-2/3 flex">
              
              {/* Photo 1 */}
              <motion.div 
                className="flex-1 h-full flex items-center justify-center bg-gray-50/30 p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: showImages[0] ? 1 : 0,
                  scale: showImages[0] ? 1 : 0.9
                }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={heroLandscape}
                  alt="Wedding landscape"
                  className="w-[500px] h-[500px] object-cover"
                />
              </motion.div>

              {/* Photo 2 */}
              <motion.div 
                className="flex-1 h-full flex items-center justify-center bg-gray-50/30 p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: showImages[1] ? 1 : 0,
                  scale: showImages[1] ? 1 : 0.9
                }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={heroPortrait}
                  alt="Wedding portrait"
                  className="w-[500px] h-[500px] object-cover"
                />
              </motion.div>

              {/* Photo 3 */}
              <motion.div 
                className="flex-1 h-full flex items-center justify-center bg-gray-50/30 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: showImages[2] ? 1 : 0,
                  y: showImages[2] ? 0 : 20
                }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src={accentSquare}
                  alt="Wedding accent"
                  className="w-[500px] h-[500px] object-cover"
                />
              </motion.div>
            </div>

            {/* Bottom: Palette in columns 1&2 + Empty space right */}
            <div className="w-full h-1/3 flex">
              
              {/* Palette in columns 1&2 */}
              <motion.div 
                className="flex-[2] h-full flex items-center justify-center bg-gray-50/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: showPalette ? 1 : 0,
                  x: showPalette ? 0 : 20
                }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-full h-full bg-white p-4 flex justify-start items-center space-x-6">
                  {palette.slice(0, 4).map((color, index) => (
                    <motion.div 
                      key={color.hex}
                      className="bg-white p-3 shadow border border-gray-300"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                    >
                      <div 
                        className="w-28 h-36 border border-gray-400"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-[10px] text-gray-800 font-mono text-center mt-2">
                        #{color.hex.replace('#','').toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Empty space on right */}
              <div className="flex-1 h-full"></div>
            </div>
          </div>

        </motion.div>

      {/* Minimal Overlay Controls */}
      <AnimatePresence>
        {showControls && !isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-6 right-6 flex flex-col space-y-2"
          >
            {/* Next/Continue Button */}
            {onComplete && (
              <motion.button
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm opacity-60 hover:opacity-100 transition-all"
                title="Continue"
              >
                <Icon name="arrowRight" className="h-5 w-5" />
              </motion.button>
            )}

            {/* Replay Button */}
            <motion.button
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm opacity-60 hover:opacity-100 transition-all"
              title="Replay Animation"
            >
              <Icon name="refresh" className="h-5 w-5" />
            </motion.button>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center justify-center w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm opacity-60 hover:opacity-100 transition-all"
              title="Copy Image URL"
            >
              <Icon name="share" className="h-5 w-5" />
            </motion.button>

            {/* Palette Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePaletteLabels}
              className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-sm transition-all ${
                showPaletteLabels 
                  ? 'bg-purple-500/40 hover:bg-purple-500/60 opacity-100' 
                  : 'bg-black/20 hover:bg-black/40 opacity-60 hover:opacity-100'
              } text-white`}
              title="Toggle Palette Labels"
            >
              <Icon name="palette" className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
})

export default MoodboardWidget
'use client'

import { useState, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
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
  const [showImages, setShowImages] = useState<boolean[]>([false, false, false, false, false])
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

  // Get images with fallback to main image for grid layout
  const mainImage = moodboard.image_url
  const gridImages = [
    images.find((img: any) => img.type === 'venue-ceremony' || img.type === 'reception-dining')?.url || images[0]?.url || mainImage,
    images.find((img: any) => img.type === 'style-decor')?.url || images[1]?.url || mainImage,
    images[2]?.url || images[1]?.url || mainImage,
    images[3]?.url || images[0]?.url || mainImage,
    images[4]?.url || images[2]?.url || mainImage
  ]

  // Control functions
  const handleReplay = () => {
    // Reset all animation states to replay the sequence
    setShowBorder(false)
    setShowImages([false, false, false, false, false])
    setShowPalette(false)
    setShowControls(false)
    
    // Restart the animation sequence after a brief delay
    setTimeout(() => {
      const timers: NodeJS.Timeout[] = []

      // Replay the same sequence with 5 images (1=grand widget, 2=couleur, 3=petit1, 4=petit2, 5=petit3)
      timers.push(setTimeout(() => setShowBorder(true), 500))
      timers.push(setTimeout(() => setShowImages([true, false, false, false, false]), 1000)) // Widget 1
      timers.push(setTimeout(() => setShowImages([true, true, false, false, false]), 1200)) // Widget 2
      timers.push(setTimeout(() => setShowImages([true, true, true, false, false]), 1400)) // Widget 3
      timers.push(setTimeout(() => setShowImages([true, true, true, true, false]), 1600)) // Widget 4
      timers.push(setTimeout(() => setShowImages([true, true, true, true, true]), 1800)) // Widget 5
      timers.push(setTimeout(() => setShowPalette(true), 2200))
      timers.push(setTimeout(() => setShowControls(true), 2700))
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


  // Animation sequence
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // 1. Show border after 500ms
    timers.push(setTimeout(() => {
      setShowBorder(true)
    }, 500))

    // 2. Show images one by one starting at 1000ms (1=grand widget, 2=couleur, 3=petit1, 4=petit2, 5=petit3)
    timers.push(setTimeout(() => {
      setShowImages([true, false, false, false, false]) // Widget 1: Grand widget
    }, 1000))

    timers.push(setTimeout(() => {
      setShowImages([true, true, false, false, false]) // Widget 2: Couleur
    }, 1200))

    timers.push(setTimeout(() => {
      setShowImages([true, true, true, false, false]) // Widget 3: Petit widget 1
    }, 1400))

    timers.push(setTimeout(() => {
      setShowImages([true, true, true, true, false]) // Widget 4: Petit widget 2
    }, 1600))

    timers.push(setTimeout(() => {
      setShowImages([true, true, true, true, true]) // Widget 5: Petit widget 3
    }, 1800))

    // 3. Show palette at 2200ms
    timers.push(setTimeout(() => {
      setShowPalette(true)
    }, 2200))

    // 4. Show controls at 2700ms
    timers.push(setTimeout(() => {
      setShowControls(true)
    }, 2700))

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className={`w-full min-h-screen bg-white ${className}`}>
      <motion.div 
        className="relative w-full h-full bg-white"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: showBorder ? 1 : 0
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
          
          {/* Responsive Grid Layout: 1 large left + 4 smaller right */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-2 p-4 md:p-6 min-h-screen lg:h-screen lg:max-h-screen">
            
            {/* Project Summary Widget - Position 1 */}
            <motion.div 
              className="md:col-span-2 lg:col-span-1 lg:row-span-2 relative overflow-hidden bg-white h-80 md:h-96 lg:h-full rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col justify-between"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: showImages[0] ? 1 : 0,
                scale: showImages[0] ? 1 : 0.9
              }}
              transition={{ duration: 0.6 }} // Position 1: Premier à apparaître
            >
              {/* Couple Names */}
              <div className="text-center mb-6">
                <h1 className="text-3xl lg:text-4xl font-serif text-gray-800 mb-2">
                  {title}
                </h1>
                <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
              </div>

              {/* Wedding Info in Two Columns */}
              <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-2.5">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Date</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.coupleDetails?.weddingDate || 
                       (onboardingData?.coupleDetails?.stillDeciding ? 'En réflexion' : 'À définir')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Invités</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.guestInfo?.guestCount || 'À définir'} personnes
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Budget</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.coupleDetails?.budgetValue ? 
                        `${onboardingData.coupleDetails.budgetValue.toLocaleString()}${onboardingData?.coupleDetails?.currency || '€'}` : 
                        'À définir'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Lieu</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.weddingStage?.location || 'À définir'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Thèmes</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.weddingStyle?.themes?.join(', ') || 'À définir'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Couleurs</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {getPaletteName(selectedPaletteName)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Étape</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.weddingStage?.stage || 'Début'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Type Cérémonie</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.experiencesExtras?.ceremonyType || 'À définir'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Invités Intern.</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.guestInfo?.internationalGuests || 'Aucun'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Inspiration</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.weddingStyle?.inspiration || 'À définir'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Expériences</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.experiencesExtras?.experiences?.length ? 
                        `${onboardingData.experiencesExtras.experiences.length} choisies` : 
                        'Aucune'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-wide mb-1">Souhaits Spéciaux</p>
                    <p className="text-gray-800 font-medium text-xs">
                      {onboardingData?.experiencesExtras?.specialWishes ? 'Oui' : 'Aucun'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  title="Aller au Dashboard"
                >
                  <Icon name="home" className="h-4 w-4" />
                  Dashboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReplay}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  title="Relancer l'animation"
                >
                  <Icon name="refresh" className="h-4 w-4" />
                  Revoir
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  title="Partager"
                >
                  <Icon name="share" className="h-4 w-4" />
                  Partager
                </motion.button>
              </div>
            </motion.div>

            {/* Color Palette Widget - Position 2 dans l'apparition */}
            <motion.div 
              className="relative overflow-hidden bg-white h-64 md:h-64 lg:h-full flex items-center justify-center cursor-pointer group rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: showImages[1] ? 1 : 0,
                x: showImages[1] ? 0 : 20
              }}
              transition={{ duration: 0.6, delay: 0.2 }} // Position 2: Deuxième à apparaître
            >
              <motion.div
                className="w-full h-full flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: showImages[1] ? 1 : 0,
                  scale: showImages[1] ? 1 : 0.8
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex justify-center gap-5">
                  {palette.map((color) => (
                    <motion.div 
                      key={color.hex}
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <div 
                        className="w-18 h-22 lg:w-20 lg:h-28 rounded-sm shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-[9px] lg:text-[10px] text-gray-600 font-mono text-center mt-1.5 tracking-wide">
                        {color.hex.toUpperCase()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Small Widget 1 - moved to position 3 */}
            <motion.div 
              className="relative overflow-hidden cursor-pointer group h-64 md:h-64 lg:h-full rounded-lg border border-gray-200 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: showImages[2] ? 1 : 0,
                scale: showImages[2] ? 1 : 0.9
              }}
              transition={{ duration: 0.6, delay: 0.4 }} // Position 3: Troisième à apparaître
            >
              <Image 
                src={gridImages[1]}
                alt="Wedding detail image"
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-125"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </motion.div>

            {/* Small Widget 3 */}
            <motion.div 
              className="relative overflow-hidden cursor-pointer group h-64 md:h-64 lg:h-full rounded-lg border border-gray-200 shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: showImages[3] ? 1 : 0,
                scale: showImages[3] ? 1 : 0.9
              }}
              transition={{ duration: 0.6, delay: 0.6 }} // Position 4: Quatrième à apparaître
            >
              <Image 
                src={gridImages[3]}
                alt="Wedding style image"
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-125"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </motion.div>

            {/* Small Widget 2 - moved to position 5 */}
            <motion.div 
              className="relative overflow-hidden cursor-pointer group h-64 md:h-64 lg:h-full rounded-lg border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: showImages[4] ? 1 : 0,
                y: showImages[4] ? 0 : 20
              }}
              transition={{ duration: 0.6, delay: 0.8 }} // Position 5: Cinquième à apparaître
            >
              <Image 
                src={gridImages[2]}
                alt="Wedding accent image"
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-125"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </motion.div>

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
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
})

export default MoodboardWidget
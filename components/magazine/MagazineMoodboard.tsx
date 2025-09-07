'use client'

import { useState } from 'react'
import { TitlePage } from './TitlePage'
import { SummaryPanel } from './SummaryPanel'
import { PhotoPalettePage } from './PhotoPalettePage'
import { transformToMagazineFormat, type OnboardingData, type MoodboardData } from '@/lib/magazine-data-transformer'
import { motion } from 'framer-motion'

interface MagazineMoodboardProps {
  onboardingData: OnboardingData
  moodboardData?: MoodboardData
  onComplete: () => void
  className?: string
}

export function MagazineMoodboard({
  onboardingData,
  moodboardData,
  onComplete
}: MagazineMoodboardProps) {
  const [currentPage, setCurrentPage] = useState(0) // 0: Title, 1: Summary, 2: Photo+Palette
  
  // Transform data to magazine format
  const magazineData = transformToMagazineFormat(onboardingData, moodboardData)
  
  const nextPage = () => {
    if (currentPage >= 2) return
    setCurrentPage(currentPage + 1)
  }
  
  const prevPage = () => {
    if (currentPage <= 0) return
    setCurrentPage(currentPage - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE5] flex items-center justify-center p-0">
      {/* Book container with perspective for 3D effect */}
      <div 
        className="relative w-full h-full max-w-4xl max-h-[90vh] aspect-[4/3]"
        style={{ 
          perspective: '1800px',
          perspectiveOrigin: '45% center',
          filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))'
        }}
      >
        {/* Navigation hints - only show when not on first page */}
        {currentPage > 0 && (
          <button
            onClick={prevPage}
            className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-all duration-200"
            title="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Page indicator */}
        <div className="absolute top-4 right-4 z-50 text-black/60 text-sm font-light">
          {currentPage + 1} / 3
        </div>

        {/* Book Spine - Left binding */}
        <div 
          className="absolute left-0 top-0 w-3 h-full z-5"
          style={{
            background: 'linear-gradient(90deg, #8B7D6B 0%, #9D8F7D 50%, #8B7D6B 100%)',
            borderRadius: '12px 0 0 12px',
            boxShadow: 'inset 1px 0 2px rgba(0, 0, 0, 0.2), inset -1px 0 2px rgba(255, 255, 255, 0.1)'
          }}
        />

        {/* Book Base - Static background page */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
            borderRadius: '0 12px 12px 0',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), inset -2px 0 6px rgba(139, 125, 107, 0.1)',
            border: '1px solid rgba(139, 125, 107, 0.2)',
            backgroundImage: `
              radial-gradient(circle at 100% 50%, transparent 20%, rgba(139, 125, 107, 0.03) 21%, rgba(139, 125, 107, 0.03) 80%, transparent 81%),
              linear-gradient(0deg, transparent 24%, rgba(139, 125, 107, 0.01) 25%, rgba(139, 125, 107, 0.01) 26%, transparent 27%, transparent 74%, rgba(139, 125, 107, 0.01) 75%, rgba(139, 125, 107, 0.01) 76%, transparent 77%)
            `
          }}
        >
          {/* Show the current page content */}
          {currentPage === 2 && (
            <PhotoPalettePage
              title={magazineData.title}
              images={magazineData.images}
              palette={magazineData.palette}
              onComplete={onComplete}
            />
          )}
        </div>

        {/* Page 2: Summary Page - Flips over page 3 */}
        <motion.div
          className="absolute inset-0 w-full h-full cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            zIndex: currentPage <= 1 ? 20 : 10
          }}
          animate={{
            rotateY: currentPage > 1 ? -180 : 0
          }}
          transition={{
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1],
            duration: 2.5
          }}
          onClick={() => currentPage === 1 && nextPage()}
        >
          {/* Front side of page 2 */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
              borderRadius: '0 12px 12px 0',
              backgroundImage: `
                radial-gradient(circle at 100% 50%, transparent 20%, rgba(139, 125, 107, 0.03) 21%, rgba(139, 125, 107, 0.03) 80%, transparent 81%),
                linear-gradient(0deg, transparent 24%, rgba(139, 125, 107, 0.01) 25%, rgba(139, 125, 107, 0.01) 26%, transparent 27%, transparent 74%, rgba(139, 125, 107, 0.01) 75%, rgba(139, 125, 107, 0.01) 76%, transparent 77%)
              `
            }}
            animate={{
              boxShadow: currentPage === 1 
                ? '0 12px 40px rgba(0, 0, 0, 0.25), inset -2px 0 8px rgba(139, 125, 107, 0.15), 0 0 0 1px rgba(139, 125, 107, 0.1)'
                : currentPage > 1
                ? '0 25px 60px rgba(0, 0, 0, 0.4), inset -4px 0 12px rgba(139, 125, 107, 0.3)'
                : 'none'
            }}
            transition={{
              boxShadow: {
                type: "tween",
                ease: [0.25, 0.1, 0.25, 1],
                duration: 2.5
              }
            }}
          >
            {currentPage >= 1 && (
              <SummaryPanel
                title={magazineData.title}
                subtitle={magazineData.subtitle}
                summary={magazineData.summary}
                onRevealMoodboard={nextPage}
              />
            )}
          </motion.div>

          {/* Back side of page 2 - hidden */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #F0EDE5 0%, #E8DCC0 100%)',
              borderRadius: '0 12px 12px 0'
            }}
          />
        </motion.div>

        {/* Page 1: Title Page - Flips over page 2 */}
        <motion.div
          className="absolute inset-0 w-full h-full cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            zIndex: currentPage === 0 ? 30 : 10
          }}
          animate={{
            rotateY: currentPage > 0 ? -180 : 0
          }}
          transition={{
            type: "tween",
            ease: [0.25, 0.1, 0.25, 1],
            duration: 2.5
          }}
          onClick={() => currentPage === 0 && nextPage()}
        >
          {/* Front side of page 1 */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
              borderRadius: '0 12px 12px 0',
              backgroundImage: `
                radial-gradient(circle at 100% 50%, transparent 20%, rgba(139, 125, 107, 0.03) 21%, rgba(139, 125, 107, 0.03) 80%, transparent 81%),
                linear-gradient(0deg, transparent 24%, rgba(139, 125, 107, 0.01) 25%, rgba(139, 125, 107, 0.01) 26%, transparent 27%, transparent 74%, rgba(139, 125, 107, 0.01) 75%, rgba(139, 125, 107, 0.01) 76%, transparent 77%)
              `
            }}
            animate={{
              boxShadow: currentPage === 0 
                ? '0 15px 50px rgba(0, 0, 0, 0.3), inset -3px 0 10px rgba(139, 125, 107, 0.2), 0 0 0 1px rgba(139, 125, 107, 0.15)'
                : currentPage > 0
                ? '0 30px 80px rgba(0, 0, 0, 0.5), inset -6px 0 15px rgba(139, 125, 107, 0.4)'
                : 'none'
            }}
            transition={{
              boxShadow: {
                type: "tween",
                ease: [0.25, 0.1, 0.25, 1],
                duration: 2.5
              }
            }}
          >
            <TitlePage
              title={magazineData.title}
              subtitle={magazineData.subtitle}
              onNextPage={nextPage}
            />
          </motion.div>

          {/* Back side of page 1 - hidden */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #F0EDE5 0%, #E8DCC0 100%)',
              borderRadius: '0 12px 12px 0'
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
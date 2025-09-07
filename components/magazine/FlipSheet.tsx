'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring } from 'framer-motion'

interface FlipSheetProps {
  frontPanel: ReactNode
  backPanel: ReactNode
  isFlipped: boolean
  onFlip: (flipped: boolean) => void
  disabled?: boolean
  className?: string
}

export function FlipSheet({ 
  frontPanel, 
  backPanel, 
  isFlipped, 
  onFlip, 
  disabled = false,
  className = '' 
}: FlipSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const constraintsRef = useRef(null)

  // Spring for realistic page physics
  const rotateY = useSpring(isFlipped ? -180 : 0, {
    stiffness: 300,
    damping: 30,
    mass: 1
  })

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (disabled || isAnimating) return
      
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        if (!isFlipped) {
          onFlip(true)
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        if (isFlipped) {
          onFlip(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFlipped, onFlip, disabled, isAnimating])

  const handleFlip = () => {
    if (disabled || isAnimating) return
    onFlip(!isFlipped)
  }

  return (
    <div className={`w-full h-full relative overflow-hidden ${className}`} ref={constraintsRef}>
      {/* Accessibility announcer */}
      <div className="sr-only" aria-live="polite">
        {isFlipped ? 'Viewing: Moodboard' : 'Viewing: Summary'}
      </div>

      <div 
        className="w-full h-full relative cursor-pointer"
        style={{ 
          perspective: '1600px',
          perspectiveOrigin: 'left center'
        }}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Turn to summary page' : 'Turn to moodboard page'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleFlip()
          }
        }}
      >
        {/* Static back page (moodboard - always visible when front page flips) */}
        <div className="absolute inset-0 w-full h-full z-10">
          {backPanel}
        </div>

        {/* Flipping front page (summary) */}
        <motion.div
          className="absolute inset-0 w-full h-full z-20"
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'left center',
            pointerEvents: isAnimating ? 'none' : 'auto'
          }}
          animate={{ 
            rotateY: isFlipped ? -180 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 22,
            mass: 0.8
          }}
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          drag={!disabled ? "x" : false}
          dragConstraints={{ left: -200, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsDragging(true)}
          onDrag={(_event, info) => {
            // Calculate rotation based on drag
            const rotation = Math.max(-180, Math.min(0, (info.offset.x / 200) * -180))
            rotateY.set(rotation)
          }}
          onDragEnd={(_event, info) => {
            setIsDragging(false)
            // Determine flip based on position and velocity
            const shouldFlip = info.offset.x < -100 || info.velocity.x < -500
            onFlip(shouldFlip)
          }}
        >
          {/* Front side of the page - visible initially */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE5]"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
              borderRadius: '0 8px 8px 0',
              boxShadow: 'inset 2px 0 4px rgba(139, 125, 107, 0.1)'
            }}
          >
            {frontPanel}
          </div>

          {/* Back side of the page - becomes visible when flipped */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#F0EDE5] to-[#E8DCC0]"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(-180deg)',
              borderRadius: '0 8px 8px 0'
            }}
          >
            {/* Empty back side with subtle texture */}
            <div className="w-full h-full opacity-80" style={{
              backgroundImage: `
                radial-gradient(circle at 30% 20%, rgba(200, 184, 148, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(139, 125, 107, 0.03) 0%, transparent 50%)
              `
            }} />
          </div>
        </motion.div>

        {/* Book spine shadow - always visible */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/15 to-transparent z-30 pointer-events-none"
          style={{ 
            borderRadius: '0 0 0 8px'
          }}
        />

        {/* Page turning shadow */}
        <AnimatePresence>
          {(isAnimating || isDragging) && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Shadow cast by turning page */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black/20 via-black/5 to-transparent"
                style={{
                  filter: 'blur(6px)'
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
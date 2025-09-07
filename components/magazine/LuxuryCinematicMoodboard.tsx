'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { transformToMagazineFormat, type OnboardingData, type MoodboardData } from '@/lib/magazine-data-transformer'

interface LuxuryCinematicMoodboardProps {
  onboardingData: OnboardingData
  moodboardData?: MoodboardData
  onComplete: () => void
  className?: string
}

export function LuxuryCinematicMoodboard({
  onboardingData,
  moodboardData,
  onComplete
}: LuxuryCinematicMoodboardProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  
  // Transform data to magazine format
  const magazineData = transformToMagazineFormat(onboardingData, moodboardData)

  // Auto-advance to next page after delay
  useEffect(() => {
    if (!autoAdvance) return
    
    let timer: NodeJS.Timeout
    if (currentPage === 0) {
      // Stay on quote page for 4 seconds
      timer = setTimeout(() => setCurrentPage(1), 4000)
    } else if (currentPage === 1) {
      // Stay on info cards for 5 seconds
      timer = setTimeout(() => {
        setCurrentPage(2)
        setAutoAdvance(false) // Stop auto-advance on final page
      }, 5000)
    }
    
    return () => clearTimeout(timer)
  }, [currentPage, autoAdvance])

  const nextPage = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1)
      setAutoAdvance(false) // User took control
    } else {
      onComplete() // Final page, complete onboarding
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden cursor-pointer" onClick={nextPage}>
      <AnimatePresence mode="wait">
        {/* Page 1: Golden Quote on Black */}
        {currentPage === 0 && (
          <motion.div
            key="quote-page"
            className="absolute inset-0 bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div className="text-center max-w-4xl px-8">
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              >
                "{magazineData.title}"
              </motion.h1>
              
              <motion.p
                className="text-xl md:text-2xl text-yellow-200/80 mt-8 font-light italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.5 }}
              >
                {magazineData.subtitle}
              </motion.p>

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  transform: 'skew(-20deg)',
                  width: '100px'
                }}
                animate={{
                  x: ['-100px', '100vw'],
                }}
                transition={{
                  duration: 3,
                  delay: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Page 2: Minimalist Info Cards */}
        {currentPage === 1 && (
          <motion.div
            key="info-cards"
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{ backgroundColor: '#F5F1E8' }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">
              {/* Date & Venue Card */}
              <motion.div
                className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/30"
                style={{ boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">💍</div>
                  <h3 className="text-2xl font-serif text-gray-800 mb-4" style={{ color: '#8B4513' }}>
                    Cérémonie
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {onboardingData.date || 'Date à définir'}<br/>
                    {onboardingData.venue || 'Lieu magique'}
                  </p>
                </div>
              </motion.div>

              {/* Guests Card */}
              <motion.div
                className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/30"
                style={{ boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-serif text-gray-800 mb-4" style={{ color: '#8B4513' }}>
                    Invités
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {onboardingData.guestCount || '50'} personnes<br/>
                    pour célébrer votre union
                  </p>
                </div>
              </motion.div>

              {/* Budget Card */}
              <motion.div
                className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/30"
                style={{ boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-2xl font-serif text-gray-800 mb-4" style={{ color: '#8B4513' }}>
                    Budget
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {onboardingData.budget || 'À définir'}<br/>
                    pour votre jour parfait
                  </p>
                </div>
              </motion.div>

              {/* Style Card */}
              <motion.div
                className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/20 backdrop-blur-sm rounded-3xl p-8 border border-yellow-400/30"
                style={{ boxShadow: '0 20px 40px rgba(212, 175, 55, 0.1)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-2xl font-serif text-gray-800 mb-4" style={{ color: '#8B4513' }}>
                    Style
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {onboardingData.style || 'Élégant'}<br/>
                    ambiance raffinée
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Page 3: Full-width Images + Diamond Palette */}
        {currentPage === 2 && (
          <motion.div
            key="gallery"
            className="absolute inset-0"
            style={{ backgroundColor: '#F5F1E8' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            {/* Images Section */}
            <div className="h-2/3 relative overflow-hidden">
              {magazineData.images && magazineData.images.length > 0 && (
                <div className="grid grid-cols-3 h-full">
                  {magazineData.images.slice(0, 3).map((image, index) => (
                    <motion.div
                      key={index}
                      className="relative overflow-hidden"
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 2, 
                        delay: index * 0.3,
                        ease: "easeOut"
                      }}
                    >
                      <img
                        src={image}
                        alt={`Wedding inspiration ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Diamond Palette Section */}
            <div className="h-1/3 flex items-center justify-center p-8">
              <div className="text-center">
                <motion.h2
                  className="text-3xl font-serif mb-8"
                  style={{ color: '#8B4513' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  Votre Palette de Couleurs
                </motion.h2>
                
                {magazineData.palette && (
                  <div className="flex justify-center space-x-6">
                    {magazineData.palette.map((color, index) => (
                      <motion.div
                        key={index}
                        className="relative"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 1,
                          delay: 1.5 + index * 0.2,
                          type: "spring",
                          stiffness: 200
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-full border-4 border-yellow-400/50 shadow-lg transform rotate-45"
                          style={{ backgroundColor: color }}
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/30 to-transparent transform rotate-45" />
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.button
                  className="mt-12 px-12 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 2.5 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onComplete()
                  }}
                >
                  Commencer Mon Projet ✨
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {[0, 1, 2].map((page) => (
          <div
            key={page}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              currentPage === page 
                ? 'bg-yellow-400 scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors duration-300 z-10"
        onClick={(e) => {
          e.stopPropagation()
          onComplete()
        }}
      >
        Passer →
      </button>
    </div>
  )
}
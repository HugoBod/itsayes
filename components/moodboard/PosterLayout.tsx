'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { PosterMoodboard } from '@/lib/moodboard-poster-types'

interface PosterLayoutProps {
  data: PosterMoodboard
  className?: string
}

export const PosterLayout = memo(function PosterLayout({ 
  data, 
  className = '' 
}: PosterLayoutProps) {
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`relative w-full h-screen bg-[#F6F2ED] text-[#111] overflow-hidden flex flex-col ${className}`}
      style={{ fontFamily: 'var(--font-serif)' }}
    >
      {/* Header Section - Top 20% */}
      <div className="flex-none h-[20vh] flex items-center justify-between px-8 py-6">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex-1"
        >
          <h1 className="font-serif tracking-tight leading-tight text-4xl md:text-5xl lg:text-6xl text-gray-900">
            {data.title.replace(' & ', '\n& ').split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </h1>
        </motion.div>

        {/* Rotated label */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex-none origin-center rotate-90 uppercase tracking-[0.25em] text-xs text-gray-500 font-sans"
        >
          Mood Board
        </motion.div>
      </div>

      {/* Main Content Section - 60% */}
      <div className="flex-1 px-8 flex items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="w-full grid gap-2 relative"
          style={{
            height: '60vh', // Hauteur fixe pour forcer les rangées
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'repeat(12, calc(60vh / 12))', // Chaque rangée = 1/12 de 60vh
            // Grille de debug - retirez ces styles après positionnement
            backgroundImage: `
              linear-gradient(to right, rgba(255,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '8.33% 8.33%' // 12 colonnes, 12 rangées
          }}
        >
          {/* Moodboard Border - Col 2-11, Row 1-8 */}
          <div 
            className="col-start-2 col-end-12 row-start-1 row-end-9 border-2 border-gray-300 rounded-lg bg-gray-50/20 pointer-events-none"
            style={{ 
              gridColumn: '2 / 12', 
              gridRow: '1 / 9',
              zIndex: 0
            }}
          />
          
          {/* Moodboard Label */}
          <div 
            className="col-start-2 col-span-2 row-start-1 flex items-center justify-center text-xs text-gray-400 uppercase tracking-widest font-sans"
            style={{ zIndex: 1 }}
          >
            Mood Board
          </div>
          {/* Debug: Numéros de colonnes */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="col-span-1 h-6 bg-red-200/50 text-xs text-center text-red-600 font-mono flex items-center justify-center"
              style={{ gridColumn: `${i + 1} / ${i + 2}`, gridRow: '1 / 2', zIndex: 10 }}
            >
              {i + 1}
            </div>
          ))}

          {/* Image 1 - col-start-2, row-start-2, col-span-4, row-span-8 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="col-start-2 col-span-4 row-start-2 row-span-8 flex flex-col"
            style={{ zIndex: 5 }}
          >
            <img 
              src={data.images.heroLandscape} 
              alt="Wedding landscape"
              className="w-full h-full object-cover shadow-lg" 
            />
            <div className="text-xs text-center mt-1 text-gray-500">
              Image 1: col-start-2, col-span-4, row-start-2, row-span-8
            </div>
          </motion.div>
          
          {/* Image 2 - col-start-7, row-start-2, col-span-4, row-span-8 */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="col-start-7 col-span-4 row-start-2 row-span-8 flex flex-col"
            style={{ zIndex: 5 }}
          >
            <img 
              src={data.images.heroPortrait} 
              alt="Wedding portrait"
              className="w-full h-full object-cover shadow-lg" 
            />
            <div className="text-xs text-center mt-1 text-gray-500">
              Image 2: col-start-7, col-span-4, row-start-2, row-span-8
            </div>
          </motion.div>

          {/* Image 3 - col-start-2, row-start-9, col-span-6 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="col-start-2 col-span-6 row-start-9 flex flex-col"
            style={{ zIndex: 5 }}
          >
            <img 
              src={data.images.accentSquare} 
              alt="Wedding accent"
              className="w-full h-full object-cover shadow-lg border-2 border-white" 
            />
            <div className="text-xs text-center mt-1 text-gray-500">
              Image 3: col-start-2, col-span-6, row-start-9
            </div>
          </motion.div>

          {/* Debug: Indicateurs de rangées */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="col-start-12 w-8 h-8 bg-blue-200/50 text-xs text-center text-blue-600 font-mono flex items-center justify-center"
              style={{ gridRow: `${i + 1} / ${i + 2}`, zIndex: 10 }}
            >
              {i + 1}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Section - 20% */}
      <div className="flex-none h-[20vh] flex flex-col justify-center px-8">
        {/* Palette swatch cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex gap-3 justify-center mb-4"
        >
          {data.palette.slice(0, 4).map((color, index) => (
            <motion.div 
              key={color.hex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              className="w-24 text-center"
            >
              <div 
                className="w-full h-16 border border-black/10 shadow-sm mb-2" 
                style={{ backgroundColor: color.hex }} 
              />
              <div className="bg-white p-2 border border-black/10 shadow-sm">
                <div className="text-[10px] tracking-widest text-black/60 font-mono">
                  #{color.hex.replace('#','').toUpperCase()}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center tracking-[0.3em] text-[10px] uppercase text-gray-500 font-sans"
        >
          itsayes.io
        </motion.div>
      </div>
    </motion.div>
  )
})

export default PosterLayout
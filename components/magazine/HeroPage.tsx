'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface HeroPageProps {
  title: string
  pageNumber: string
  imageUrl?: string
  imageAlt?: string
  description: string
  buttonText: string
  onButtonClick: () => void
  metrics: Array<{
    value: string | React.ReactNode
    label: string
  }>
}

export function HeroPage({
  title,
  pageNumber,
  imageUrl,
  imageAlt = "Wedding inspiration",
  description,
  buttonText,
  onButtonClick,
  metrics
}: HeroPageProps) {
  return (
    <motion.div
      className="absolute inset-0 bg-neutral-50 h-screen overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="h-full flex flex-col">
        {/* Header with title - Reduced height */}
        <motion.div 
          className="pt-8 pb-4 px-8 md:px-16 flex-shrink-0"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 
            className="text-[clamp(32px,4.5vw,56px)] font-light tracking-tight text-neutral-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {title}
          </h1>
        </motion.div>

        {/* Main content area - Image only on desktop, full layout on mobile */}
        <div className="flex-1 flex flex-col md:flex-row relative min-h-0">
          {/* Large central image - Responsive */}
          <motion.div 
            className="flex-1 relative overflow-hidden h-48 md:h-auto"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <p className="text-neutral-500 text-lg">Your wedding vision</p>
              </div>
            )}
          </motion.div>

          {/* Right sidebar - Hidden on mobile, shown on desktop */}
          <motion.div 
            className="hidden md:flex w-64 lg:w-80 bg-white p-6 lg:p-12 flex-col justify-center self-end max-h-[50vh]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="mb-4 lg:mb-8">
              <span className="text-xs md:text-sm uppercase tracking-widest text-neutral-500 font-medium">
                {pageNumber}
              </span>
            </div>
            
            <p className="text-base lg:text-lg leading-relaxed text-neutral-700 mb-4 lg:mb-8">
              {description}
            </p>

            <Button
              variant="ghost"
              onClick={onButtonClick}
              className="self-end text-neutral-600 hover:text-neutral-900 px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>

        {/* Bottom stats - Responsive */}
        <motion.div 
          className="px-4 md:px-8 lg:px-16 py-4 md:py-6 lg:py-8 bg-white border-t border-neutral-200 flex-shrink-0"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className={`grid gap-4 md:gap-8 lg:gap-16 ${metrics.length === 1 ? 'grid-cols-1' : metrics.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className={`font-light text-neutral-900 mb-1 md:mb-2 ${metrics.length === 1 ? 'text-lg md:text-xl lg:text-2xl' : 'text-xl md:text-2xl lg:text-4xl'}`}>
                  {metric.value}
                </div>
                {metric.label && (
                  <div className="text-xs md:text-sm uppercase tracking-wide text-neutral-500">
                    {metric.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile sidebar - Only shown on mobile, after stats */}
        <motion.div 
          className="md:hidden bg-white p-4 flex flex-col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="mb-3">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-medium">
              {pageNumber}
            </span>
          </div>
          
          <p className="text-sm leading-relaxed text-neutral-700 mb-4">
            {description}
          </p>

          <Button
            variant="ghost"
            onClick={onButtonClick}
            className="self-center text-neutral-600 hover:text-neutral-900 px-4 py-2 text-sm font-medium"
          >
            {buttonText}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
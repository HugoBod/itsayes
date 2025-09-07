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
      className="absolute inset-0 bg-neutral-50"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="h-full flex flex-col">
        {/* Header with title */}
        <motion.div 
          className="pt-16 pb-8 px-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 
            className="text-[clamp(48px,6vw,84px)] font-light tracking-tight text-neutral-900"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {title}
          </h1>
        </motion.div>

        {/* Main content area */}
        <div className="flex-1 flex relative">
          {/* Large central image */}
          <motion.div 
            className="flex-1 relative overflow-hidden"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <p className="text-neutral-500 text-lg">Your wedding vision</p>
              </div>
            )}
          </motion.div>

          {/* Right sidebar with description */}
          <motion.div 
            className="w-80 bg-white p-12 flex flex-col justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="mb-8">
              <span className="text-sm uppercase tracking-widest text-neutral-500 font-medium">
                {pageNumber}
              </span>
            </div>
            
            <p className="text-lg leading-relaxed text-neutral-700 mb-8">
              {description}
            </p>

            <Button
              variant="ghost"
              onClick={onButtonClick}
              className="self-end text-neutral-600 hover:text-neutral-900 px-6 py-3 text-base font-medium"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div 
          className="px-16 py-12 bg-white border-t border-neutral-200"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className={`grid gap-16 ${metrics.length === 1 ? 'grid-cols-1' : metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {metrics.map((metric, index) => (
              <div key={index}>
                <div className={`font-light text-neutral-900 mb-2 ${metrics.length === 1 ? 'text-2xl' : 'text-4xl'}`}>
                  {metric.value}
                </div>
                {metric.label && (
                  <div className="text-sm uppercase tracking-wide text-neutral-500">
                    {metric.label}
                  </div>
                )}
              </div>
            ))}
          </div>

        </motion.div>
      </div>
    </motion.div>
  )
}
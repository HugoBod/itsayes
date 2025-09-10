'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { transformToMagazineFormat, type OnboardingData, type MoodboardData } from '@/lib/magazine-data-transformer'
import { Button } from '@/components/ui/button'
import { PricingModal } from '@/components/ui/pricing-modal'
import { HeroPage } from './HeroPage'

interface ElegantMagazineMoodboardProps {
  onboardingData: OnboardingData
  moodboardData?: MoodboardData
  onComplete: (pricingPlan: 'free' | 'pro' | 'team') => void
  className?: string
}

export function ElegantMagazineMoodboard({
  onboardingData,
  moodboardData,
  onComplete
}: ElegantMagazineMoodboardProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showPricingModal, setShowPricingModal] = useState(false)
  
  // Transform data to magazine format
  const magazineData = transformToMagazineFormat(onboardingData, moodboardData)

  const nextPage = () => {
    console.log('📄 nextPage called, currentPage:', currentPage)
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1)
      console.log('📄 Moving to page:', currentPage + 1)
    } else {
      // Show pricing modal instead of directly completing
      console.log('🎯 Showing pricing modal!')
      setShowPricingModal(true)
    }
  }

  const handlePlanSelection = async (plan: 'free' | 'pro' | 'team') => {
    setShowPricingModal(false)
    await onComplete(plan)
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Page container */}
      <div 
        className="w-full h-full relative overflow-hidden"
        role="main"
        aria-label={`Page ${currentPage + 1} of 3`}
      >
        <AnimatePresence mode="wait">
          {/* Page 1: Dream Overview */}
          {currentPage === 0 && (
            <HeroPage
              key="hero-page"
              title="Your Dream."
              pageNumber="01"
              imageUrl={magazineData.images?.[0]?.url}
              imageAlt={magazineData.images?.[0]?.displayTitle || "Wedding inspiration"}
              description={
                magazineData.summary.inspirations || 
                `Experience the pinnacle of elegance with your ${magazineData.summary.ceremony.toLowerCase()} ceremony in ${magazineData.summary.location}. Where high-performance planning meets cutting-edge wedding design.`
              }
              buttonText="Explore Details →"
              onButtonClick={nextPage}
              metrics={[
                {
                  value: magazineData.summary.date ? (
                    new Date(magazineData.summary.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })
                  ) : (
                    magazineData.summary.stage === 'Planning' ? 'TBD' : 'Jun 2026'
                  ),
                  label: 'Wedding Date'
                },
                {
                  value: magazineData.summary.location.split(',')[0] || magazineData.summary.location,
                  label: 'Wedding Location'
                },
                {
                  value: magazineData.summary.guests?.toString() || '0',
                  label: 'Invited Guests'
                }
              ]}
            />
          )}

          {/* Page 2: Details Overview */}
          {currentPage === 1 && (
            <HeroPage
              key="details-page"
              title="Your Details."
              pageNumber="02"
              imageUrl={magazineData.images?.[1]?.url}
              imageAlt={magazineData.images?.[1]?.displayTitle || "Wedding inspiration"}
              description={`Experience the pinnacle of elegance with your ${(magazineData.summary.ceremony || 'traditional').toLowerCase()} ceremony in ${magazineData.summary.location}. Where high-performance planning meets cutting-edge wedding design.`}
              buttonText="View Moodboard →"
              onButtonClick={nextPage}
              metrics={[
                {
                  value: (magazineData.summary.budgetRangeLabel && magazineData.summary.budgetRangeLabel.split(' ')[0]) || 'TBD',
                  label: 'Budget Range'
                },
                {
                  value: (magazineData.summary.styles && magazineData.summary.styles.length > 0) ? magazineData.summary.styles[0] : 'Luxury',
                  label: 'Primary Style'
                },
                {
                  value: (magazineData.summary.ceremony && magazineData.summary.ceremony.split(' ')[0]) || 'Traditional',
                  label: 'Ceremony Type'
                }
              ]}
            />
          )}

          {/* Page 3: Moodboard Overview */}
          {currentPage === 2 && (
            <HeroPage
              key="moodboard-page"
              title="Your Palette."
              pageNumber="03"
              imageUrl={magazineData.images?.[2]?.url}
              imageAlt={magazineData.images?.[2]?.displayTitle || "Wedding moodboard"}
              description={`Your curated wedding vision comes to life through carefully selected colors, styles, and details. Every element harmoniously designed to reflect your unique love story.`}
              buttonText="Complete Journey ✨"
              onButtonClick={nextPage}
              metrics={[
                {
                  value: (
                    <div className="flex w-full">
                      {magazineData.palette.map((color, index) => (
                        <div
                          key={index}
                          className="h-8 w-16 first:rounded-l-sm last:rounded-r-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  ),
                  label: ''
                },
                {
                  value: '',
                  label: ''
                },
                {
                  value: '',
                  label: ''
                }
              ]}
            />
          )}
        </AnimatePresence>

        {/* Page Indicator */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {[0, 1, 2].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentPage === page
                  ? 'bg-neutral-800 scale-125'
                  : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to page ${page + 1}`}
            />
          ))}
        </div>

        {/* Pricing Modal */}
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => {
            console.log('💰 Closing pricing modal')
            setShowPricingModal(false)
          }}
          onSelectPlan={handlePlanSelection}
        />
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 left-4 bg-black text-white text-xs p-2 rounded z-[9999]">
            Modal: {showPricingModal ? 'OPEN' : 'CLOSED'} | Page: {currentPage + 1}/3
          </div>
        )}
      </div>
    </div>
  )
}
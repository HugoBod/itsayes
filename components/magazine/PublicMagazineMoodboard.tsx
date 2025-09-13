'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { HeroPage } from './HeroPage'
import { SummaryPanel } from './SummaryPanel'
import { communityService } from '@/lib/community'
import type { AnonymizedProjectData } from '@/lib/privacy-filter'

interface PublicMagazineMoodboardProps {
  projectData: AnonymizedProjectData
  originalSlug: string
}

export function PublicMagazineMoodboard({
  projectData,
  originalSlug
}: PublicMagazineMoodboardProps) {
  // Debug logging
  console.log('🔍 PublicMagazineMoodboard render:', { projectData, originalSlug })
  const [currentPage, setCurrentPage] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(projectData.likes_count)
  const [viewCount, setViewCount] = useState(projectData.views_count)
  const [isLiking, setIsLiking] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [showShareToast, setShowShareToast] = useState(false)

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        const userAgent = navigator.userAgent
        const referrer = document.referrer

        await communityService.incrementProjectViews(
          projectData.id,
          userAgent,
          referrer
        )

        // Update local view count
        setViewCount(prev => prev + 1)
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }

    // Set share URL
    setShareUrl(window.location.href)

    // Track view after a short delay
    const timer = setTimeout(trackView, 1000)
    return () => clearTimeout(timer)
  }, [projectData.id])

  const nextPage = () => {
    if (currentPage < 2) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    try {
      const { liked, newCount } = await communityService.toggleProjectLike(projectData.id)
      setIsLiked(liked)
      setLikeCount(newCount)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: projectData.name,
          text: `Check out this beautiful wedding inspiration: ${projectData.name}`,
          url: shareUrl
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 3000)
      } catch (clipboardError) {
        console.error('Failed to copy to clipboard:', clipboardError)
      }
    }
  }

  const handleRemix = () => {
    // Redirect to signup/onboarding with this project as inspiration
    window.location.href = `/auth/signup?inspiration=${originalSlug}`
  }

  // Convert anonymized data to magazine format
  const magazineData = {
    summary: {
      stage: 'Completed', // Public projects are always completed
      location: projectData.location_region || 'Beautiful Location',
      date: projectData.wedding_date_season,
      budgetCurrency: 'EUR', // Default for display
      budgetRangeLabel: '10,000€ - 20,000€', // Generic range for privacy
      guests: projectData.guest_count || 100,
      ceremony: projectData.ceremony_type || 'Outdoor',
      styles: projectData.style_preferences ? [projectData.style_preferences] : ['Elegant'],
      inspirations: projectData.description || 'A beautiful celebration of love'
    },
    images: projectData.featured_image_url ? [
      {
        url: projectData.featured_image_url,
        displayTitle: projectData.name,
        title: 'Wedding Inspiration'
      }
    ] : []
  }

  return (
    <div className="h-screen relative overflow-hidden bg-white">
      {/* Fixed Header with Navigation */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to Community */}
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/community'}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Community</span>
            </Button>

            {/* Project Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-serif font-medium text-gray-900 truncate">
                {projectData.name}
              </h1>
              <p className="text-xs text-gray-500">
                {projectData.wedding_date_season} • {projectData.location_region}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
              >
                <Icon name="heart" className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{likeCount}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <Icon name="share" className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Magazine Content */}
      <div className="pt-16 h-full">
        <div
          className="w-full h-full relative overflow-hidden"
          role="main"
          aria-label={`Page ${currentPage + 1} of 3 - ${projectData.name}`}
        >
          <AnimatePresence mode="wait">
            {/* Page 1: Cover/Hero */}
            {currentPage === 0 && (
              <HeroPage
                key="hero-page"
                title={projectData.name}
                pageNumber="01"
                imageUrl={magazineData.images?.[0]?.url}
                imageAlt={magazineData.images?.[0]?.displayTitle || "Wedding inspiration"}
                description={magazineData.summary.inspirations}
                buttonText="View Details →"
                onButtonClick={nextPage}
                metrics={[
                  {
                    value: magazineData.summary.date || 'Beautiful Season',
                    label: 'When'
                  },
                  {
                    value: magazineData.summary.location,
                    label: 'Where'
                  },
                  {
                    value: magazineData.summary.guests?.toString() || '100+',
                    label: 'Guests'
                  }
                ]}
              />
            )}

            {/* Page 2: Details */}
            {currentPage === 1 && (
              <HeroPage
                key="details-page"
                title="The Details."
                pageNumber="02"
                imageUrl={magazineData.images?.[0]?.url}
                imageAlt="Wedding details"
                description={`A ${magazineData.summary.styles.join(' & ')} celebration featuring ${magazineData.summary.ceremony.toLowerCase()} ceremony with ${magazineData.summary.guests} beloved guests.`}
                buttonText="View Summary →"
                onButtonClick={nextPage}
                metrics={[
                  {
                    value: magazineData.summary.styles.join(' & '),
                    label: 'Style'
                  },
                  {
                    value: magazineData.summary.ceremony,
                    label: 'Ceremony'
                  },
                  {
                    value: `${viewCount} views`,
                    label: 'Inspiration'
                  }
                ]}
              />
            )}

            {/* Page 3: Summary */}
            {currentPage === 2 && (
              <SummaryPanel
                key="summary-page"
                title={projectData.name}
                subtitle={`Inspiring couples since ${new Date(projectData.created_at).getFullYear()}`}
                summary={magazineData.summary}
                onRevealMoodboard={() => {}} // No action needed for public view
                className="public-summary"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-2"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {[0, 1, 2].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentPage === page ? 'bg-primary' : 'bg-gray-300'
                }`}
                aria-label={`Go to page ${page + 1}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === 2}
            className="p-2"
          >
            <Icon name="arrowRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CTA Banner - Only show on last page */}
      {currentPage === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-primary text-white rounded-lg px-6 py-3 shadow-lg">
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Inspired by this wedding?</p>
              <Button
                onClick={handleRemix}
                className="bg-white text-primary hover:bg-gray-100"
                size="sm"
              >
                Start Your Own Journey
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Navigation */}
      <div
        className="absolute inset-0 focus:outline-none"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' && currentPage < 2) nextPage()
          if (e.key === 'ArrowLeft' && currentPage > 0) prevPage()
          if (e.key === 'l' || e.key === 'L') handleLike()
          if (e.key === 's' || e.key === 'S') handleShare()
        }}
        aria-label="Use arrow keys to navigate, L to like, S to share"
      />
    </div>
  )
}
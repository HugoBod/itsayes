'use client'

import { ReactNode, memo } from 'react'
import { Icon } from '@/components/ui/icons'
import { OnboardingHeader } from '@/components/ui/onboarding-header'
import { NavigationButton } from '@/components/ui/onboarding-button'
import { LoadingPage } from '@/components/ui/loading'

interface OnboardingLayoutProps {
  // Progress
  currentStep?: number
  totalSteps?: number
  
  // Left side content - either default image or custom content
  imageIcon?: string
  imageTitle?: string
  imageSubtitle?: string
  customLeftContent?: ReactNode  // Custom content for left side
  leftContentClassName?: string  // Additional styling for left content
  showDefaultImage?: boolean     // Whether to show default image (true by default)
  
  // Main content
  title: string
  subtitle?: string
  description?: string
  
  // Navigation
  onBack: () => void
  onNext: () => void
  canProceed: boolean
  nextButtonText?: string
  backButtonText?: string
  
  // Loading state
  isNavigating?: boolean
  loadingText?: string
  
  // Content
  children: ReactNode
  
  // Optional customization
  showHeader?: boolean
  className?: string
}

export const OnboardingLayout = memo(function OnboardingLayout({
  currentStep,
  totalSteps = 8,
  imageIcon,
  imageTitle,
  imageSubtitle,
  customLeftContent,
  leftContentClassName = '',
  showDefaultImage = true,
  title,
  subtitle,
  description,
  onBack,
  onNext,
  canProceed,
  nextButtonText = 'Continue',
  backButtonText = 'Back',
  isNavigating = false,
  loadingText = 'Loading...',
  children,
  showHeader = true,
  className = ''
}: OnboardingLayoutProps) {

  // Show loading page during navigation
  if (isNavigating) {
    return <LoadingPage variant="bounce" text={loadingText} />
  }

  return (
    <div className={`min-h-screen bg-white ${className}`}>
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left side - Big picture or Custom Content - Hidden on mobile, shown on desktop */}
        <div className={`hidden lg:flex lg:w-1/3 lg:flex-col lg:justify-center lg:px-4 xl:px-6 ${showDefaultImage ? 'lg:bg-gradient-wedding' : ''} ${leftContentClassName}`}>
          {customLeftContent && !showDefaultImage ? (
            // Custom content (e.g., moodboard)
            <div className="relative max-w-xs mx-auto">
              <div className="aspect-[4/5] rounded-xl lg:rounded-2xl shadow-luxury overflow-hidden">
                {customLeftContent}
              </div>
              
              {/* Decorative elements for custom content */}
              <div className="absolute -top-3 -right-3 h-8 w-8 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 opacity-60 blur-lg"></div>
              <div className="absolute -bottom-3 -left-3 h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 opacity-60 blur-lg"></div>
            </div>
          ) : (
            // Default image content
            <div className="relative max-w-xs mx-auto">
              <div className="aspect-[4/5] bg-gradient-warm rounded-xl lg:rounded-2xl shadow-luxury overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-muted/20 to-background/20 flex items-center justify-center">
                  <div className="text-center space-y-3 lg:space-y-4 p-4">
                    <div className="flex justify-center">
                      <div className="flex h-12 w-12 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-white shadow-lg">
                        <Icon name={imageIcon as any} className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base lg:text-lg font-bold text-white drop-shadow-lg">{imageTitle}</h3>
                      <p className="text-white/90 text-xs lg:text-sm drop-shadow">{imageSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 h-8 w-8 lg:h-12 lg:w-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 opacity-60 blur-lg"></div>
              <div className="absolute -bottom-3 -left-3 h-16 w-16 lg:h-20 lg:w-20 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 opacity-60 blur-lg"></div>
            </div>
          )}
        </div>

        {/* Right side - Form */}
        <div className="flex w-full lg:w-2/3 flex-col min-h-screen overflow-y-auto">
          <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-8 lg:py-12">
            <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto space-y-6 sm:space-y-8 my-auto">
            {/* Mobile preview image - Only shown on mobile */}
            <div className="lg:hidden mb-8">
              <div className="aspect-[16/9] sm:aspect-[16/10] bg-gradient-warm rounded-xl shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-muted/30 to-background/30 flex items-center justify-center">
                  <div className="text-center space-y-3 sm:space-y-4 p-4">
                    <div className="flex justify-center">
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white shadow-lg">
                        <Icon name={imageIcon as any} className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-foreground">{imageTitle}</h3>
                      <p className="text-warm text-sm">{imageSubtitle}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Header */}
            {showHeader && currentStep && (
              <OnboardingHeader currentStep={currentStep} totalSteps={totalSteps} />
            )}

            {/* Main Content */}
            <div className="text-left space-y-5 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-foreground leading-tight">
                {title}
              </h1>
              
              {subtitle && (
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-serif font-normal text-secondary leading-tight">
                  {subtitle}
                </h2>
              )}
              
              {description && (
                <p className="text-sm sm:text-base text-warm leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Form Content */}
            <div className="space-y-6 sm:space-y-8">
              {children}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-2">
              <NavigationButton direction="back" onClick={onBack}>
                {backButtonText}
              </NavigationButton>
              <NavigationButton 
                direction="continue" 
                disabled={!canProceed}
                onClick={onNext}
              >
                {nextButtonText}
              </NavigationButton>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
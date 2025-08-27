'use client'

import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Progress } from '@/components/ui/progress'

interface OnboardingHeaderProps {
  currentStep: number
  totalSteps?: number
}

export function OnboardingHeader({ 
  currentStep, 
  totalSteps = 8 
}: OnboardingHeaderProps) {
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between">
              {/* Logo - Left aligned */}
              <Link href="/onboarding">
                <Logo className="hidden sm:block" size="lg" />
                <Logo className="block sm:hidden" size="md" />
              </Link>
              
              {/* Progress Bar - Right side */}
              <div className="flex-1 ml-8">
                <Progress 
                  value={progressPercentage} 
                  className="h-2 bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
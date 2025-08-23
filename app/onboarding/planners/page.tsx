'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import { Logo } from '@/components/ui/logo'

const PLANNER_TYPES = [
  {
    value: 'planner',
    title: 'Wedding Planner',
    subtitle: 'Full-service wedding planning',
    icon: 'clipboard'
  },
  {
    value: 'coordinator',
    title: 'Day-of Coordinator',
    subtitle: 'Day-of and month-of coordination',
    icon: 'clock'
  },
  {
    value: 'designer',
    title: 'Wedding Designer',
    subtitle: 'Styling and design services',
    icon: 'palette'
  },
  {
    value: 'consultant',
    title: 'Wedding Consultant',
    subtitle: 'Advisory and partial planning',
    icon: 'lightbulb'
  }
]

export default function PlannersOnboardingPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleComplete = async () => {
    if (selectedType) {
      setIsSubmitting(true)
      try {
        // Store onboarding data in localStorage
        localStorage.setItem('onboarding_data', JSON.stringify({
          type: 'planners',
          businessType: selectedType,
          completedAt: new Date().toISOString()
        }))
        
        // For now, redirect to main page - in a real app this would go to auth
        router.push('/')
      } catch (error) {
        console.error('Error completing onboarding:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    router.push('/onboarding')
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <Icon name="loader" className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-blue-600">Setting up your professional workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/onboarding">
              <Logo size="sm" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Step Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl md:text-3xl font-serif font-normal text-gray-900">
              Tell us about your wedding business
            </h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Understanding your role helps us customize your experience and provide the right tools for your business.
            </p>
          </div>

          {/* Business Type Selection */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="grid gap-4">
                {PLANNER_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                      selectedType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            <Icon name={type.icon} className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{type.title}</h3>
                            <p className="text-sm text-gray-600">{type.subtitle}</p>
                          </div>
                        </div>
                        <Icon 
                          name={selectedType === type.value ? 'checkCircle' : 'circle'} 
                          className={`h-6 w-6 ${
                            selectedType === type.value ? 'text-blue-600' : 'text-gray-300'
                          }`} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <Icon name="arrowLeft" className="h-4 w-4" />
              <span>Back</span>
            </Button>
            
            <Button
              onClick={handleComplete}
              disabled={!selectedType}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
            >
              Complete Setup
              <Icon name="arrowRight" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
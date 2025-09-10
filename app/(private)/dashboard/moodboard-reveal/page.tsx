'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useMoodboard } from '@/hooks/useMoodboard'
import { Icon } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MoodboardSkeleton } from '@/components/ui/skeleton'

// Dynamic imports for heavy moodboard components
const MoodboardGrid = dynamic(
  () => import('@/components/moodboard/MoodboardGrid').then(mod => ({ default: mod.MoodboardGrid })),
  { 
    loading: () => <MoodboardSkeleton />,
    ssr: false 
  }
)

const AIInsights = dynamic(
  () => import('@/components/moodboard/AIInsights').then(mod => ({ default: mod.AIInsights })),
  { 
    loading: () => (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    ),
    ssr: false 
  }
)

// MoodboardData interface is now imported from useMoodboard hook

export default function MoodboardRevealPage() {
  const { moodboard, isGenerating, error, hasGenerated, actions } = useMoodboard()
  const [revealStep, setRevealStep] = useState(0)
  const [shouldGenerate, setShouldGenerate] = useState(false)
  const [generatingMessage, setGeneratingMessage] = useState("✨ Analyzing your style preferences")
  const router = useRouter()

  // Check if moodboard exists, if not, trigger generation
  useEffect(() => {
    if (!hasGenerated && !isGenerating && !moodboard && !shouldGenerate) {
      setShouldGenerate(true)
    }
  }, [hasGenerated, isGenerating, moodboard, shouldGenerate])

  // Generate moodboard if needed
  useEffect(() => {
    if (shouldGenerate && !isGenerating) {
      actions.generateMoodboard()
      setShouldGenerate(false)
    }
  }, [shouldGenerate, isGenerating, actions])

  // Start reveal animation when moodboard is ready
  useEffect(() => {
    if (moodboard && !isGenerating) {
      const timer = setTimeout(() => {
        setRevealStep(1)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [moodboard, isGenerating])

  // Progress loading messages during generation
  useEffect(() => {
    if (!isGenerating) return

    const messages: string[] = []

    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length
      setGeneratingMessage(messages[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [isGenerating])

  // All moodboard logic now handled by useMoodboard hook

  const handleContinueToDashboard = () => {
    router.push('/dashboard')
  }

  const handleRegenerateComplete = async () => {
    setRevealStep(0)
    await actions.regenerateMoodboard()
  }

  const handleShare = async () => {
    const shareUrl = await actions.shareMoodboard()
    if (shareUrl) {
      // Show success message or open share dialog
      console.log('Moodboard shared:', shareUrl)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center space-y-6 max-w-md">
          <Icon name="alertCircle" className="h-16 w-16 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Unable to create your moodboard</h1>
            <p className="text-gray-600">
              {error.includes('onboarding') || error.includes('No onboarding data') 
                ? 'Please complete your onboarding first to generate a personalized moodboard.'
                : error.includes('OPENAI_API_KEY')
                ? 'AI moodboard generation is temporarily unavailable. You\'ll see a curated inspiration board instead.'
                : error.includes('credits') || error.includes('Credits')
                ? 'You\'ve used all your moodboard generation credits. Please upgrade your plan to generate more.'
                : error
              }
            </p>
          </div>
          <div className="space-y-3">
            {error.includes('onboarding') || error.includes('No onboarding data') ? (
              <Button onClick={() => router.push('/onboarding')} className="w-full">
                <Icon name="arrowLeft" className="h-4 w-4 mr-2" />
                Complete Onboarding
              </Button>
            ) : (
              <Button onClick={handleRegenerateComplete} className="w-full">
                <Icon name="refresh" className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={handleContinueToDashboard} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Loading Header */}
          <div className="text-center space-y-6 mb-8">
            <div className="relative">
              <div className="animate-spin">
                <Icon name="sparkles" className="h-12 lg:h-16 w-12 lg:w-16 text-purple-600" />
              </div>
              <div className="absolute inset-0 animate-ping">
                <Icon name="heart" className="h-12 lg:h-16 w-12 lg:w-16 text-pink-400 opacity-30" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-purple-900">Creating your unique wedding vision...</h1>
              <p className="text-lg lg:text-xl text-purple-600">Our AI is crafting personalized inspiration just for you</p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-purple-500">
              <div className="animate-pulse">{generatingMessage}</div>
            </div>
          </div>
          
          {/* Show skeleton while generating */}
          <MoodboardSkeleton />
        </div>
      </div>
    )
  }

  if (!moodboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className={`text-center mb-6 lg:mb-8 px-4 transition-all duration-1000 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-900 mb-2">Your Wedding Vision</h1>
          <p className="text-lg lg:text-xl text-purple-600">Personalized inspiration crafted just for you</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* Moodboard Image */}
          <div className={`transition-all duration-1000 delay-300 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <MoodboardGrid
              imageUrl={moodboard.image_url}
              onRegenerate={handleRegenerateComplete}
              onShare={handleShare}
              isRegenerating={isGenerating}
              layout="single"
            />
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Created with {moodboard.generation_metadata.model} • {new Date(moodboard.generation_metadata.generated_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Wedding Summary & Insights */}
          <div className="space-y-6">
            
            {/* Wedding Summary */}
            <div className={`transition-all duration-1000 delay-500 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="heart" className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Wedding Story</h2>
                    <p className="text-gray-700 leading-relaxed">
                      {moodboard.wedding_summary}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Style Guide */}
            <div className={`transition-all duration-1000 delay-700 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="palette" className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Style Guide</h2>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-800">Color Palette</h3>
                        <p className="text-gray-600 text-sm">{moodboard.style_guide.color_palette}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Style Keywords</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {moodboard.style_guide.style_keywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Themes</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {moodboard.style_guide.themes.map((theme, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Insights */}
            <div className={`transition-all duration-1000 delay-900 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <AIInsights insights={moodboard.ai_insights} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`mt-8 lg:mt-12 text-center space-y-4 px-4 transition-all duration-1000 delay-1100 ${revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleContinueToDashboard}
              size="lg"
              className="flex-1 text-sm lg:text-base"
            >
              <Icon name="arrowRight" className="h-4 w-4 mr-2" />
              Continue to Dashboard
            </Button>
            <Button 
              onClick={handleRegenerateComplete}
              variant="outline"
              size="lg"
              className="flex-1 text-sm lg:text-base"
            >
              <Icon name="refresh" className="h-4 w-4 mr-2" />
              Generate New Vision
            </Button>
          </div>
          <p className="text-xs lg:text-sm text-gray-500 px-4">
            You can always regenerate or customize your moodboard from the dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
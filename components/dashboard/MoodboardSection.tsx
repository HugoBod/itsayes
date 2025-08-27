'use client'

import { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { MoodboardGrid } from '@/components/moodboard/MoodboardGrid'
import { DashboardMoodboardSkeleton } from '@/components/ui/skeleton'
import { useMoodboard } from '@/hooks/useMoodboard'

export const MoodboardSection = memo(function MoodboardSection() {
  const router = useRouter()
  const { moodboard, isGenerating, isRegenerating, hasGenerated, actions } = useMoodboard()

  const handleViewFullMoodboard = () => {
    router.push('/dashboard/moodboard-reveal')
  }

  const handleCreateMoodboard = async () => {
    const success = await actions.generateMoodboard()
    if (success) {
      router.push('/dashboard/moodboard-reveal')
    }
  }

  const handleRegenerateComplete = async () => {
    const success = await actions.regenerateMoodboard()
    if (success) {
      router.push('/dashboard/moodboard-reveal')
    }
  }

  if (isGenerating || isRegenerating) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Wedding Moodboard</h2>
        <Card className="p-6 lg:p-8">
          <div className="text-center space-y-4 mb-6">
            <div className="animate-spin mx-auto">
              <Icon name="sparkles" className="h-8 lg:h-12 w-8 lg:w-12 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base lg:text-lg">
                {isRegenerating ? 'Creating a fresh vision...' : 'Creating your unique wedding vision...'}
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base">
                Our AI is crafting personalized inspiration just for you
              </p>
            </div>
          </div>
          <DashboardMoodboardSkeleton />
        </Card>
      </div>
    )
  }

  if (!hasGenerated || !moodboard) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Wedding Moodboard</h2>
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-fit mx-auto">
              <Icon name="image" className="h-12 w-12 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Create Your AI Wedding Moodboard</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Transform your onboarding preferences into a beautiful, personalized wedding vision with AI-generated inspiration.
              </p>
              <Button onClick={handleCreateMoodboard} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Icon name="sparkles" className="h-4 w-4 mr-2" />
                Generate My Moodboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Wedding Moodboard</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleRegenerateComplete}
            variant="outline" 
            size="sm"
            disabled={isRegenerating}
          >
            <Icon name="refresh" className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button onClick={handleViewFullMoodboard} size="sm">
            <Icon name="eye" className="h-4 w-4 mr-2" />
            View Full
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Moodboard Preview */}
        <div className="md:col-span-1">
          <MoodboardGrid
            imageUrl={moodboard.image_url}
            onRegenerate={handleRegenerateComplete}
            onShare={actions.shareMoodboard}
            isRegenerating={isRegenerating}
          />
        </div>

        {/* Wedding Summary */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start space-x-3">
              <Icon name="heart" className="h-5 w-5 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Your Wedding Story</h3>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                  {moodboard.wedding_summary}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start space-x-3">
              <Icon name="palette" className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Style Guide</h3>
                <p className="text-gray-600 text-sm mb-3">{moodboard.style_guide.color_palette}</p>
                <div className="flex flex-wrap gap-1">
                  {moodboard.style_guide.style_keywords.slice(0, 3).map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                  {moodboard.style_guide.style_keywords.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{moodboard.style_guide.style_keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button onClick={handleViewFullMoodboard} variant="outline" className="w-full">
              <Icon name="arrowRight" className="h-4 w-4 mr-2" />
              View Full Experience
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default MoodboardSection
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'

interface MoodboardData {
  image_url: string
  wedding_summary: string
  ai_insights: string[]
  style_guide: {
    color_palette: string
    style_keywords: string[]
    themes: string[]
  }
  generation_metadata: {
    prompt_used: string
    model: string
    generated_at: string
    generation_type: 'single' | 'multi-image' | '3-photo'
    layout_type?: 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine'
    location_context?: {
      name: string
      architecture_style: string
      cultural_elements: string[]
    }
    // New 3-photo system metadata
    randomization_seed?: number
    categories_generated?: string[]
    fallbacks_used?: number
  }
  source_images?: {
    type: 'venue-ceremony' | 'style-decor' | 'reception-dining' | string
    url: string
    prompt_used: string
    generation_metadata?: {
      category?: string
      elements_included?: string[]
    }
  }[]
  composition_metadata?: {
    layout: { type: string; width: number; height: number }
    final_dimensions: { width: number; height: number }
  }
  created_at: string
  workspace_id: string
}

interface MoodboardGenerationOptions {
  layoutType?: 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine'
  generationType?: 'single' | 'multi-image' | '3-photo'
  useLocationContext?: boolean
  seed?: number
  skipSwapping?: boolean
}

interface MoodboardActions {
  generateMoodboard: (options?: MoodboardGenerationOptions) => Promise<boolean>
  regenerateMoodboard: (options?: MoodboardGenerationOptions) => Promise<boolean>
  regenerateSection: (imageType: 'venue-ceremony' | 'style-decor' | 'reception-dining') => Promise<boolean>
  regenerateSpecificPhoto: (photoIndex: number, newSeed?: number) => Promise<boolean>
  shareMoodboard: () => Promise<string | null>
  refreshMoodboard: () => Promise<void>
}

interface UseMoodboardReturn {
  moodboard: MoodboardData | null
  isGenerating: boolean
  isRegenerating: boolean
  isRegeneratingSection: boolean
  error: string | null
  hasGenerated: boolean
  generationStats?: {
    generation_type: 'single' | 'multi-image' | '3-photo'
    layout_type?: string
    location_context?: string
    source_images_count: number
    // New 3-photo system stats
    randomization_seed?: number
    categories_generated?: string[]
    fallbacks_used?: number
  }
  actions: MoodboardActions
}

export function useMoodboard(): UseMoodboardReturn {
  const [moodboard, setMoodboard] = useState<MoodboardData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [generationStats, setGenerationStats] = useState<UseMoodboardReturn['generationStats']>()

  // Check for existing moodboard on mount
  useEffect(() => {
    checkExistingMoodboard()
  }, [])

  const checkExistingMoodboard = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/moodboard/generate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setMoodboard(result.data)
          setHasGenerated(true)
          
          // Update generation stats
          setGenerationStats({
            generation_type: result.generation_type || result.data.generation_metadata?.generation_type || 'single',
            layout_type: result.layout_type || result.data.generation_metadata?.layout_type,
            location_context: result.location_context || result.data.generation_metadata?.location_context?.name,
            source_images_count: result.source_images_count || result.data.source_images?.length || 1,
            // New 3-photo system stats
            randomization_seed: result.randomization_seed,
            categories_generated: result.categories_generated,
            fallbacks_used: result.fallbacks_used
          })
        }
      }
    } catch (error) {
      console.error('Error checking existing moodboard:', error)
    }
  }

  const generateMoodboard = async (options: MoodboardGenerationOptions = {}): Promise<boolean> => {
    try {
      setIsGenerating(true)
      setError(null)

      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return false
      }

      console.log('Session exists:', !!session)
      console.log('Access token exists:', !!session.access_token)

      // Build query parameters
      const params = new URLSearchParams()
      if (options.layoutType) params.set('layout', options.layoutType)
      if (options.generationType) params.set('type', options.generationType)
      if (options.useLocationContext === false) params.set('location', 'false')
      if (options.seed !== undefined) params.set('seed', options.seed.toString())
      if (options.skipSwapping) params.set('skipSwapping', 'true')
      
      const url = `/api/moodboard/generate${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to generate moodboard')
        return false
      }

      setMoodboard(result.data)
      setHasGenerated(true)
      
      // Update generation stats
      setGenerationStats({
        generation_type: result.generation_type || result.data.generation_metadata?.generation_type || 'single',
        layout_type: result.layout_type || result.data.generation_metadata?.layout_type,
        location_context: result.location_context || result.data.generation_metadata?.location_context?.name,
        source_images_count: result.source_images_count || result.data.source_images?.length || 1,
        // New 3-photo system stats
        randomization_seed: result.randomization_seed,
        categories_generated: result.categories_generated,
        fallbacks_used: result.fallbacks_used
      })
      
      return true

    } catch (error) {
      console.error('Error generating moodboard:', error)
      setError('An unexpected error occurred')
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateMoodboard = async (options: MoodboardGenerationOptions = {}): Promise<boolean> => {
    try {
      setIsRegenerating(true)
      setError(null)

      // Regenerate the complete moodboard with new options
      const success = await generateMoodboard(options)
      return success

    } catch (error) {
      console.error('Error regenerating moodboard:', error)
      setError('Failed to regenerate moodboard')
      return false
    } finally {
      setIsRegenerating(false)
    }
  }

  const regenerateSection = async (
    imageType: 'venue-ceremony' | 'style-decor' | 'reception-dining'
  ): Promise<boolean> => {
    try {
      setIsRegeneratingSection(true)
      setError(null)

      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return false
      }

      // Get current onboarding data (you may need to get this from your app's state)
      // For now, we'll assume it's available or fetch it from the workspace
      const response = await fetch('/api/moodboard/regenerate-section', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageType,
          // onboardingData: getCurrentOnboardingData() // You'll need to implement this
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to regenerate section')
        return false
      }

      // Update the moodboard with the new section image
      if (moodboard && moodboard.source_images) {
        const updatedSourceImages = moodboard.source_images.map(img => 
          img.type === imageType ? result.image : img
        )
        
        setMoodboard({
          ...moodboard,
          source_images: updatedSourceImages
        })
      }

      return true

    } catch (error) {
      console.error('Error regenerating section:', error)
      setError('Failed to regenerate section')
      return false
    } finally {
      setIsRegeneratingSection(false)
    }
  }

  const regenerateSpecificPhoto = async (photoIndex: number, newSeed?: number): Promise<boolean> => {
    try {
      setIsRegeneratingSection(true)
      setError(null)

      if (!moodboard || !moodboard.generation_metadata.randomization_seed) {
        setError('Cannot regenerate - no seed available')
        return false
      }

      // Use new seed or increment existing seed
      const seedToUse = newSeed || (moodboard.generation_metadata.randomization_seed + photoIndex + Date.now())
      
      // Regenerate with same parameters but different seed
      const success = await generateMoodboard({
        layoutType: moodboard.generation_metadata.layout_type as any,
        generationType: moodboard.generation_metadata.generation_type as any,
        useLocationContext: !!moodboard.generation_metadata.location_context,
        seed: seedToUse,
        skipSwapping: true // Skip swapping for individual photo regen
      })
      
      return success
    } catch (error) {
      console.error('Error regenerating specific photo:', error)
      setError('Failed to regenerate photo')
      return false
    } finally {
      setIsRegeneratingSection(false)
    }
  }

  const shareMoodboard = async (): Promise<string | null> => {
    try {
      if (!moodboard) return null

      const supabase = createClientComponentClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return null
      }

      // Call share API endpoint
      const response = await fetch('/api/moodboard/share', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public: true
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to create share link')
        return null
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(result.share_url)
      
      return result.share_url
    } catch (error) {
      console.error('Error sharing moodboard:', error)
      setError('Failed to create share link')
      return null
    }
  }

  const refreshMoodboard = async (): Promise<void> => {
    await checkExistingMoodboard()
  }

  const actions: MoodboardActions = {
    generateMoodboard,
    regenerateMoodboard,
    regenerateSection,
    regenerateSpecificPhoto,
    shareMoodboard,
    refreshMoodboard
  }

  return {
    moodboard,
    isGenerating,
    isRegenerating,
    isRegeneratingSection,
    error,
    hasGenerated,
    generationStats,
    actions
  }
}

export default useMoodboard
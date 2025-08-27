'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

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
  }
  created_at: string
  workspace_id: string
}

interface MoodboardActions {
  generateMoodboard: () => Promise<boolean>
  regenerateMoodboard: () => Promise<boolean>
  shareMoodboard: () => Promise<string | null>
  refreshMoodboard: () => Promise<void>
}

interface UseMoodboardReturn {
  moodboard: MoodboardData | null
  isGenerating: boolean
  isRegenerating: boolean
  error: string | null
  hasGenerated: boolean
  actions: MoodboardActions
}

export function useMoodboard(): UseMoodboardReturn {
  const [moodboard, setMoodboard] = useState<MoodboardData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasGenerated, setHasGenerated] = useState(false)

  // Check for existing moodboard on mount
  useEffect(() => {
    checkExistingMoodboard()
  }, [])

  const checkExistingMoodboard = async () => {
    try {
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
        }
      }
    } catch (error) {
      console.error('Error checking existing moodboard:', error)
    }
  }

  const generateMoodboard = async (): Promise<boolean> => {
    try {
      setIsGenerating(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        return false
      }

      console.log('Session exists:', !!session)
      console.log('Access token exists:', !!session.access_token)

      const response = await fetch('/api/moodboard/generate', {
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
      return true

    } catch (error) {
      console.error('Error generating moodboard:', error)
      setError('An unexpected error occurred')
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateMoodboard = async (): Promise<boolean> => {
    try {
      setIsRegenerating(true)
      setError(null)

      // For now, we'll regenerate the complete moodboard
      // In the future, this could regenerate specific sections
      const success = await generateMoodboard()
      return success

    } catch (error) {
      console.error('Error regenerating moodboard:', error)
      setError('Failed to regenerate moodboard')
      return false
    } finally {
      setIsRegenerating(false)
    }
  }

  const shareMoodboard = async (): Promise<string | null> => {
    try {
      if (!moodboard) return null

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
    shareMoodboard,
    refreshMoodboard
  }

  return {
    moodboard,
    isGenerating,
    isRegenerating,
    error,
    hasGenerated,
    actions
  }
}

export default useMoodboard
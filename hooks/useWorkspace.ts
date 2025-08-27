'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Workspace = Database['public']['Tables']['workspaces']['Row']
type WorkspaceInsert = Database['public']['Tables']['workspaces']['Insert']
type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update']

interface UseWorkspaceReturn {
  workspace: Workspace | null
  loading: boolean
  error: string | null
  actions: {
    fetchWorkspace: () => Promise<void>
    updateWorkspace: (id: string, data: Partial<WorkspaceUpdate>) => Promise<void>
    updateOnboardingData: (data: any) => Promise<void>
    completeOnboarding: () => Promise<void>
  }
}

export function useWorkspace(): UseWorkspaceReturn {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const fetchWorkspace = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        throw new Error('Authentication error')
      }
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get user's workspace (v1: one workspace per user)
      const { data, error: fetchError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('account_id', user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No workspace found - this should not happen with proper auth setup
          setWorkspace(null)
        } else {
          throw fetchError
        }
      } else {
        setWorkspace(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspace')
    } finally {
      setLoading(false)
    }
  }

  const updateWorkspace = async (id: string, data: Partial<WorkspaceUpdate>) => {
    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Refresh workspace data
      await fetchWorkspace()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace')
      throw err
    }
  }

  const updateOnboardingData = async (data: any) => {
    if (!workspace) {
      throw new Error('No workspace found')
    }

    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({
          onboarding_data_couple: data,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspace.id)

      if (updateError) {
        throw updateError
      }

      // Refresh workspace data
      await fetchWorkspace()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update onboarding data')
      throw err
    }
  }

  const completeOnboarding = async () => {
    if (!workspace) {
      throw new Error('No workspace found')
    }

    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workspace.id)

      if (updateError) {
        throw updateError
      }

      // Refresh workspace data
      await fetchWorkspace()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
      throw err
    }
  }

  useEffect(() => {
    fetchWorkspace()
  }, [])

  return {
    workspace,
    loading,
    error,
    actions: {
      fetchWorkspace,
      updateWorkspace,
      updateOnboardingData,
      completeOnboarding
    }
  }
}
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

interface Activity {
  id: string
  action: string
  entityType: string
  entityId: string
  description: string
  timestamp: string
  userId: string
  workspaceId: string
  metadata?: any
}

interface UseActivityLogReturn {
  activities: Activity[]
  loading: boolean
  error: string | null
  actions: {
    fetchActivities: (workspaceId: string) => Promise<void>
    logActivity: (data: {
      action: string
      entityType: string
      entityId?: string
      description: string
      metadata?: any
    }) => Promise<void>
  }
}

export function useActivityLog(): UseActivityLogReturn {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const fetchActivities = async (workspaceId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(50) // Limit to recent 50 activities

      if (fetchError) {
        throw fetchError
      }

      // Transform data to match our Activity interface
      const transformedActivities = (data || []).map(item => ({
        id: item.id,
        action: item.action,
        entityType: item.entity_type,
        entityId: item.entity_id || '',
        description: item.description || '',
        timestamp: item.created_at || '',
        userId: item.user_id,
        workspaceId: item.workspace_id,
        metadata: item.metadata
      }))

      setActivities(transformedActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  const logActivity = async (data: {
    action: string
    entityType: string
    entityId?: string
    description: string
    metadata?: any
  }) => {
    try {
      setError(null)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      // Get current workspace (assuming single workspace for v1)
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('account_id', user.id)
        .single()

      if (workspaceError || !workspaceData) {
        throw new Error('No workspace found')
      }

      const { error: insertError } = await supabase
        .from('activity_logs')
        .insert({
          action: data.action,
          entity_type: data.entityType,
          entity_id: data.entityId,
          description: data.description,
          metadata: data.metadata,
          user_id: user.id,
          workspace_id: workspaceData.id,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        throw insertError
      }

      // Refresh activities to include the new one
      await fetchActivities(workspaceData.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity')
      // Don't throw error for activity logging - it should be non-blocking
      console.error('Activity logging failed:', err)
    }
  }

  return {
    activities,
    loading,
    error,
    actions: {
      fetchActivities,
      logActivity
    }
  }
}
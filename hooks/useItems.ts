'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'
import { RealtimeChannel } from '@supabase/supabase-js'

type Item = Database['public']['Tables']['items']['Row']
type ItemInsert = Database['public']['Tables']['items']['Insert']
type ItemUpdate = Database['public']['Tables']['items']['Update']

// Custom interface that makes created_by optional since we handle it internally
interface ItemCreateData extends Omit<ItemInsert, 'created_by'> {
  created_by?: string
}

interface UseItemsReturn {
  items: Item[]
  loading: boolean
  error: string | null
  isConnected: boolean
  actions: {
    fetchItems: (workspaceId: string, type?: string) => Promise<void>
    createItem: (data: ItemCreateData) => Promise<Item | null>
    updateItem: (id: string, data: Partial<ItemUpdate>) => Promise<void>
    deleteItem: (id: string) => Promise<void>
    archiveItem: (id: string) => Promise<void>
    subscribe: (workspaceId: string, type?: string) => void
    unsubscribe: () => void
  }
}

export function useItems(): UseItemsReturn {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const supabase = createClientComponentClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const currentFilters = useRef<{ workspaceId: string; type?: string } | null>(null)

  const fetchItems = async (workspaceId: string, type?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('items')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (data: ItemCreateData): Promise<Item | null> => {
    try {
      setError(null)
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('User not authenticated')
      }

      const { data: newItem, error: createError } = await supabase
        .from('items')
        .insert({
          ...data,
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Add to local state
      setItems(prev => [newItem, ...prev])
      
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item')
      throw err
    }
  }

  const updateItem = async (id: string, data: Partial<ItemUpdate>) => {
    try {
      setError(null)
      
      const { error: updateError } = await supabase
        .from('items')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setError(null)
      
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      throw err
    }
  }

  const archiveItem = async (id: string) => {
    try {
      setError(null)
      
      const { error: archiveError } = await supabase
        .from('items')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (archiveError) {
        throw archiveError
      }

      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive item')
      throw err
    }
  }

  const subscribe = (workspaceId: string, type?: string) => {
    try {
      // Unsubscribe from previous channel if exists
      unsubscribe()
      
      // Store current filters for the subscription
      currentFilters.current = { workspaceId, type }
      
      // Create channel for real-time updates
      const channel = supabase
        .channel(`items_${workspaceId}${type ? `_${type}` : ''}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'items',
            filter: `workspace_id=eq.${workspaceId}${type ? ` and type=eq.${type}` : ''}`
          },
          (payload) => {
            console.log('Real-time update:', payload)
            
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as Item
              setItems(prev => [newItem, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as Item
              setItems(prev => prev.map(item => 
                item.id === updatedItem.id ? updatedItem : item
              ))
            } else if (payload.eventType === 'DELETE') {
              const deletedItem = payload.old as Item
              setItems(prev => prev.filter(item => item.id !== deletedItem.id))
            }
          }
        )
        .subscribe((status, error) => {
          console.log('Subscription status:', status, error)
          setIsConnected(status === 'SUBSCRIBED')
        })

      channelRef.current = channel
    } catch (err) {
      console.error('Failed to subscribe to real-time updates:', err)
      setError(err instanceof Error ? err.message : 'Failed to subscribe to updates')
    }
  }

  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      setIsConnected(false)
    }
  }

  // Auto-subscribe when component unmounts
  useEffect(() => {
    return () => {
      unsubscribe()
    }
  }, [])

  return {
    items,
    loading,
    error,
    isConnected,
    actions: {
      fetchItems,
      createItem,
      updateItem,
      deleteItem,
      archiveItem,
      subscribe,
      unsubscribe
    }
  }
}
'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { Database } from '@/lib/types/database'

type Board = Database['public']['Tables']['boards']['Row']
type BoardInsert = Database['public']['Tables']['boards']['Insert']

interface UseBoardsReturn {
  boards: Board[]
  loading: boolean
  error: string | null
  actions: {
    fetchBoards: (workspaceId: string) => Promise<void>
    getBoardByType: (type: 'budget' | 'planning' | 'custom') => Board | null
    createBoard: (data: BoardInsert) => Promise<Board | null>
  }
}

export function useBoards(): UseBoardsReturn {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const fetchBoards = async (workspaceId: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('boards')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('position', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      let boards = data || []

      // Ensure default boards exist (fallback if trigger didn't create them)
      if (boards.length === 0) {
        boards = await createDefaultBoards(workspaceId)
      }

      setBoards(boards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards')
    } finally {
      setLoading(false)
    }
  }

  const getBoardByType = (type: 'budget' | 'planning' | 'custom'): Board | null => {
    return boards.find(board => board.type === type) || null
  }

  const createBoard = async (data: BoardInsert): Promise<Board | null> => {
    try {
      setError(null)
      
      const { data: newBoard, error: createError } = await supabase
        .from('boards')
        .insert(data)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      setBoards(prev => [...prev, newBoard])
      return newBoard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board')
      throw err
    }
  }

  const createDefaultBoards = async (workspaceId: string): Promise<Board[]> => {
    try {
      const defaultBoards = [
        {
          workspace_id: workspaceId,
          name: 'Budget',
          type: 'budget' as const,
          position: 0
        },
        {
          workspace_id: workspaceId,
          name: 'Planning',
          type: 'planning' as const,
          position: 1
        }
      ]

      const { data, error } = await supabase
        .from('boards')
        .insert(defaultBoards)
        .select()

      if (error) {
        throw error
      }

      return data || []
    } catch (err) {
      console.error('Failed to create default boards:', err)
      return []
    }
  }

  return {
    boards,
    loading,
    error,
    actions: {
      fetchBoards,
      getBoardByType,
      createBoard
    }
  }
}
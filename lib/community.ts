'use client'

import { createClientComponentClient } from './supabase'
import type { Database } from './types/database'

// Types for community projects
export interface CommunityProject {
  id: string
  name: string
  description: string | null
  public_slug: string
  wedding_date: string | null
  pricing_plan: 'free' | 'pro' | 'team'
  likes_count: number
  views_count: number
  remix_count: number
  created_at: string
  last_activity_at: string
  style_preferences: string | null
  partner1_name?: string
  partner2_name?: string
  trending_score?: number
}

export type FilterType = 'Popular' | 'Recent' | 'Trending'
export type StyleFilter = 'All' | string

interface CommunityService {
  getPublicProjects: (
    filter: FilterType,
    style?: StyleFilter,
    limit?: number,
    offset?: number
  ) => Promise<{ projects: CommunityProject[]; hasMore: boolean; error?: string }>
  
  getProjectBySlug: (slug: string) => Promise<{ project: CommunityProject | null; error?: string }>
  
  incrementProjectViews: (
    projectId: string,
    userAgent?: string,
    referrer?: string
  ) => Promise<{ success: boolean; error?: string }>
  
  toggleProjectLike: (
    projectId: string
  ) => Promise<{ liked: boolean; newCount: number; error?: string }>
  
  remixProject: (
    originalProjectId: string
  ) => Promise<{ success: boolean; newProjectId?: string; error?: string }>
}

class CommunityDataService implements CommunityService {
  
  async getPublicProjects(
    filter: FilterType = 'Popular',
    style: StyleFilter = 'All',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ projects: CommunityProject[]; hasMore: boolean; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      
      let query = supabase
        .from('community_projects')
        .select(`
          id,
          name,
          description,
          public_slug,
          wedding_date,
          pricing_plan,
          likes_count,
          views_count,
          remix_count,
          created_at,
          last_activity_at,
          style_preferences,
          trending_score
        `)
        .range(offset, offset + limit - 1)
      
      // Apply style filter
      if (style && style !== 'All') {
        query = query.ilike('style_preferences', `%${style}%`)
      }
      
      // Apply sorting based on filter
      switch (filter) {
        case 'Popular':
          query = query.order('likes_count', { ascending: false })
                      .order('views_count', { ascending: false })
                      .order('created_at', { ascending: false })
          break
        case 'Recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'Trending':
          query = query.order('trending_score', { ascending: false, nullsLast: true })
                      .order('last_activity_at', { ascending: false })
          break
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching public projects:', error)
        return { projects: [], hasMore: false, error: error.message }
      }
      
      // Check if there are more projects
      const hasMore = data.length === limit
      
      return {
        projects: data as CommunityProject[],
        hasMore,
      }
    } catch (error) {
      console.error('Error in getPublicProjects:', error)
      return { 
        projects: [], 
        hasMore: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async getProjectBySlug(slug: string): Promise<{ project: CommunityProject | null; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      
      const { data, error } = await supabase
        .from('community_projects')
        .select(`
          id,
          name,
          description,
          public_slug,
          wedding_date,
          pricing_plan,
          likes_count,
          views_count,
          remix_count,
          created_at,
          last_activity_at,
          style_preferences,
          partner1_name,
          partner2_name,
          trending_score
        `)
        .eq('public_slug', slug)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { project: null }  // Project not found
        }
        console.error('Error fetching project by slug:', error)
        return { project: null, error: error.message }
      }
      
      return { project: data as CommunityProject }
    } catch (error) {
      console.error('Error in getProjectBySlug:', error)
      return { 
        project: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async incrementProjectViews(
    projectId: string,
    userAgent: string = '',
    referrer: string = ''
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      
      // Get user info if available
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get IP address (approximation in browser context)
      const ipAddress = '127.0.0.1' // In production, this would be handled server-side
      
      // Call the increment function
      const { error } = await supabase.rpc('increment_project_views', {
        project_workspace_id: projectId,
        viewer_ip: ipAddress,
        viewer_user_id: user?.id || null,
        viewer_user_agent: userAgent,
        viewer_referrer: referrer
      })
      
      if (error) {
        console.error('Error incrementing views:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error in incrementProjectViews:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async toggleProjectLike(
    projectId: string
  ): Promise<{ liked: boolean; newCount: number; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      
      // Get user info
      const { data: { user } } = await supabase.auth.getUser()
      const ipAddress = '127.0.0.1' // In production, this would be handled server-side
      
      // Call the toggle function
      const { data, error } = await supabase.rpc('toggle_project_like', {
        project_workspace_id: projectId,
        liker_user_id: user?.id || null,
        liker_ip: user ? null : ipAddress // Only use IP for anonymous users
      })
      
      if (error) {
        console.error('Error toggling like:', error)
        return { liked: false, newCount: 0, error: error.message }
      }
      
      // Get updated like count
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('likes_count')
        .eq('id', projectId)
        .single()
      
      return { 
        liked: data, // true if like was added, false if removed
        newCount: workspace?.likes_count || 0
      }
    } catch (error) {
      console.error('Error in toggleProjectLike:', error)
      return { 
        liked: false, 
        newCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  async remixProject(
    originalProjectId: string
  ): Promise<{ success: boolean; newProjectId?: string; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      
      // Get user info - user must be authenticated to remix
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'Authentication required to remix projects' }
      }
      
      // Get the original project's onboarding data
      const { data: originalProject, error: fetchError } = await supabase
        .from('workspaces')
        .select(`
          id,
          name,
          onboarding_data_couple,
          onboarding_data_planner
        `)
        .eq('id', originalProjectId)
        .eq('is_public', true)
        .single()
      
      if (fetchError || !originalProject) {
        return { success: false, error: 'Original project not found or not public' }
      }
      
      // Get user's account
      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', user.id)
        .single()
      
      if (!account) {
        return { success: false, error: 'User account not found' }
      }
      
      // Check if user already has a workspace (v1 MVP constraint)
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('account_id', account.id)
        .single()
      
      if (existingWorkspace) {
        return { success: false, error: 'You can only have one project at a time. Please complete or delete your current project first.' }
      }
      
      // Create new workspace with copied data
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({
          account_id: account.id,
          name: `Remix of ${originalProject.name}`,
          onboarding_data_couple: originalProject.onboarding_data_couple,
          onboarding_data_planner: originalProject.onboarding_data_planner,
          pricing_plan: 'free', // New projects start as free
          is_public: false, // Private until user completes onboarding
        })
        .select('id')
        .single()
      
      if (createError || !newWorkspace) {
        return { success: false, error: 'Failed to create remix project' }
      }
      
      // Increment remix count on original project
      await supabase.rpc('sql', {
        query: `
          UPDATE workspaces 
          SET remix_count = remix_count + 1, last_activity_at = now() 
          WHERE id = $1
        `,
        params: [originalProjectId]
      })
      
      return { 
        success: true, 
        newProjectId: newWorkspace.id 
      }
    } catch (error) {
      console.error('Error in remixProject:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

// Available wedding styles for filtering
export const WEDDING_STYLES: StyleFilter[] = [
  'All',
  'Classic',
  'Bohemian', 
  'Modern',
  'Rustic',
  'Beach',
  'Garden',
  'Vintage',
  'Industrial',
  'Romantic',
  'Minimalist',
  'Luxury'
]

// Filter options
export const FILTER_OPTIONS: FilterType[] = ['Popular', 'Recent', 'Trending']

// Singleton instance
export const communityService = new CommunityDataService()

// React hook for community data
export function useCommunityData() {
  return {
    getPublicProjects: communityService.getPublicProjects.bind(communityService),
    getProjectBySlug: communityService.getProjectBySlug.bind(communityService),
    incrementProjectViews: communityService.incrementProjectViews.bind(communityService),
    toggleProjectLike: communityService.toggleProjectLike.bind(communityService),
    remixProject: communityService.remixProject.bind(communityService),
  }
}
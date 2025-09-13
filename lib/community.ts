'use client'

import { createClientComponentClient } from './supabase'
import type { Database } from './types/database'

// Types for community projects
export interface CommunityProject {
  id: string
  name: string
  description: string | null
  public_id: string
  wedding_date: string | null
  pricing_plan: 'free' | 'pro' | 'team'
  likes_count: number
  views_count: number
  remix_count: number
  created_at: string
  last_activity_at: string
  style_preferences: string | null
  featured_image_url?: string
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

  getProjectById: (id: string) => Promise<{ project: CommunityProject | null; error?: string }>

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
          public_id,
          wedding_date,
          created_at,
          last_activity_at,
          featured_image_url,
          style_themes,
          color_palette,
          likes_count,
          views_count,
          remix_count,
          trending_score
        `)
        .range(offset, offset + limit - 1)
      
      // Apply style filter to style themes
      if (style && style !== 'All') {
        query = query.ilike('style_themes', `%${style}%`)
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
          query = query.order('trending_score', { ascending: false })
                      .order('last_activity_at', { ascending: false })
          break
      }
      
      const { data, error } = await query

      if (error) {
        console.error('Error fetching public projects:', {
          error,
          errorMessage: error?.message,
          errorDetails: error?.details,
          errorCode: error?.code,
          errorHint: error?.hint
        })
        return { projects: [], hasMore: false, error: error.message || 'Unknown database error' }
      }

      // Log successful query for debugging
      console.log(`✅ Community query successful: Found ${data?.length || 0} public projects`)
      
      // Check if there are more projects
      const hasMore = data.length === limit

      // Map community project data (already filtered and processed by the view)
      const projects: CommunityProject[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        public_id: project.public_id || '',
        wedding_date: project.wedding_date,
        pricing_plan: 'free' as const, // Community projects are all free plan
        likes_count: project.likes_count || 0,
        views_count: project.views_count || 0,
        remix_count: project.remix_count || 0,
        created_at: project.created_at || new Date().toISOString(),
        last_activity_at: project.last_activity_at || new Date().toISOString(),
        featured_image_url: project.featured_image_url,
        style_preferences: JSON.stringify({
          themes: project.style_themes ? JSON.parse(project.style_themes) : [],
          colorPalette: project.color_palette || null
        }),
        trending_score: project.trending_score || 0
      }))

      return {
        projects,
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
  
  async getProjectById(id: string): Promise<{ project: CommunityProject | null; error?: string }> {
    try {
      const supabase = createClientComponentClient()

      const { data, error } = await supabase
        .from('community_projects')
        .select(`
          id,
          name,
          description,
          public_id,
          wedding_date,
          created_at,
          last_activity_at,
          featured_image_url,
          style_themes,
          color_palette,
          likes_count,
          views_count,
          remix_count,
          trending_score
        `)
        .eq('public_id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { project: null }  // Project not found
        }
        console.error('Error fetching project by id:', error)
        return { project: null, error: error.message }
      }

      // Map community project data (already processed by the view)
      const project: CommunityProject = {
        id: data.id,
        name: data.name,
        description: data.description,
        public_id: data.public_id || '',
        wedding_date: data.wedding_date,
        pricing_plan: 'free' as const, // Community projects are all free plan
        likes_count: data.likes_count || 0,
        views_count: data.views_count || 0,
        remix_count: data.remix_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        last_activity_at: data.last_activity_at || new Date().toISOString(),
        featured_image_url: data.featured_image_url,
        style_preferences: JSON.stringify({
          themes: data.style_themes ? JSON.parse(data.style_themes) : [],
          colorPalette: data.color_palette || null
        }),
        // Anonymized for privacy (managed by view)
        partner1_name: 'Partner 1',
        partner2_name: 'Partner 2',
        trending_score: data.trending_score || 0
      }

      return { project }
    } catch (error) {
      console.error('Error in getProjectById:', error)
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

      // Get current count and increment
      const { data: currentData } = await supabase
        .from('workspaces')
        .select('views_count')
        .eq('id', projectId)
        .single()

      const newViewsCount = (currentData?.views_count || 0) + 1

      const { error } = await supabase
        .from('workspaces')
        .update({
          views_count: newViewsCount,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('is_public', true)

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

      // Get current count and increment
      const { data: currentData } = await supabase
        .from('workspaces')
        .select('likes_count')
        .eq('id', projectId)
        .single()

      const newLikesCount = (currentData?.likes_count || 0) + 1

      const { error } = await supabase
        .from('workspaces')
        .update({
          likes_count: newLikesCount,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('is_public', true)

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
        liked: true, // Always true for now since we're just incrementing
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
      
      // Get current remix count and increment
      const { data: originalData } = await supabase
        .from('workspaces')
        .select('remix_count')
        .eq('id', originalProjectId)
        .single()

      const newRemixCount = (originalData?.remix_count || 0) + 1

      await supabase
        .from('workspaces')
        .update({
          remix_count: newRemixCount,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', originalProjectId)
      
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
    getProjectById: communityService.getProjectById.bind(communityService),
    incrementProjectViews: communityService.incrementProjectViews.bind(communityService),
    toggleProjectLike: communityService.toggleProjectLike.bind(communityService),
    remixProject: communityService.remixProject.bind(communityService),
  }
}
// Server-side community service for Next.js App Router
import { createServerComponentClient } from './supabase'
import type { CommunityProject } from './community'

interface ServerCommunityService {
  getProjectById: (id: string) => Promise<{ project: CommunityProject | null; error?: string }>
  getProjectBySlug: (slug: string) => Promise<{ project: CommunityProject | null; error?: string }>
  getPublicIdByWorkspaceId: (workspaceId: string) => Promise<{ publicId: string | null; error?: string }>
  getPublicProjects: (
    filter?: 'Popular' | 'Recent' | 'Trending',
    style?: string,
    limit?: number,
    offset?: number
  ) => Promise<{ projects: CommunityProject[]; hasMore: boolean; error?: string }>
}

class ServerCommunityDataService implements ServerCommunityService {

  async getProjectById(id: string): Promise<{ project: CommunityProject | null; error?: string }> {
    console.log('🔍 ServerCommunityService.getProjectById called with id:', id)
    try {
      const supabase = await createServerComponentClient()

      // Query workspaces directly since the community_projects view may not have public_id exposed
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          id,
          name,
          description,
          public_id,
          featured_image_url,
          is_public,
          wedding_date,
          created_at,
          updated_at,
          onboarding_data_couple
        `)
        .eq('public_id', id)
        .eq('is_public', true)
        .single()

      if (error) {
        console.log('🔍 Database error:', error)
        if (error.code === 'PGRST116') {
          console.log('🔍 Project not found (PGRST116)')
          return { project: null }  // Project not found
        }
        console.error('Error fetching project by id:', error)
        return { project: null, error: error.message }
      }

      console.log('🔍 Database result:', data)

      // Transform workspace data to CommunityProject format
      const project: CommunityProject = {
        id: data.id,
        name: data.name,
        description: data.description,
        public_id: data.public_id || '',
        wedding_date: data.wedding_date,
        pricing_plan: 'free', // Default for community projects
        likes_count: 0, // Will be updated via project_likes aggregation in a separate query if needed
        views_count: 0, // Will be updated via project_views aggregation in a separate query if needed
        remix_count: 0,
        created_at: data.created_at || new Date().toISOString(),
        last_activity_at: data.updated_at || new Date().toISOString(),
        featured_image_url: data.featured_image_url,
        // Extract style preferences from onboarding data
        style_preferences: data.onboarding_data_couple &&
          typeof data.onboarding_data_couple === 'object' &&
          !Array.isArray(data.onboarding_data_couple) &&
          (data.onboarding_data_couple as any)?.step_4 ?
          JSON.stringify({
            themes: (data.onboarding_data_couple as any).step_4?.themes || [],
            colorPalette: (data.onboarding_data_couple as any).step_4?.colorPalette || null
          }) : null,
        // Anonymize partner names for privacy
        partner1_name: 'Partner 1',
        partner2_name: 'Partner 2',
        trending_score: 0
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

  async getProjectBySlug(slug: string): Promise<{ project: CommunityProject | null; error?: string }> {
    try {
      const supabase = await createServerComponentClient()

      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          id,
          name,
          description,
          public_id,
          wedding_date,
          pricing_plan,
          likes_count,
          views_count,
          remix_count,
          created_at,
          last_activity_at,
          featured_image_url,
          onboarding_data_couple
        `)
        .eq('public_id', slug)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { project: null, error: 'Project not found' }
        }
        console.error('Error fetching project by slug:', error)
        return { project: null, error: error.message }
      }

      // Transform to CommunityProject interface
      const project: CommunityProject = {
        id: data.id,
        name: data.name,
        description: data.description,
        public_id: data.public_id || '',
        wedding_date: data.wedding_date,
        pricing_plan: data.pricing_plan as 'free' | 'pro' | 'team',
        likes_count: data.likes_count || 0,
        views_count: data.views_count || 0,
        remix_count: data.remix_count || 0,
        created_at: data.created_at || new Date().toISOString(),
        last_activity_at: data.last_activity_at || new Date().toISOString(),
        featured_image_url: data.featured_image_url,
        style_preferences: JSON.stringify({
          themes: data.onboarding_data_couple?.step_4?.themes || [],
          colorPalette: data.onboarding_data_couple?.step_4?.colorPalette || null
        }),
        partner1_name: 'Partner 1',
        partner2_name: 'Partner 2',
        trending_score: 0
      }

      return { project }
    } catch (error) {
      console.error('Error in getProjectBySlug:', error)
      return {
        project: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPublicIdByWorkspaceId(workspaceId: string): Promise<{ publicId: string | null; error?: string }> {
    try {
      const supabase = await createServerComponentClient()

      const { data, error } = await supabase
        .from('workspaces')
        .select('public_id')
        .eq('id', workspaceId)
        .eq('is_public', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { publicId: null }  // Workspace not found or not public
        }
        console.error('Error fetching workspace public_id:', error)
        return { publicId: null, error: error.message }
      }

      return { publicId: data.public_id }
    } catch (error) {
      console.error('Error in getPublicIdByWorkspaceId:', error)
      return {
        publicId: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getPublicProjects(
    filter: 'Popular' | 'Recent' | 'Trending' = 'Popular',
    style: string = 'All',
    limit: number = 20,
    offset: number = 0
  ): Promise<{ projects: CommunityProject[]; hasMore: boolean; error?: string }> {
    try {
      const supabase = await createServerComponentClient()

      let query = supabase
        .from('workspaces')
        .select(`
          id,
          name,
          description,
          public_id,
          featured_image_url,
          is_public,
          wedding_date,
          created_at,
          updated_at,
          onboarding_data_couple
        `)
        .eq('is_public', true)
        .not('public_id', 'is', null)
        .not('featured_image_url', 'is', null)
        .range(offset, offset + limit - 1)

      // Apply style filter to onboarding data
      if (style && style !== 'All') {
        query = query.ilike('onboarding_data_couple', `%${style}%`)
      }

      // Apply sorting based on filter (simplified since we don't have aggregated stats yet)
      switch (filter) {
        case 'Popular':
        case 'Recent':
        case 'Trending':
        default:
          query = query.order('created_at', { ascending: false })
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

      // Check if there are more projects
      const hasMore = data.length === limit

      // Transform workspace data to CommunityProject format
      const projects: CommunityProject[] = data.map(workspace => ({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        public_id: workspace.public_id || '',
        wedding_date: workspace.wedding_date,
        pricing_plan: 'free', // Default for community projects
        likes_count: 0, // Will be updated via aggregation if needed
        views_count: 0, // Will be updated via aggregation if needed
        remix_count: 0,
        created_at: workspace.created_at || new Date().toISOString(),
        last_activity_at: workspace.updated_at || new Date().toISOString(),
        featured_image_url: workspace.featured_image_url,
        // Extract style preferences from onboarding data
        style_preferences: workspace.onboarding_data_couple &&
          typeof workspace.onboarding_data_couple === 'object' &&
          !Array.isArray(workspace.onboarding_data_couple) &&
          (workspace.onboarding_data_couple as any)?.step_4 ?
          JSON.stringify({
            themes: (workspace.onboarding_data_couple as any).step_4?.themes || [],
            colorPalette: (workspace.onboarding_data_couple as any).step_4?.colorPalette || null
          }) : null,
        partner1_name: 'Partner 1',
        partner2_name: 'Partner 2',
        trending_score: 0
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
}

// Singleton instance for server-side use
export const serverCommunityService = new ServerCommunityDataService()
'use client'

import { createClientComponentClient } from './supabase'
import type { Database } from './types/database'

// Type definitions for onboarding data structure
interface OnboardingStepData {
  [key: string]: any
  completed_at?: string
}

interface OnboardingData {
  [key: string]: OnboardingStepData
}

type WorkspaceOnboardingData = Database['public']['Tables']['workspaces']['Row']['onboarding_data_couple']

interface OnboardingStep {
  step: number
  data: Record<string, any>
}

interface OnboardingService {
  saveStep: (step: number, data: Record<string, any>) => Promise<{ success: boolean; error?: string }>
  getStep: (step: number) => Promise<{ data: Record<string, any> | null; error?: string }>
  getAllSteps: () => Promise<{ data: OnboardingData | null; error?: string }>
  completeOnboarding: () => Promise<{ success: boolean; error?: string }>
  isOnboardingComplete: () => Promise<{ completed: boolean; error?: string }>
}

class OnboardingDataService implements OnboardingService {
  private workspaceId: string | null = null

  private async getWorkspaceId(): Promise<string | null> {
    if (this.workspaceId) return this.workspaceId

    try {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Get user's workspace through workspace_members (proper relation)
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select(`
          id,
          workspace_members!inner(
            user_id,
            role
          )
        `)
        .eq('workspace_members.user_id', user.id)
        .single()

      if (error) {
        console.error('Error getting workspace:', error)
        return null
      }

      this.workspaceId = workspace.id
      return workspace.id
    } catch (error) {
      console.error('Error in getWorkspaceId:', error)
      return null
    }
  }

  async saveStep(step: number, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const workspaceId = await this.getWorkspaceId()
      if (!workspaceId) {
        return { success: false, error: 'No workspace found' }
      }

      const supabase = createClientComponentClient()
      // Get current onboarding data
      const { data: workspace, error: fetchError } = await supabase
        .from('workspaces')
        .select('onboarding_data_couple')
        .eq('id', workspaceId)
        .single()

      if (fetchError) {
        return { success: false, error: `Failed to fetch current data: ${fetchError.message}` }
      }

      // Safely handle JSONB data with proper typing
      const currentData = (workspace.onboarding_data_couple as OnboardingData) || {}
      const stepKey = `step_${step}`
      const existingStepData = currentData[stepKey] as OnboardingStepData || {}
      
      const updatedData: OnboardingData = {
        ...currentData,
        [stepKey]: {
          ...existingStepData,
          ...data,
          completed_at: new Date().toISOString(),
        }
      }

      // Save updated data
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ 
          onboarding_data_couple: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)

      if (updateError) {
        return { success: false, error: `Failed to save step: ${updateError.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving step:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  async getStep(step: number): Promise<{ data: Record<string, any> | null; error?: string }> {
    try {
      const workspaceId = await this.getWorkspaceId()
      if (!workspaceId) {
        return { data: null, error: 'No workspace found' }
      }

      const supabase = createClientComponentClient()
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('onboarding_data_couple')
        .eq('id', workspaceId)
        .single()

      if (error) {
        return { data: null, error: `Failed to fetch step: ${error.message}` }
      }

      const onboardingData = workspace.onboarding_data_couple as OnboardingData
      const stepKey = `step_${step}`
      const stepData = onboardingData?.[stepKey] as Record<string, any> || null
      return { data: stepData }
    } catch (error) {
      console.error('Error getting step:', error)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  async getAllSteps(): Promise<{ data: OnboardingData | null; error?: string }> {
    try {
      const workspaceId = await this.getWorkspaceId()
      if (!workspaceId) {
        return { data: null, error: 'No workspace found' }
      }

      const supabase = createClientComponentClient()
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('onboarding_data_couple')
        .eq('id', workspaceId)
        .single()

      if (error) {
        return { data: null, error: `Failed to fetch onboarding data: ${error.message}` }
      }

      return { data: workspace.onboarding_data_couple as OnboardingData }
    } catch (error) {
      console.error('Error getting all steps:', error)
      return { data: null, error: 'An unexpected error occurred' }
    }
  }

  async completeOnboarding(): Promise<{ success: boolean; error?: string }> {
    try {
      const workspaceId = await this.getWorkspaceId()
      if (!workspaceId) {
        return { success: false, error: 'No workspace found' }
      }

      // First, migrate onboarding data to items table
      const migrationResult = await this.migrateOnboardingToItems(workspaceId)
      if (!migrationResult.success) {
        return migrationResult
      }

      const supabase = createClientComponentClient()
      // Mark onboarding as completed
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ 
          onboarding_completed_at: new Date().toISOString(),
          onboarding_migrated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)

      if (updateError) {
        return { success: false, error: `Failed to complete onboarding: ${updateError.message}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  private async migrateOnboardingToItems(workspaceId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClientComponentClient()
      // Get onboarding data
      const { data: workspace, error: fetchError } = await supabase
        .from('workspaces')
        .select('onboarding_data_couple')
        .eq('id', workspaceId)
        .single()

      if (fetchError || !workspace.onboarding_data_couple) {
        return { success: false, error: 'No onboarding data found to migrate' }
      }

      const onboardingData = workspace.onboarding_data_couple as OnboardingData
      const items = []

      // Create Wedding Stage & Couple items from step 2 (ACTUAL DATA LOCATION)
      const coupleDetails = onboardingData?.step_2 as any
      if (coupleDetails?.stage || coupleDetails?.weddingLocation) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'wedding_stage',
          data: {
            planning_stage: coupleDetails.stage,
            wedding_location: coupleDetails.weddingLocation,
            created_from_onboarding: true
          },
          title: 'Wedding Planning Stage',
          status: 'active'
        })
      }

      // Create Budget items from step 2 (couple details) - ACTUAL DATA LOCATION
      if (coupleDetails?.budgetValue && coupleDetails?.currency) {
        items.push({
          workspace_id: workspaceId,
          board_id: null, // Will be set when boards are created
          type: 'budget_setting',
          data: {
            total_budget: coupleDetails.budgetValue,
            currency: coupleDetails.currency,
            created_from_onboarding: true
          },
          title: 'Wedding Budget',
          status: 'active'
        })
      }

      // Create Guest items from step 3 (guest info) - ACTUAL DATA LOCATION  
      const guestInfo = onboardingData?.step_3 as any
      if (guestInfo?.guestCount) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'guest_summary',
          data: {
            expected_count: guestInfo.guestCount,
            international_guests: guestInfo.internationalGuests,
            special_requirements: guestInfo.specialRequirements,
            created_from_onboarding: true
          },
          title: 'Guest Information',
          status: 'draft'
        })
      }

      // Create Wedding Style items from step 4 (style preferences) - ACTUAL DATA LOCATION
      const weddingStyle = onboardingData?.step_4 as any
      if (weddingStyle?.themes || weddingStyle?.colorPalette) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'wedding_style',
          data: {
            themes: weddingStyle.themes,
            other_theme: weddingStyle.otherTheme,
            selected_color_palette: weddingStyle.selectedColorPalette,
            color_palette: weddingStyle.colorPalette,
            inspiration: weddingStyle.inspiration,
            created_from_onboarding: true
          },
          title: 'Wedding Style & Preferences',
          status: 'active'
        })
      }

      // Create Ceremony items from step 5 (budget-guests/experiences) - ACTUAL DATA LOCATION
      const experiences = onboardingData?.step_5 as any
      if (experiences?.ceremonyType) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'ceremony_details',
          data: {
            ceremony_type: experiences.ceremonyType,
            religious_type: experiences.religiousType,
            other_religious: experiences.otherReligious,
            experiences: experiences.experiences,
            other_experience: experiences.otherExperience,
            special_wishes: experiences.specialWishes,
            created_from_onboarding: true
          },
          title: 'Ceremony & Experiences',
          status: 'draft'
        })
      }

      // Create Wedding Date item from step 2 (ACTUAL DATA LOCATION)
      if (coupleDetails?.weddingDate) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'wedding_date',
          data: {
            date: coupleDetails.weddingDate,
            still_deciding: coupleDetails.stillDeciding || false,
            created_from_onboarding: true
          },
          title: 'Wedding Date',
          status: 'completed'
        })
      }

      // Create Couple info item from step 2 (ACTUAL DATA LOCATION)  
      if (coupleDetails?.partner1Name && coupleDetails?.partner2Name) {
        items.push({
          workspace_id: workspaceId,
          board_id: null,
          type: 'couple_info',
          data: {
            partner1_name: coupleDetails.partner1Name,
            partner2_name: coupleDetails.partner2Name,
            created_from_onboarding: true
          },
          title: 'Couple Information',
          status: 'active'
        })
      }

      // Get current user and default boards for proper item creation
      if (items.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          return { success: false, error: 'User not authenticated for migration' }
        }

        // Get existing boards for this workspace
        const { data: boards, error: boardsError } = await supabase
          .from('boards')
          .select('id, type')
          .eq('workspace_id', workspaceId)
          .order('position')

        if (boardsError) {
          console.warn('Could not fetch boards, items will be created without board assignment:', boardsError)
        }

        // Assign appropriate board_id based on item type
        const finalItems = items.map(item => {
          let boardId: string | undefined
          
          if (boards && boards.length > 0) {
            // Try to find appropriate board by type
            const targetBoard = boards.find(b => 
              (item.type.includes('budget') && b.type === 'budget') ||
              (item.type.includes('guest') && b.type === 'planning') ||
              (item.type.includes('ceremony') && b.type === 'planning') ||
              (item.type.includes('style') && b.type === 'planning') ||
              (item.type.includes('stage') && b.type === 'planning')
            )
            
            // Fallback to first board if no specific match
            boardId = targetBoard?.id || boards[0]?.id
          }

          // Only include items with valid board_id (required by schema)
          if (!boardId) {
            console.warn(`Skipping item ${item.title} - no valid board found`)
            return null
          }

          return {
            workspace_id: item.workspace_id,
            board_id: boardId,
            type: item.type,
            title: item.title,
            data: item.data,
            status: item.status as 'active' | 'completed' | 'draft' | 'archived',
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }).filter((item): item is NonNullable<typeof item> => item !== null) // Remove null items

        // Debug: Log what we're trying to insert
        console.log('🔍 About to insert items:', JSON.stringify(finalItems, null, 2))
        
        // Insert all items
        const { data: insertedItems, error: insertError } = await supabase
          .from('items')
          .insert(finalItems)
          .select()

        if (insertError) {
          console.error('Migration error:', insertError)
          console.error('Migration error code:', insertError.code)
          console.error('Migration error message:', insertError.message)
          console.error('Migration error details:', insertError.details)
          console.error('Migration error hint:', insertError.hint)
          console.error('Items attempted to insert:', JSON.stringify(finalItems, null, 2))
          return { success: false, error: `Failed to migrate items: ${insertError.message || 'Unknown database error'}` }
        }
        
        console.log('✅ Successfully inserted items:', insertedItems)

        console.log(`Successfully migrated ${finalItems.length} items from onboarding data`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error migrating onboarding data:', error)
      return { success: false, error: 'Failed to migrate onboarding data' }
    }
  }

  async isOnboardingComplete(): Promise<{ completed: boolean; error?: string }> {
    try {
      const workspaceId = await this.getWorkspaceId()
      if (!workspaceId) {
        return { completed: false, error: 'No workspace found' }
      }

      const supabase = createClientComponentClient()
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('onboarding_completed_at')
        .eq('id', workspaceId)
        .single()

      if (error) {
        return { completed: false, error: `Failed to check onboarding status: ${error.message}` }
      }

      return { completed: !!workspace.onboarding_completed_at }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      return { completed: false, error: 'An unexpected error occurred' }
    }
  }
}

// Singleton instance
export const onboardingService = new OnboardingDataService()

// Convenience hooks for React components
export function useOnboardingData() {
  return {
    saveStep: onboardingService.saveStep.bind(onboardingService),
    getStep: onboardingService.getStep.bind(onboardingService),
    getAllSteps: onboardingService.getAllSteps.bind(onboardingService),
    completeOnboarding: onboardingService.completeOnboarding.bind(onboardingService),
    isOnboardingComplete: onboardingService.isOnboardingComplete.bind(onboardingService),
  }
}
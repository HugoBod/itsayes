'use client'

import { supabase } from './supabase-client'
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

      // Create Budget items from step 2 (couple details)
      const coupleDetails = onboardingData?.step_2 as any
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

      // Create Guest items from step 3 (guest info)
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
          status: 'planning'
        })
      }

      // Create Ceremony items from step 5 (budget-guests/experiences)
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
          status: 'planning'
        })
      }

      // Create Wedding Date item from step 2
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
          status: 'confirmed'
        })
      }

      // Create Couple info item
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

      // Insert all items at once (for now, skip this since we need proper board_id and created_by)
      // TODO: Implement proper item creation after onboarding completion
      if (items.length > 0 && false) { // Temporarily disabled
        const { error: insertError } = await supabase
          .from('items')
          .insert(items as any)

        if (insertError) {
          return { success: false, error: `Failed to migrate items: ${insertError?.message || 'Unknown error'}` }
        }
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
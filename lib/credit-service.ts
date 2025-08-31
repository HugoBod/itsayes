import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

type SupabaseClient = ReturnType<typeof createClient<Database>>

interface CreditUsage {
  action: 'moodboard_generate' | 'moodboard_regenerate' | 'image_section_regenerate'
  credits_used: number
  description: string
}

interface CreditBalance {
  success: boolean
  total_credits: number
  used_credits: number
  remaining_credits: number
  error?: string
}

interface CreditTransaction {
  success: boolean
  transaction_id?: string
  remaining_credits?: number
  error?: string
}

class CreditService {
  // Credit costs for different operations
  private readonly CREDIT_COSTS = {
    moodboard_generate: 1,
    moodboard_regenerate: 1,
    image_section_regenerate: 1,
  } as const

  // Default credits for new accounts (increased for development testing)
  private readonly DEFAULT_CREDITS = 100

  /**
   * Gets the credit balance for a workspace
   */
  async getCreditBalance(supabase: SupabaseClient, workspaceId: string): Promise<CreditBalance> {
    try {
      // Get workspace info
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id, created_at')
        .eq('id', workspaceId)
        .single()

      if (workspaceError || !workspace) {
        return { 
          success: false, 
          total_credits: 0, 
          used_credits: 0, 
          remaining_credits: 0,
          error: 'Workspace not found' 
        }
      }

      // Get credit usage from activities
      const { data: activities, error: activitiesError } = await supabase
        .from('items')
        .select('data')
        .eq('workspace_id', workspaceId)
        .eq('type', 'activity')
        .like('data->>action', '%moodboard%')

      if (activitiesError) {
        console.error('Error fetching credit activities:', activitiesError)
      }

      // Calculate used credits
      let usedCredits = 0
      if (activities) {
        for (const activity of activities) {
          const activityData = activity.data as any
          if (activityData?.credits_used) {
            usedCredits += activityData.credits_used
          } else {
            // Backward compatibility - estimate credits for old activities
            if (activityData?.action?.includes('moodboard')) {
              usedCredits += 1
            }
          }
        }
      }

      const totalCredits = this.DEFAULT_CREDITS
      const remainingCredits = Math.max(0, totalCredits - usedCredits)

      return {
        success: true,
        total_credits: totalCredits,
        used_credits: usedCredits,
        remaining_credits: remainingCredits
      }
    } catch (error) {
      console.error('Error getting credit balance:', error)
      return { 
        success: false, 
        total_credits: 0, 
        used_credits: 0, 
        remaining_credits: 0,
        error: 'Failed to get credit balance' 
      }
    }
  }

  /**
   * Checks if enough credits are available for an operation
   */
  async hasEnoughCredits(
    supabase: SupabaseClient,
    workspaceId: string, 
    action: keyof typeof this.CREDIT_COSTS
  ): Promise<{ hasCredits: boolean; remaining: number; required: number }> {
    const balance = await this.getCreditBalance(supabase, workspaceId)
    const required = this.CREDIT_COSTS[action]
    
    return {
      hasCredits: balance.remaining_credits >= required,
      remaining: balance.remaining_credits,
      required
    }
  }

  /**
   * Uses credits for an operation and logs the transaction
   */
  async useCredits(
    supabase: SupabaseClient,
    workspaceId: string, 
    userId: string, 
    usage: CreditUsage
  ): Promise<CreditTransaction> {
    try {
      // Check if enough credits available
      const creditCheck = await this.hasEnoughCredits(supabase, workspaceId, usage.action)
      
      if (!creditCheck.hasCredits) {
        return {
          success: false,
          error: `Insufficient credits. Required: ${creditCheck.required}, Available: ${creditCheck.remaining}`
        }
      }

      // Log the credit usage as an activity
      const transactionId = `credit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      const { error: transactionError } = await supabase
        .from('items')
        .insert({
          workspace_id: workspaceId,
          board_id: null,
          type: 'activity',
          title: 'Credit Usage',
          data: {
            action: 'credit_used',
            transaction_id: transactionId,
            credit_action: usage.action,
            credits_used: usage.credits_used,
            description: usage.description,
            used_at: new Date().toISOString()
          },
          status: 'completed',
          created_by: userId
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error logging credit transaction:', transactionError)
        return {
          success: false,
          error: 'Failed to log credit usage'
        }
      }

      // Get updated balance
      const newBalance = await this.getCreditBalance(supabase, workspaceId)

      return {
        success: true,
        transaction_id: transactionId,
        remaining_credits: newBalance.remaining_credits
      }
    } catch (error) {
      console.error('Error using credits:', error)
      return {
        success: false,
        error: 'Failed to process credit transaction'
      }
    }
  }

  /**
   * Gets credit usage history for a workspace
   */
  async getCreditHistory(supabase: SupabaseClient, workspaceId: string, limit: number = 20): Promise<{
    success: boolean
    transactions?: Array<{
      id: string
      action: string
      credits_used: number
      description: string
      created_at: string
    }>
    error?: string
  }> {
    try {
      const { data: activities, error } = await supabase
        .from('items')
        .select('id, data, created_at')
        .eq('workspace_id', workspaceId)
        .eq('type', 'activity')
        .eq('data->>action', 'credit_used')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      const transactions = activities?.map(activity => ({
        id: activity.id,
        action: (activity.data as any)?.credit_action || 'unknown',
        credits_used: (activity.data as any)?.credits_used || 0,
        description: (activity.data as any)?.description || '',
        created_at: activity.created_at || new Date().toISOString()
      })) || []

      return {
        success: true,
        transactions
      }
    } catch (error) {
      console.error('Error getting credit history:', error)
      return {
        success: false,
        error: 'Failed to get credit history'
      }
    }
  }

  /**
   * Gets the credit cost for an action
   */
  getCreditCost(action: keyof typeof this.CREDIT_COSTS): number {
    return this.CREDIT_COSTS[action]
  }
}

// Singleton instance
export const creditService = new CreditService()

// Type exports
export type { CreditUsage, CreditBalance, CreditTransaction }
/**
 * Debug Onboarding Status in Database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugOnboardingStatus() {
  console.log('🔍 Debugging Onboarding Status in Database...\n')
  
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('❌ No user found or error:', userError?.message)
      return
    }
    
    console.log('✅ User found:', user.email, '(ID:', user.id, ')')
    
    // Check workspaces directly
    console.log('\n📋 All workspaces in database:')
    const { data: allWorkspaces, error: allError } = await supabase
      .from('workspaces')
      .select('id, name, account_id, onboarding_completed_at, created_at')
    
    if (allError) {
      console.error('❌ Error fetching all workspaces:', allError.message)
    } else {
      console.table(allWorkspaces)
    }
    
    // Check workspace_members
    console.log('\n👥 All workspace members:')
    const { data: allMembers, error: membersError } = await supabase
      .from('workspace_members')
      .select('workspace_id, user_id, role, created_at')
    
    if (membersError) {
      console.error('❌ Error fetching workspace members:', membersError.message)
    } else {
      console.table(allMembers)
    }
    
    // Check user's workspace via members
    console.log('\n🔍 User workspace via workspace_members:')
    const { data: userWorkspace, error: userWorkspaceError } = await supabase
      .from('workspaces')
      .select(`
        id,
        name,
        onboarding_completed_at,
        workspace_members!inner(
          user_id,
          role
        )
      `)
      .eq('workspace_members.user_id', user.id)
      .single()
    
    if (userWorkspaceError) {
      console.error('❌ Error getting user workspace:', userWorkspaceError.message)
    } else {
      console.log('✅ User workspace found:')
      console.log('   - ID:', userWorkspace.id)
      console.log('   - Name:', userWorkspace.name)
      console.log('   - Onboarding completed:', userWorkspace.onboarding_completed_at)
      console.log('   - Is completed?', !!userWorkspace.onboarding_completed_at)
    }
    
  } catch (error) {
    console.error('💥 Debug error:', error.message)
  }
}

debugOnboardingStatus()
  .then(() => {
    console.log('\n🎯 Debug complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })
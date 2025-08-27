import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/ai-service'
import { creditService } from '@/lib/credit-service'

// Service role client for admin operations (bypasses RLS)
const createServiceRoleClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
// OnboardingData import removed - AI service now handles raw data normalization

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteHandlerClient(request, response)
  
  try {
    // Get authenticated user - check Authorization header first, then fallback to cookies
    let user, authError
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    console.log('Auth header present:', !!authHeader)
    console.log('Token extracted:', !!token)

    if (token) {
      const result = await supabase.auth.getUser(token)
      user = result.data.user
      authError = result.error
      console.log('Token auth - User found:', !!user)
      console.log('Token auth - Error:', authError?.message)
    } else {
      // Fallback to cookie-based auth
      const result = await supabase.auth.getUser()
      user = result.data.user
      authError = result.error
      console.log('Cookie auth - User found:', !!user)
      console.log('Cookie auth - Error:', authError?.message)
    }

    if (authError || !user) {
      console.log('Authentication failed, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authentication successful, user ID:', user.id)

    // Get user's workspace - use service role client to bypass RLS for checking existing data
    console.log('About to query workspaces...')
    const adminSupabase = createServiceRoleClient()
    
    const { data: workspaces, error: workspaceError } = await adminSupabase
      .from('workspaces')
      .select(`
        id,
        onboarding_data_couple,
        workspace_members!inner(
          user_id,
          role
        )
      `)
      .eq('workspace_members.user_id', user.id)

    console.log('Workspace query completed:', !!workspaces, workspaces?.length, workspaceError?.message)

    let workspace: any

    if (workspaceError || !workspaces || workspaces.length === 0) {
      console.log('DEBUG - User has no workspaces, auto-creating account and workspace. User ID:', user.id)
      
      // Step 1: Check if user has an account (use service role to bypass RLS)
      const { data: accounts, error: accountError } = await adminSupabase
        .from('accounts')
        .select(`
          id,
          account_members!inner(
            user_id,
            role
          )
        `)
        .eq('account_members.user_id', user.id)
      
      let accountId: string
      
      if (accountError || !accounts || accounts.length === 0) {
        console.log('Creating account for user:', user.id)
        
        // Create account first
        const { data: newAccount, error: createAccountError } = await adminSupabase
          .from('accounts')
          .insert({
            type: 'personal',
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Account',
            billing_email: user.email,
            subscription_status: 'trial',
            workspace_limit: 1
          })
          .select()
          .single()
          
        if (createAccountError || !newAccount) {
          console.error('Failed to create account:', createAccountError)
          return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
        }
        
        // Create account membership
        const { error: accountMemberError } = await adminSupabase
          .from('account_members')
          .insert({
            account_id: newAccount.id,
            user_id: user.id,
            role: 'owner',
            accepted_at: new Date().toISOString()
          })
          
        if (accountMemberError) {
          console.error('Failed to create account membership:', accountMemberError)
          return NextResponse.json({ error: 'Failed to create account membership' }, { status: 500 })
        }
        
        accountId = newAccount.id
        console.log('Successfully created account:', accountId)
      } else {
        accountId = accounts[0].id
        console.log('Using existing account:', accountId)
      }
      
      // Step 2: Create workspace
      const { data: newWorkspace, error: createWorkspaceError } = await adminSupabase
        .from('workspaces')
        .insert({
          account_id: accountId,
          name: 'My Wedding',
          description: 'Your wedding planning workspace'
        })
        .select()
        .single()
        
      if (createWorkspaceError || !newWorkspace) {
        console.error('Failed to create workspace:', createWorkspaceError)
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }
      
      // Step 3: Create workspace membership (also use service role)
      const { error: workspaceMemberError } = await adminSupabase
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
          can_view_budget: true,
          can_edit_budget: true,
          can_view_planning: true,
          can_edit_planning: true,
          can_invite_others: true
        })
        
      if (workspaceMemberError) {
        console.error('Failed to create workspace membership:', workspaceMemberError)
        return NextResponse.json({ error: 'Failed to create workspace membership' }, { status: 500 })
      }
      
      console.log('Successfully created workspace:', newWorkspace.id)
      workspace = newWorkspace
    } else {
      // Use the first workspace (in v1, users have 1:1 relationship)
      workspace = workspaces[0]
      console.log('Using existing workspace:', workspace.id)
    }

    // Check if moodboard already exists
    const { data: existingMoodboard } = await adminSupabase
      .from('items')
      .select('id, data')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (existingMoodboard && existingMoodboard.data) {
      return NextResponse.json({ 
        success: true,
        data: existingMoodboard.data,
        message: 'Moodboard already exists'
      })
    }

    // Check credits before generation - DISABLED FOR DEVELOPMENT
    // const creditCheck = await creditService.hasEnoughCredits(supabase, workspace.id, 'moodboard_generate')
    // if (!creditCheck.hasCredits) {
    //   return NextResponse.json({ 
    //     error: `Insufficient credits. You need ${creditCheck.required} credits but only have ${creditCheck.remaining}.`,
    //     credits_required: creditCheck.required,
    //     credits_available: creditCheck.remaining
    //   }, { status: 402 }) // Payment Required
    // }
    
    console.log('Credit check bypassed for development')

    // Get onboarding data (raw format from database)
    const onboardingData = workspace.onboarding_data_couple
    if (!onboardingData) {
      return NextResponse.json({ error: 'No onboarding data found' }, { status: 400 })
    }

    // Generate moodboard with AI and storage (AI service will normalize the data)
    const moodboardResult = await aiService.generateMoodboard(onboardingData, workspace.id, adminSupabase)
    
    if (!moodboardResult.success || !moodboardResult.data) {
      return NextResponse.json({ 
        error: moodboardResult.error || 'Failed to generate moodboard' 
      }, { status: 500 })
    }

    // Get any existing board for this workspace (created by trigger)
    // According to database_config, boards should exist from user setup
    const { data: boards, error: boardError } = await adminSupabase
      .from('boards')
      .select('id, name, type')
      .eq('workspace_id', workspace.id)
      .limit(1)
    
    console.log('Board query result:', { boards, boardError, workspaceId: workspace.id })
    
    let boardId: string
    if (boardError || !boards || boards.length === 0) {
      console.error('No boards found for workspace, this should not happen with proper triggers:', boardError)
      return NextResponse.json({ 
        error: 'Workspace setup incomplete - no boards found. Please contact support.' 
      }, { status: 500 })
    }
    
    // Use the first available board (could be Budget or Planning from trigger)
    boardId = boards[0].id
    console.log('Using existing board:', { boardId, boardName: boards[0].name, boardType: boards[0].type })

    // Store moodboard in items table - use service role client to bypass RLS
    const moodboardData = {
      ...moodboardResult.data,
      created_at: new Date().toISOString(),
      workspace_id: workspace.id,
    }

    const { data: newMoodboard, error: insertError } = await adminSupabase
      .from('items')
      .insert({
        workspace_id: workspace.id,
        board_id: boardId,
        type: 'moodboard',
        title: 'Wedding Moodboard',
        data: moodboardData,
        status: 'active',
        created_by: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error saving moodboard:', insertError)
      return NextResponse.json({ error: 'Failed to save moodboard' }, { status: 500 })
    }

    // Use credits and log activity - DISABLED FOR DEVELOPMENT
    // const creditUsage = await creditService.useCredits(supabase, workspace.id, user.id, {
    //   action: 'moodboard_generate',
    //   credits_used: creditService.getCreditCost('moodboard_generate'),
    //   description: 'Generated AI wedding moodboard'
    // })

    // if (!creditUsage.success) {
    //   console.error('Credit usage failed:', creditUsage.error)
    //   // Continue anyway since moodboard was already created
    // }
    
    const creditUsage = { success: true, remaining_credits: 999, transaction_id: 'dev-mock' } // Mock for development

    // Log generation activity - use service role client to bypass RLS
    await adminSupabase
      .from('items')
      .insert({
        workspace_id: workspace.id,
        board_id: boardId, // Use the same board_id
        type: 'activity',
        title: 'Moodboard Generated',
        data: {
          action: 'moodboard_generated',
          description: 'AI moodboard created successfully',
          credits_used: creditService.getCreditCost('moodboard_generate'),
          metadata: {
            generation_time: new Date().toISOString(),
            ai_model: moodboardResult.data.generation_metadata?.model || 'dall-e-3',
            transaction_id: creditUsage.transaction_id
          }
        },
        status: 'completed',
        created_by: user.id
      })

    if (!newMoodboard) {
      return NextResponse.json({ error: 'Failed to create moodboard record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: moodboardData,
      moodboard_id: newMoodboard.id,
      credits_used: creditService.getCreditCost('moodboard_generate'),
      remaining_credits: creditUsage.remaining_credits
    })

  } catch (error) {
    console.error('Error in moodboard generation:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteHandlerClient(request, response)
  
  try {
    // Get authenticated user - check Authorization header first, then fallback to cookies
    let user, authError
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      const result = await supabase.auth.getUser(token)
      user = result.data.user
      authError = result.error
    } else {
      // Fallback to cookie-based auth
      const result = await supabase.auth.getUser()
      user = result.data.user
      authError = result.error
    }

    if (authError || !user) {
      console.log('GET Authentication failed, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('GET Authentication successful, user ID:', user.id)

    // Get user's workspace - use service role client to bypass RLS
    const adminSupabase = createServiceRoleClient()
    const { data: workspaces, error: workspaceError } = await adminSupabase
      .from('workspaces')
      .select(`
        id,
        workspace_members!inner(
          user_id,
          role
        )
      `)
      .eq('workspace_members.user_id', user.id)

    let workspace: any

    if (workspaceError || !workspaces || workspaces.length === 0) {
      console.log('GET - User has no workspaces, returning 404 for moodboard check')
      return NextResponse.json({ error: 'No moodboard found' }, { status: 404 })
    } else {
      // Use the first workspace (in v1, users have 1:1 relationship)
      workspace = workspaces[0]
      console.log('GET Using workspace:', workspace.id)
    }

    // Get existing moodboard
    const { data: moodboard, error: moodboardError } = await adminSupabase
      .from('items')
      .select('id, data, created_at, updated_at')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (moodboardError || !moodboard) {
      return NextResponse.json({ error: 'No moodboard found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: moodboard.data,
      moodboard_id: moodboard.id,
      created_at: moodboard.created_at,
      updated_at: moodboard.updated_at
    })

  } catch (error) {
    console.error('Error fetching moodboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
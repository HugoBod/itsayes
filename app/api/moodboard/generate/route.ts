import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { aiService } from '@/lib/ai-service'
import { creditService } from '@/lib/credit-service'
// OnboardingData import removed - AI service now handles raw data normalization

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteHandlerClient(request, response)
  
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
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
      .single()

    if (workspaceError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Check if moodboard already exists
    const { data: existingMoodboard } = await supabase
      .from('items')
      .select('id, data')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (existingMoodboard) {
      return NextResponse.json({ 
        success: true,
        data: existingMoodboard.data,
        message: 'Moodboard already exists'
      })
    }

    // Check credits before generation
    const creditCheck = await creditService.hasEnoughCredits(workspace.id, 'moodboard_generate')
    if (!creditCheck.hasCredits) {
      return NextResponse.json({ 
        error: `Insufficient credits. You need ${creditCheck.required} credits but only have ${creditCheck.remaining}.`,
        credits_required: creditCheck.required,
        credits_available: creditCheck.remaining
      }, { status: 402 }) // Payment Required
    }

    // Get onboarding data (raw format from database)
    const onboardingData = workspace.onboarding_data_couple
    if (!onboardingData) {
      return NextResponse.json({ error: 'No onboarding data found' }, { status: 400 })
    }

    // Generate moodboard with AI and storage (AI service will normalize the data)
    const moodboardResult = await aiService.generateMoodboard(onboardingData, workspace.id)
    
    if (!moodboardResult.success || !moodboardResult.data) {
      return NextResponse.json({ 
        error: moodboardResult.error || 'Failed to generate moodboard' 
      }, { status: 500 })
    }

    // Store moodboard in items table
    const moodboardData = {
      ...moodboardResult.data,
      created_at: new Date().toISOString(),
      workspace_id: workspace.id,
    }

    const { data: newMoodboard, error: insertError } = await supabase
      .from('items')
      .insert({
        workspace_id: workspace.id,
        board_id: null as any, // No specific board for moodboards - typing issue with nullable field
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

    // Use credits and log activity
    const creditUsage = await creditService.useCredits(workspace.id, user.id, {
      action: 'moodboard_generate',
      credits_used: creditService.getCreditCost('moodboard_generate'),
      description: 'Generated AI wedding moodboard'
    })

    if (!creditUsage.success) {
      console.error('Credit usage failed:', creditUsage.error)
      // Continue anyway since moodboard was already created
    }

    // Log generation activity
    await supabase
      .from('items')
      .insert({
        workspace_id: workspace.id,
        board_id: null as any,
        type: 'activity',
        title: 'Moodboard Generated',
        data: {
          action: 'moodboard_generated',
          description: 'AI moodboard created successfully',
          credits_used: creditService.getCreditCost('moodboard_generate'),
          metadata: {
            generation_time: new Date().toISOString(),
            ai_model: moodboardResult.data.generation_metadata.model,
            transaction_id: creditUsage.transaction_id
          }
        },
        status: 'completed',
        created_by: user.id
      })

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
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace
    const { data: workspace, error: workspaceError } = await supabase
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

    if (workspaceError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // Get existing moodboard
    const { data: moodboard, error: moodboardError } = await supabase
      .from('items')
      .select('id, data, created_at, updated_at')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (moodboardError) {
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
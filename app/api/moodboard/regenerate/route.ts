import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { aiService } from '@/lib/ai-service'
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

    // Parse request body
    const body = await request.json()
    const { focusArea = 'complete' } = body

    // Get user's workspace and current moodboard
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

    // Get existing moodboard
    const { data: existingMoodboard, error: moodboardError } = await supabase
      .from('items')
      .select('id, data')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (moodboardError || !existingMoodboard) {
      return NextResponse.json({ error: 'No moodboard found to regenerate' }, { status: 404 })
    }

    const onboardingData = workspace.onboarding_data_couple
    if (!onboardingData) {
      return NextResponse.json({ error: 'No onboarding data found' }, { status: 400 })
    }

    let regenerationResult

    // Handle different regeneration types
    if (focusArea === 'complete') {
      // Regenerate complete moodboard
      regenerationResult = await aiService.generateMoodboard(onboardingData)
      
      if (!regenerationResult.success || !regenerationResult.data) {
        return NextResponse.json({ 
          error: regenerationResult.error || 'Failed to regenerate moodboard' 
        }, { status: 500 })
      }

      // Update existing moodboard
      const { error: updateError } = await supabase
        .from('items')
        .update({
          data: {
            ...regenerationResult.data,
            regenerated_at: new Date().toISOString(),
            previous_generation: existingMoodboard.data
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMoodboard.id)

      if (updateError) {
        console.error('Error updating moodboard:', updateError)
        return NextResponse.json({ error: 'Failed to save regenerated moodboard' }, { status: 500 })
      }

      // Log regeneration activity
      await supabase
        .from('items')
        .insert({
          workspace_id: workspace.id,
          board_id: null as any,
          type: 'activity',
          title: 'Moodboard Regenerated',
          data: {
            action: 'moodboard_regenerated',
            description: 'Complete moodboard regenerated',
            metadata: {
              regeneration_time: new Date().toISOString(),
              focus_area: 'complete'
            }
          },
          status: 'completed',
          created_by: user.id
        })

      return NextResponse.json({
        success: true,
        data: regenerationResult.data,
        type: 'complete'
      })

    } else {
      // Regenerate individual section
      const validFocusAreas = ['ceremony', 'colors', 'reception', 'desserts'] as const
      type FocusArea = typeof validFocusAreas[number]
      
      if (!validFocusAreas.includes(focusArea as FocusArea)) {
        return NextResponse.json({ error: 'Invalid focus area' }, { status: 400 })
      }

      const imageResult = await aiService.regenerateImage(onboardingData, focusArea as FocusArea)
      
      if (!imageResult.success || !imageResult.image_url) {
        return NextResponse.json({ 
          error: imageResult.error || 'Failed to regenerate image section' 
        }, { status: 500 })
      }

      // For individual sections, we'd need to composite the new image with the existing one
      // For now, we'll return the new focused image
      return NextResponse.json({
        success: true,
        data: {
          image_url: imageResult.image_url,
          focus_area: focusArea,
          generated_at: new Date().toISOString()
        },
        type: 'section'
      })
    }

  } catch (error) {
    console.error('Error in moodboard regeneration:', error)
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
    const { searchParams } = new URL(request.url)
    const historyCount = parseInt(searchParams.get('history') || '5')

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

    // Get regeneration history
    const { data: regenerations, error: historyError } = await supabase
      .from('items')
      .select('id, data, created_at')
      .eq('workspace_id', workspace.id)
      .eq('type', 'activity')
      .ilike('title', '%Moodboard%')
      .order('created_at', { ascending: false })
      .limit(historyCount)

    if (historyError) {
      return NextResponse.json({ error: 'Failed to fetch regeneration history' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      history: regenerations || []
    })

  } catch (error) {
    console.error('Error fetching regeneration history:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
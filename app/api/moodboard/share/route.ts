import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'

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
    const { public: isPublic = true, expires_at } = body

    // Get user's workspace and moodboard
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

    // Get moodboard
    const { data: moodboard, error: moodboardError } = await supabase
      .from('items')
      .select('id, data, created_at')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (moodboardError || !moodboard) {
      return NextResponse.json({ error: 'No moodboard found to share' }, { status: 404 })
    }

    // Create share record
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const shareData = {
      workspace_id: workspace.id,
      board_id: null as any,
      type: 'moodboard_share',
      title: 'Shared Moodboard',
      data: {
        moodboard_id: moodboard.id,
        moodboard_data: moodboard.data,
        share_id: shareId,
        is_public: isPublic,
        created_at: new Date().toISOString(),
        expires_at: expires_at || null,
        creator_id: user.id
      },
      status: 'active' as const,
      created_by: user.id
    }

    const { data: shareRecord, error: shareError } = await supabase
      .from('items')
      .insert(shareData)
      .select()
      .single()

    if (shareError) {
      console.error('Error creating share record:', shareError)
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    // Generate share URL
    const shareUrl = `${request.nextUrl.origin}/shared/moodboard/${shareId}`

    // Log sharing activity
    await supabase
      .from('items')
      .insert({
        workspace_id: workspace.id,
        board_id: null as any,
        type: 'activity',
        title: 'Moodboard Shared',
        data: {
          action: 'moodboard_shared',
          description: 'Moodboard shared with public link',
          metadata: {
            share_id: shareId,
            share_url: shareUrl,
            is_public: isPublic,
            shared_at: new Date().toISOString()
          }
        },
        status: 'completed',
        created_by: user.id
      })

    return NextResponse.json({
      success: true,
      share_url: shareUrl,
      share_id: shareId,
      expires_at: expires_at
    })

  } catch (error) {
    console.error('Error creating moodboard share:', error)
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
    const shareId = searchParams.get('id')

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 })
    }

    // Get share record
    const { data: shareRecord, error: shareError } = await supabase
      .from('items')
      .select('data, created_at')
      .eq('type', 'moodboard_share')
      .eq('data->>share_id', shareId)
      .single()

    if (shareError || !shareRecord) {
      return NextResponse.json({ error: 'Share not found or expired' }, { status: 404 })
    }

    const shareData = shareRecord.data as any

    // Check if share is expired
    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      moodboard: shareData.moodboard_data,
      created_at: shareData.created_at,
      expires_at: shareData.expires_at
    })

  } catch (error) {
    console.error('Error fetching shared moodboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createRouteHandlerClient(request, response)
  
  try {
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧪 DEBUG REGEN: Starting forced moodboard regeneration...')

    // Delete existing moodboard to force regeneration
    const adminSupabase = createServiceRoleClient()
    const { data: workspaces } = await adminSupabase
      .from('workspaces')
      .select(`
        id,
        workspace_members!inner(
          user_id,
          role
        )
      `)
      .eq('workspace_members.user_id', user.id)

    if (!workspaces || workspaces.length === 0) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const workspace = workspaces[0]
    console.log('🧪 DEBUG REGEN: Using workspace:', workspace.id)

    // Delete existing moodboard
    const { error: deleteError } = await adminSupabase
      .from('items')
      .delete()
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')

    if (deleteError) {
      console.warn('🧪 DEBUG REGEN: Delete error (might not exist):', deleteError.message)
    } else {
      console.log('🧪 DEBUG REGEN: Existing moodboard deleted')
    }

    // Force regeneration with new 3-photo system
    const regenerateResponse = await fetch(`${request.nextUrl.origin}/api/moodboard/generate?type=3-photo&layout=grid-3x1&seed=${Date.now()}`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    const result = await regenerateResponse.json()
    console.log('🧪 DEBUG REGEN: Generation result:', result.success ? 'SUCCESS' : 'FAILED')

    return NextResponse.json({
      success: true,
      message: 'Forced regeneration completed',
      generation_result: result
    })

  } catch (error) {
    console.error('🧪 DEBUG REGEN: Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
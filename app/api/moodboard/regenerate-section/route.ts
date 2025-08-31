import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { imageGenerationService } from '@/lib/image-generation-service'
import { locationContextService } from '@/lib/location-context-service'
import { aiService } from '@/lib/ai-service'

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
    let user, authError
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token) {
      const result = await supabase.auth.getUser(token)
      user = result.data.user
      authError = result.error
    } else {
      const result = await supabase.auth.getUser()
      user = result.data.user
      authError = result.error
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { imageType, onboardingData } = await request.json()
    
    if (!imageType || !['venue-ceremony', 'style-decor', 'reception-dining'].includes(imageType)) {
      return NextResponse.json({ 
        error: 'Invalid image type. Must be: venue-ceremony, style-decor, or reception-dining' 
      }, { status: 400 })
    }

    if (!onboardingData) {
      return NextResponse.json({ error: 'Onboarding data is required' }, { status: 400 })
    }

    // Get user's workspace
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
      .limit(1)

    if (workspaceError || !workspaces || workspaces.length === 0) {
      return NextResponse.json({ error: 'No workspace found' }, { status: 404 })
    }

    const workspace = workspaces[0]

    // Get location context if available
    let locationContext
    const normalizedData = (aiService as any).normalizeOnboardingData(onboardingData)
    
    if (normalizedData.step_2?.wedding_location) {
      try {
        locationContext = await locationContextService.getLocationContext(
          normalizedData.step_2.wedding_location
        )
      } catch (locationError) {
        console.warn('Failed to get location context for regeneration:', locationError)
      }
    }

    // Regenerate specific image
    console.log(`🔄 Regenerating ${imageType} image...`)
    const regenerationResult = await imageGenerationService.regenerateSpecificImage(
      normalizedData,
      imageType,
      locationContext
    )

    if (!regenerationResult.success || !regenerationResult.image) {
      return NextResponse.json({ 
        error: regenerationResult.error || 'Failed to regenerate image' 
      }, { status: 500 })
    }

    // Update moodboard in database (optional - could store individual regenerated images)
    const { data: existingMoodboard } = await adminSupabase
      .from('items')
      .select('id, data')
      .eq('workspace_id', workspace.id)
      .eq('type', 'moodboard')
      .single()

    if (existingMoodboard && existingMoodboard.data) {
      // Update the source images in the existing moodboard data
      const updatedData = { ...existingMoodboard.data }
      
      if (!updatedData.source_images) {
        updatedData.source_images = []
      }

      // Replace or add the regenerated image
      const existingIndex = updatedData.source_images.findIndex(
        (img: any) => img.type === imageType
      )
      
      if (existingIndex >= 0) {
        updatedData.source_images[existingIndex] = regenerationResult.image
      } else {
        updatedData.source_images.push(regenerationResult.image)
      }
      
      updatedData.regeneration_history = [
        ...(updatedData.regeneration_history || []),
        {
          image_type: imageType,
          regenerated_at: new Date().toISOString(),
          user_id: user.id
        }
      ]

      // Update the moodboard record
      await adminSupabase
        .from('items')
        .update({ data: updatedData })
        .eq('id', existingMoodboard.id)
    }

    return NextResponse.json({
      success: true,
      image: regenerationResult.image,
      image_type: imageType,
      location_context: locationContext?.name,
      regenerated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in section regeneration:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
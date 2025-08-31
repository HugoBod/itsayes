import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/ai-service'
import { creditService } from '@/lib/credit-service'
import { buildScene } from '@/lib/moodboard-randomizer'
import { imageGenerationService } from '@/lib/image-generation-service'
import { imageCompositionService } from '@/lib/image-composition-service'
import { locationContextService } from '@/lib/location-context-service'
import { imageAnalysisService } from '@/lib/image-analysis-service'
import type { OnboardingData } from '@/lib/ai-service'

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

// New 3-photo moodboard generation function
async function generateThreePhotoMoodboard(
  onboardingData: OnboardingData,
  workspaceId: string,
  supabase: any,
  options: {
    layoutType: 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine'
    useLocationContext: boolean
    seed?: number
    skipSwapping: boolean
  }
) {
  const startTime = Date.now()
  
  try {
    console.log('🎲 Step 1: Generating randomized photo configurations')
    
    // Generate 3 photo configurations with randomization
    const randomizationResult = buildScene(onboardingData, options.seed)
    
    console.log(`✅ Selected categories: ${randomizationResult.metadata.categoriesSelected.join(', ')}`)
    console.log(`📊 Elements selected: ${randomizationResult.metadata.elementsSelected}`)
    
    // Get location context if requested
    let locationContext
    if (options.useLocationContext && onboardingData.step_2?.wedding_location) {
      try {
        locationContext = await locationContextService.getLocationContext(
          onboardingData.step_2.wedding_location
        )
        console.log(`🌍 Location context: ${locationContext.name}`)
      } catch (error) {
        console.warn('⚠️ Location context failed:', error)
      }
    }
    
    console.log('🖼️ Step 2: Generating 3 categorized photos')
    
    // Generate the 3 photos
    const photoResult = await imageGenerationService.generateCategorizedPhotos(
      randomizationResult.photos,
      onboardingData,
      locationContext
    )
    
    if (!photoResult.success || !photoResult.photos) {
      throw new Error(photoResult.error || 'Failed to generate photos')
    }
    
    console.log(`✅ Generated ${photoResult.photos.length} photos (${photoResult.fallbacks_used} fallbacks)`)
    
    // Step 3: Element swapping logic (if not skipped)
    let finalPhotos = photoResult.photos as [any, any, any]
    let swappingResult = { swapsPerformed: 0, conflictsResolved: [] as string[] }
    
    if (!options.skipSwapping) {
      console.log('🔍 Step 3a: Analyzing for visual conflicts...')
      try {
        const conflicts = await imageAnalysisService.detectVisualConflicts(finalPhotos, 2)
        
        if (conflicts.length > 0 && conflicts.some(c => c.recommendSwap)) {
          console.log(`🔄 Found ${conflicts.length} conflicts, performing swapping...`)
          
          const swapResult = await imageAnalysisService.regenerateWithDifferentElements(
            conflicts,
            finalPhotos,
            randomizationResult.photos,
            onboardingData,
            locationContext
          )
          
          if (swapResult.success) {
            finalPhotos = swapResult.finalPhotos
            swappingResult = {
              swapsPerformed: swapResult.swapsPerformed,
              conflictsResolved: swapResult.conflictsResolved
            }
            console.log(`✅ Swapping completed: ${swapResult.swapsPerformed} photos swapped`)
          }
        } else {
          console.log('✅ No significant conflicts detected, proceeding with original photos')
        }
      } catch (swapError) {
        console.warn('⚠️ Swapping failed, continuing with original photos:', swapError)
      }
    } else {
      console.log('⏭️ Swapping skipped as requested')
    }
    
    console.log('🎨 Step 4: Composing final moodboard')
    
    // Compose final moodboard with the final photos (potentially swapped)
    const compositionResult = await imageCompositionService.composeThreePhotoMoodboard(
      finalPhotos,
      randomizationResult.colorPalette,
      workspaceId,
      supabase,
      options.layoutType as 'grid-3x1' | 'l-shape' | 'diagonal'
    )
    
    if (!compositionResult.success) {
      throw new Error(compositionResult.error || 'Failed to compose moodboard')
    }
    
    const totalTime = Date.now() - startTime
    console.log(`🎉 3-photo moodboard completed in ${totalTime}ms`)
    
    // Return result in format compatible with existing system
    return {
      success: true,
      data: {
        image_url: compositionResult.composed_image_url || 
                  `data:image/jpeg;base64,${compositionResult.image_buffer?.toString('base64')}`,
        stored_image_url: compositionResult.composed_image_url,
        stored_image_path: compositionResult.stored_image_path,
        wedding_summary: `${onboardingData.step_3?.partner1_name || 'Partner 1'} & ${onboardingData.step_3?.partner2_name || 'Partner 2'} chose a ${randomizationResult.metadata.categoriesSelected.join(', ').toLowerCase()} wedding theme`,
        ai_insights: [
          `Your moodboard features ${randomizationResult.metadata.categoriesSelected.length} distinct style categories`,
          `We incorporated ${randomizationResult.metadata.elementsSelected} wedding elements`,
          `Color palette: ${randomizationResult.colorPalette}`,
          `Categories selected: ${randomizationResult.metadata.categoriesSelected.join(', ')}`
        ],
        style_guide: {
          color_palette: randomizationResult.colorPalette,
          style_keywords: randomizationResult.metadata.categoriesSelected,
          themes: randomizationResult.metadata.categoriesSelected.slice(0, 3)
        },
        generation_metadata: {
          prompt_used: '3-photo categorized generation',
          model: 'dall-e-3-categorized',
          generated_at: new Date().toISOString(),
          generation_type: '3-photo' as const,
          layout_type: options.layoutType,
          location_context: locationContext,
          randomization_seed: randomizationResult.seed,
          categories_generated: photoResult.categories_generated,
          fallbacks_used: photoResult.fallbacks_used,
          swaps_performed: swappingResult.swapsPerformed,
          conflicts_resolved: swappingResult.conflictsResolved
        },
        source_images: finalPhotos,
        composition_metadata: compositionResult.composition_metadata
      }
    }
  } catch (error) {
    console.error('❌ 3-photo generation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in 3-photo generation'
    }
  }
}

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

    // Parse query parameters for generation options
    const url = new URL(request.url)
    const layoutType = (url.searchParams.get('layout') as 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine') || 'magazine'
    const generationType = (url.searchParams.get('type') as 'single' | 'multi-image' | '3-photo') || 'multi-image'
    const useLocationContext = url.searchParams.get('location') !== 'false'
    const seedParam = url.searchParams.get('seed')
    const skipSwapping = url.searchParams.get('skipSwapping') === 'true'
    
    console.log(`Generation options: type=${generationType}, layout=${layoutType}, location=${useLocationContext}, seed=${seedParam}`)

    let moodboardResult
    
    // Use new 3-photo system for new layout types or explicit 3-photo request
    if (generationType === '3-photo' || ['grid-3x1', 'l-shape', 'diagonal'].includes(layoutType)) {
      console.log('🚀 Using new 3-photo moodboard generation system')
      moodboardResult = await generateThreePhotoMoodboard(
        onboardingData as OnboardingData,
        workspace.id,
        adminSupabase,
        {
          layoutType: layoutType as 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine',
          useLocationContext,
          seed: seedParam ? parseInt(seedParam) : undefined,
          skipSwapping
        }
      )
    } else {
      // Fallback to legacy system for backward compatibility
      console.log('📂 Using legacy moodboard generation system')
      moodboardResult = await aiService.generateMoodboard(
        onboardingData, 
        workspace.id, 
        adminSupabase,
        {
          layoutType,
          useLocationContext,
          generationType
        }
      )
    }
    
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
      remaining_credits: creditUsage.remaining_credits,
      generation_type: moodboardResult.data.generation_metadata?.generation_type || 'single',
      layout_type: moodboardResult.data.generation_metadata?.layout_type,
      location_context: moodboardResult.data.generation_metadata?.location_context?.name,
      source_images_count: moodboardResult.data.source_images?.length || 1,
      // New 3-photo system metadata (optional)
      ...(moodboardResult.data.generation_metadata?.randomization_seed && {
        randomization_seed: moodboardResult.data.generation_metadata.randomization_seed
      }),
      ...(moodboardResult.data.generation_metadata?.categories_generated && {
        categories_generated: moodboardResult.data.generation_metadata.categories_generated
      }),
      ...(moodboardResult.data.generation_metadata?.fallbacks_used !== undefined && {
        fallbacks_used: moodboardResult.data.generation_metadata.fallbacks_used
      })
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
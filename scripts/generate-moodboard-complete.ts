#!/usr/bin/env ts-node

/**
 * Générateur de moodboards complet utilisant le système existant
 * Workflow: onboarding → buildScene → generatePrompts → DALL-E → Supabase
 */

import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
// Import direct du système complet
import { buildScene } from '../lib/moodboard-randomizer'
import { generateBatchPrompts } from '../lib/moodboard-prompts'

// Type OnboardingData local pour éviter les problèmes d'import
interface OnboardingData {
  step_1?: any
  step_2?: {
    partner1Name?: string
    partner2Name?: string
    weddingDate?: string
    weddingLocation?: string
    stage?: string
    budgetValue?: number
    currency?: string
  }
  step_3?: {
    guestCount?: number
    internationalGuests?: boolean
    specialRequirements?: string
  }
  step_4?: {
    themes?: string[]
    selectedColorPalette?: string
    colorPalette?: string[]
    inspiration?: string
  }
  step_5?: {
    ceremonyType?: string
    religiousType?: string
    experiences?: string[]
    specialWishes?: string
  }
  [key: string]: any
}

const supabaseUrl = 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Variable OPENAI_API_KEY manquante dans .env.local')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface GenerationResult {
  success: boolean
  workspaceName: string
  imagesGenerated: number
  error?: string
}

async function generateImageWithDALLE(prompt: string, category: string): Promise<string | null> {
  console.log(`   🎨 DALL-E: ${category}`)
  console.log(`   📝 "${prompt.slice(0, 100)}..."`)
  
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "hd",
      style: "natural",
      n: 1,
    })

    console.log(`   ✅ Image générée`)
    return response.data?.[0]?.url || null
    
  } catch (error: any) {
    console.error(`   ❌ Erreur DALL-E:`, error.message)
    
    if (error.code === 'content_policy_violation') {
      console.log(`   🔄 Retry avec prompt sécurisé...`)
      try {
        const safePrompt = `Beautiful elegant wedding ${category} scene, professional photography, high quality, tasteful and appropriate`
        
        const retryResponse = await openai.images.generate({
          model: "dall-e-3", 
          prompt: safePrompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        })
        
        console.log(`   ✅ Image générée (retry)`)
        return retryResponse.data?.[0]?.url || null
      } catch (retryError: any) {
        console.error(`   ❌ Retry échoué:`, retryError.message)
      }
    }
    
    return null
  }
}

async function uploadImageToSupabase(
  imageUrl: string, 
  workspaceId: string, 
  photoIndex: number, 
  category: string
): Promise<string | null> {
  try {
    console.log(`   📥 Téléchargement de l'image...`)
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const imageBuffer = await response.arrayBuffer()
    const fileName = `${workspaceId}/moodboard-${photoIndex}-${category}-${Date.now()}.png`
    
    console.log(`   📤 Upload vers Supabase Storage...`)
    
    const { error: uploadError } = await supabase.storage
      .from('moodboard-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (uploadError) {
      console.error(`   ❌ Erreur upload:`, uploadError.message)
      return null
    }
    
    const { data: publicUrl } = supabase.storage
      .from('moodboard-images')
      .getPublicUrl(fileName)
    
    console.log(`   ✅ Image stockée`)
    return publicUrl.publicUrl
    
  } catch (error: any) {
    console.error(`   ❌ Erreur download/upload:`, error.message)
    return null
  }
}

async function generateCompleteMoodboard(workspaceId: string, workspaceName: string): Promise<GenerationResult> {
  console.log(`\n🎨 GÉNÉRATION COMPLÈTE: ${workspaceName}`)
  console.log('=' .repeat(50))
  
  try {
    // 1. Récupérer les données onboarding 
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('onboarding_data_couple')
      .eq('id', workspaceId)
      .single()
    
    if (wsError || !workspace?.onboarding_data_couple) {
      return {
        success: false,
        workspaceName,
        imagesGenerated: 0,
        error: 'Données onboarding manquantes'
      }
    }
    
    const onboardingData = workspace.onboarding_data_couple as OnboardingData
    console.log(`   📋 Données onboarding chargées`)
    
    // 2. Générer la scène avec le système existant
    console.log(`   🎲 Génération de la scène...`)
    const sceneResult = buildScene(onboardingData)
    
    console.log(`   ✅ Scène générée:`)
    console.log(`     - Photos: ${sceneResult.photos.length}`)
    console.log(`     - Seed: ${sceneResult.seed}`)
    console.log(`     - Palette: ${sceneResult.colorPalette}`)
    console.log(`     - Catégories: ${sceneResult.metadata.categoriesSelected.join(', ')}`)
    
    // 3. Générer les prompts optimisés
    console.log(`   📝 Génération des prompts...`)
    const prompts = generateBatchPrompts(sceneResult.photos, {
      qualityEnhancements: true,
      variationSeed: sceneResult.seed
    })
    
    console.log(`   ✅ ${prompts.length} prompts générés`)
    
    // 4. Trouver le board Moodboard
    const { data: moodboardBoard } = await supabase
      .from('boards')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('type', 'custom')
      .single()
    
    if (!moodboardBoard) {
      return {
        success: false,
        workspaceName,
        imagesGenerated: 0,
        error: 'Board Moodboard non trouvé'
      }
    }
    
    // 5. Générer et sauvegarder chaque image
    let successCount = 0
    
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i]
      const photoConfig = sceneResult.photos[i]
      
      console.log(`\n   🖼️ Image ${i + 1}/${prompts.length}: ${photoConfig.category}`)
      
      // Générer l'image avec DALL-E
      const dalleUrl = await generateImageWithDALLE(prompt.prompt, photoConfig.category)
      
      if (dalleUrl) {
        // Upload vers Supabase
        const supabaseUrl = await uploadImageToSupabase(dalleUrl, workspaceId, i + 1, photoConfig.category)
        
        if (supabaseUrl) {
          // Récupérer le owner du workspace pour created_by
          const { data: workspaceOwner } = await supabase
            .from('workspaces')
            .select('account_id')
            .eq('id', workspaceId)
            .single()
          
          const createdBy = workspaceOwner?.account_id || workspaceId
          
          // Sauvegarder l'item en base
          const { error: insertError } = await supabase
            .from('items')
            .insert({
              workspace_id: workspaceId,
              board_id: moodboardBoard.id,
              type: 'moodboard_generated',
              title: `${photoConfig.category} - ${photoConfig.subType}`,
              created_by: createdBy,
              data: {
                image_index: i + 1,
                image_url: supabaseUrl,
                dalle_original_url: dalleUrl,
                category: photoConfig.category,
                subType: photoConfig.subType,
                environment: photoConfig.environment,
                time: photoConfig.time,
                elements: photoConfig.elements || {},
                helpers: photoConfig.helpers || {},
                generated_prompt: prompt.prompt,
                prompt_metadata: prompt.metadata,
                scene_config: {
                  seed: sceneResult.seed,
                  colorPalette: sceneResult.colorPalette,
                  categoriesSelected: sceneResult.metadata.categoriesSelected
                },
                status: 'completed',
                generated_at: new Date().toISOString()
              }
            })
          
          if (!insertError) {
            successCount++
            console.log(`   ✅ Image ${i + 1} sauvegardée`)
          } else {
            console.error(`   ❌ Erreur sauvegarde:`, insertError.message)
          }
        }
      }
      
      // Pause entre les générations pour respecter les rate limits
      if (i < prompts.length - 1) {
        console.log(`   ⏳ Pause 3 secondes...`)
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    console.log(`   📊 Résultat: ${successCount}/${prompts.length} images`)
    
    return {
      success: successCount > 0,
      workspaceName,
      imagesGenerated: successCount
    }
    
  } catch (error: any) {
    console.error(`   ❌ Erreur:`, error.message)
    return {
      success: false,
      workspaceName,
      imagesGenerated: 0,
      error: error.message
    }
  }
}

async function main() {
  console.log('🎨 GÉNÉRATION MOODBOARDS AVEC SYSTÈME COMPLET')
  console.log('=' .repeat(60))
  
  try {
    // Test OpenAI
    console.log('🔑 Test OpenAI...')
    await openai.models.list()
    console.log('✅ OpenAI connecté')
    
    // Récupérer les workspaces de test
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('id, name')
      .gte('created_at', oneDayAgo)
      .not('onboarding_completed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) throw error
    
    console.log(`\n📁 ${workspaces.length} workspaces trouvés`)
    
    const results: GenerationResult[] = []
    
    for (const workspace of workspaces) {
      const result = await generateCompleteMoodboard(workspace.id, workspace.name)
      results.push(result)
    }
    
    // Résumé final
    const successCount = results.filter(r => r.success).length
    const totalImages = results.reduce((sum, r) => sum + r.imagesGenerated, 0)
    
    console.log(`\n🎉 GÉNÉRATION TERMINÉE`)
    console.log('=' .repeat(60))
    console.log(`✅ ${successCount}/${results.length} workspaces traités`)
    console.log(`🖼️ ${totalImages} images générées au total`)
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      const detail = result.success ? 
        `(${result.imagesGenerated} images)` : 
        `(${result.error})`
      console.log(`${status} ${result.workspaceName} ${detail}`)
    })
    
    if (successCount > 0) {
      console.log(`\n🚀 RÉSULTATS:`)
      console.log(`✅ Moodboards générés avec le système complet`)
      console.log(`🎲 Configurations basées sur l'onboarding`)
      console.log(`🌈 Palettes personnalisées`)
      console.log(`🎨 Prompts intelligents et contextualisés`)
      console.log(`📤 Images stockées dans Supabase Storage`)
      console.log(`\n🌐 Teste sur: http://localhost:3000`)
    }
    
  } catch (error: any) {
    console.error('❌ Erreur principale:', error.message)
    process.exit(1)
  }
}

main()
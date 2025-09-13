'use client'

import { createClientComponentClient } from './supabase'

interface MoodboardData {
  source_images?: Array<{
    url: string
    title?: string
    alt?: string
  }>
}

interface ImageExtractionResult {
  success: boolean
  featuredImageUrl?: string
  error?: string
}

/**
 * Extracts the first image from moodboard data and prepares it as featured image
 * For MVP, we'll use the first moodboard image directly
 * In the future, this could include resizing/optimization
 */
export async function extractFeaturedImage(
  moodboardData: MoodboardData | null,
  workspaceId: string
): Promise<ImageExtractionResult> {
  try {
    console.log('🖼️ Starting featured image extraction for workspace:', workspaceId)

    // Check if moodboard has images
    if (!moodboardData?.source_images || moodboardData.source_images.length === 0) {
      console.log('⚠️ No images found in moodboard data')
      return {
        success: false,
        error: 'No images available in moodboard'
      }
    }

    // Get the first image URL
    const firstImage = moodboardData.source_images[0]
    if (!firstImage?.url) {
      console.log('⚠️ First image has no URL')
      return {
        success: false,
        error: 'First image has no valid URL'
      }
    }

    console.log('✅ Featured image extracted:', firstImage.url)

    // For MVP, we'll use the original image URL directly
    // In the future, we could:
    // 1. Download and resize the image
    // 2. Upload to Supabase Storage
    // 3. Generate multiple sizes (thumbnail, medium, large)
    // 4. Add watermarking or compression

    return {
      success: true,
      featuredImageUrl: firstImage.url
    }
  } catch (error) {
    console.error('❌ Error extracting featured image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during image extraction'
    }
  }
}

/**
 * Updates workspace with featured image URL
 */
export async function updateWorkspaceFeaturedImage(
  workspaceId: string,
  featuredImageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient()

    console.log('💾 Updating workspace featured image:', workspaceId, featuredImageUrl)

    const { error } = await supabase
      .from('workspaces')
      .update({ featured_image_url: featuredImageUrl })
      .eq('id', workspaceId)

    if (error) {
      console.error('❌ Error updating workspace featured image:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Workspace featured image updated successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Error in updateWorkspaceFeaturedImage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Complete featured image extraction and update process
 */
export async function processFeaturedImage(
  moodboardData: MoodboardData | null,
  workspaceId: string
): Promise<{ success: boolean; featuredImageUrl?: string; error?: string }> {
  try {
    // Extract featured image
    const extractionResult = await extractFeaturedImage(moodboardData, workspaceId)

    if (!extractionResult.success || !extractionResult.featuredImageUrl) {
      return {
        success: false,
        error: extractionResult.error || 'Failed to extract featured image'
      }
    }

    // Update workspace with featured image
    const updateResult = await updateWorkspaceFeaturedImage(
      workspaceId,
      extractionResult.featuredImageUrl
    )

    if (!updateResult.success) {
      return {
        success: false,
        error: updateResult.error || 'Failed to update workspace with featured image'
      }
    }

    return {
      success: true,
      featuredImageUrl: extractionResult.featuredImageUrl
    }
  } catch (error) {
    console.error('❌ Error in processFeaturedImage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing featured image'
    }
  }
}
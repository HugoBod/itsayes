import { supabase } from './supabase-client'

interface ImageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

interface ImageDownloadResult {
  success: boolean
  blob?: Blob
  error?: string
}

class StorageService {
  private readonly MOODBOARD_BUCKET = 'moodboard-images'

  /**
   * Downloads an image from a URL and returns as Blob
   */
  private async downloadImageFromUrl(url: string): Promise<ImageDownloadResult> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      return { success: true, blob }
    } catch (error) {
      console.error('Error downloading image:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to download image' 
      }
    }
  }

  /**
   * Uploads an image blob to Supabase Storage
   */
  private async uploadImageBlob(
    blob: Blob, 
    fileName: string, 
    workspaceId: string
  ): Promise<ImageUploadResult> {
    try {
      const filePath = `${workspaceId}/${fileName}`
      
      const { error } = await supabase.storage
        .from(this.MOODBOARD_BUCKET)
        .upload(filePath, blob, {
          cacheControl: '31536000', // 1 year cache
          upsert: true, // Allow overwrite
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.MOODBOARD_BUCKET)
        .getPublicUrl(filePath)

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: filePath
      }
    } catch (error) {
      console.error('Error uploading to storage:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      }
    }
  }

  /**
   * Saves a DALL-E generated image to Supabase Storage
   */
  async saveMoodboardImage(
    imageUrl: string, 
    workspaceId: string, 
    metadata?: { 
      type?: 'main' | 'regenerated' | 'section'
      focus_area?: string
    }
  ): Promise<ImageUploadResult> {
    try {
      // Download image from DALL-E URL
      const downloadResult = await this.downloadImageFromUrl(imageUrl)
      if (!downloadResult.success || !downloadResult.blob) {
        return { 
          success: false, 
          error: downloadResult.error || 'Failed to download image' 
        }
      }

      // Generate filename with timestamp and metadata
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const type = metadata?.type || 'main'
      const focusArea = metadata?.focus_area ? `-${metadata.focus_area}` : ''
      const fileName = `moodboard-${type}${focusArea}-${timestamp}.png`

      // Upload to storage
      const uploadResult = await this.uploadImageBlob(
        downloadResult.blob, 
        fileName, 
        workspaceId
      )

      return uploadResult
    } catch (error) {
      console.error('Error saving moodboard image:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save image' 
      }
    }
  }

  /**
   * Lists all moodboard images for a workspace
   */
  async listMoodboardImages(workspaceId: string): Promise<{
    success: boolean
    images?: Array<{
      name: string
      url: string
      created_at: string
      size: number
    }>
    error?: string
  }> {
    try {
      const { data: files, error } = await supabase.storage
        .from(this.MOODBOARD_BUCKET)
        .list(workspaceId, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        throw error
      }

      const images = files?.map(file => ({
        name: file.name,
        url: supabase.storage.from(this.MOODBOARD_BUCKET).getPublicUrl(`${workspaceId}/${file.name}`).data.publicUrl,
        created_at: file.created_at,
        size: file.metadata?.size || 0
      })) || []

      return { success: true, images }
    } catch (error) {
      console.error('Error listing moodboard images:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to list images' 
      }
    }
  }

  /**
   * Deletes a moodboard image from storage
   */
  async deleteMoodboardImage(workspaceId: string, fileName: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const filePath = `${workspaceId}/${fileName}`
      
      const { error } = await supabase.storage
        .from(this.MOODBOARD_BUCKET)
        .remove([filePath])

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting moodboard image:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete image' 
      }
    }
  }

  /**
   * Ensures the moodboard bucket exists and has correct policies
   */
  async ensureBucketSetup(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        throw listError
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.MOODBOARD_BUCKET)
      
      if (!bucketExists) {
        // Create bucket (this would typically be done via Supabase dashboard in production)
        console.warn(`Bucket ${this.MOODBOARD_BUCKET} does not exist. Please create it via Supabase dashboard.`)
        return { 
          success: false, 
          error: `Storage bucket ${this.MOODBOARD_BUCKET} not found. Please create it in Supabase dashboard.` 
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error checking bucket setup:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to verify bucket setup' 
      }
    }
  }
}

// Singleton instance
export const storageService = new StorageService()

// Type exports
export type { ImageUploadResult, ImageDownloadResult }
import sharp from 'sharp'
import { GeneratedImage } from './image-generation-service'
import { storageService } from './storage-service'
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database'

type SupabaseClient = ReturnType<typeof createClient<Database>>

// Enhanced layout types for 3-photo compositions
interface MoodboardLayout {
  type: 'grid-3x1' | 'l-shape' | 'diagonal' | 'grid' | 'collage' | 'magazine'
  width: number
  height: number
  spacing: number
  background_color: string
}

// 3-Photo specific layout configurations
interface ThreePhotoLayout {
  type: 'grid-3x1' | 'l-shape' | 'diagonal'
  dimensions: { width: number; height: number }
  positions: [
    { x: number; y: number; width: number; height: number }, // Photo 1
    { x: number; y: number; width: number; height: number }, // Photo 2  
    { x: number; y: number; width: number; height: number }  // Photo 3
  ]
  colorPalettePosition: { x: number; y: number; width: number; height: number }
  titlePosition?: { x: number; y: number; width: number; height: number }
}

interface CompositionResult {
  success: boolean
  image_buffer?: Buffer
  composed_image_url?: string
  stored_image_path?: string
  composition_metadata?: {
    layout: MoodboardLayout
    source_images: GeneratedImage[]
    composed_at: string
    final_dimensions: { width: number; height: number }
  }
  error?: string
}

interface ImageDownloadResult {
  buffer: Buffer
  format: string
  dimensions: { width: number; height: number }
}

class ImageCompositionService {
  
  /**
   * Downloads and processes an image from URL
   */
  private async downloadImage(url: string): Promise<ImageDownloadResult> {
    try {
      // For local/fallback images, return placeholder
      if (url.startsWith('/images/') || url.startsWith('/public/')) {
        console.log(`📁 Using local placeholder for: ${url}`)
        
        // Create a placeholder image with text
        const placeholderText = url.includes('ceremony') ? 'CEREMONY' : 
                              url.includes('decor') ? 'DECORATION' : 
                              url.includes('reception') ? 'RECEPTION' : 'MOODBOARD'
        
        const placeholder = await sharp({
          create: {
            width: 512,
            height: 512,
            channels: 3,
            background: { r: 240, g: 240, b: 240 }
          }
        })
        .png()
        .toBuffer()
        
        return {
          buffer: placeholder,
          format: 'png',
          dimensions: { width: 512, height: 512 }
        }
      }

      console.log(`🌐 Downloading image: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Wedding-Moodboard-Generator/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Get image metadata
      const metadata = await sharp(buffer).metadata()
      
      return {
        buffer,
        format: metadata.format || 'jpeg',
        dimensions: {
          width: metadata.width || 512,
          height: metadata.height || 512
        }
      }
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error)
      throw new Error(`Image download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Resizes and crops image to fit specific dimensions
   */
  private async resizeImageForLayout(
    imageBuffer: Buffer, 
    targetWidth: number, 
    targetHeight: number
  ): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer()
  }

  /**
   * Creates a grid-based moodboard layout (2x2 or 3x1)
   */
  private async composeGridLayout(
    images: GeneratedImage[],
    layout: MoodboardLayout
  ): Promise<Buffer> {
    console.log('🔲 Creating grid layout moodboard')
    
    const { width, height, spacing } = layout
    const numImages = Math.min(images.length, 3) // Max 3 images
    
    // Calculate individual image dimensions based on layout
    let imageWidth: number, imageHeight: number, positions: { left: number; top: number }[]
    
    if (numImages === 3) {
      // 3x1 horizontal layout
      imageWidth = Math.floor((width - (spacing * 2)) / 3)
      imageHeight = height - (spacing * 2)
      positions = [
        { left: spacing, top: spacing },
        { left: spacing + imageWidth + spacing, top: spacing },
        { left: spacing + (imageWidth + spacing) * 2, top: spacing }
      ]
    } else {
      // 2x1 or single image fallback
      imageWidth = Math.floor((width - (spacing * (numImages + 1))) / numImages)
      imageHeight = height - (spacing * 2)
      positions = []
      for (let i = 0; i < numImages; i++) {
        positions.push({
          left: spacing + (imageWidth + spacing) * i,
          top: spacing
        })
      }
    }

    // Download and process all images
    const processedImages: { buffer: Buffer; position: { left: number; top: number } }[] = []
    
    for (let i = 0; i < numImages; i++) {
      const imageData = await this.downloadImage(images[i].url)
      const resizedBuffer = await this.resizeImageForLayout(
        imageData.buffer,
        imageWidth,
        imageHeight
      )
      
      processedImages.push({
        buffer: resizedBuffer,
        position: positions[i]
      })
    }

    // Create base canvas
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: layout.background_color
      }
    })

    // Compose all images onto canvas
    const composite = processedImages.map(({ buffer, position }) => ({
      input: buffer,
      left: position.left,
      top: position.top
    }))

    const result = await canvas
      .composite(composite)
      .jpeg({ quality: 90 })
      .toBuffer()

    console.log(`✅ Grid moodboard composed: ${width}x${height}`)
    return result
  }

  /**
   * Creates a magazine-style collage layout
   */
  private async composeMagazineLayout(
    images: GeneratedImage[],
    layout: MoodboardLayout
  ): Promise<Buffer> {
    console.log('📰 Creating magazine layout moodboard')
    
    const { width, height, spacing } = layout
    const numImages = Math.min(images.length, 3)

    // Magazine layout positions (asymmetric for visual interest)
    const layoutConfigs = {
      1: [{ width: width - spacing * 2, height: height - spacing * 2, left: spacing, top: spacing }],
      2: [
        { width: Math.floor(width * 0.6) - spacing, height: height - spacing * 2, left: spacing, top: spacing },
        { width: Math.floor(width * 0.4) - spacing, height: height - spacing * 2, left: Math.floor(width * 0.6) + spacing, top: spacing }
      ],
      3: [
        { width: Math.floor(width * 0.5) - spacing, height: Math.floor(height * 0.7) - spacing, left: spacing, top: spacing },
        { width: Math.floor(width * 0.5) - spacing, height: Math.floor(height * 0.3) - spacing, left: Math.floor(width * 0.5) + spacing, top: spacing },
        { width: Math.floor(width * 0.5) - spacing, height: Math.floor(height * 0.3) - spacing, left: Math.floor(width * 0.5) + spacing, top: Math.floor(height * 0.7) + spacing }
      ]
    }

    const positions = layoutConfigs[numImages as keyof typeof layoutConfigs] || layoutConfigs[1]

    // Download and process images
    const processedImages: { buffer: Buffer; position: typeof positions[0] }[] = []
    
    for (let i = 0; i < numImages; i++) {
      const imageData = await this.downloadImage(images[i].url)
      const resizedBuffer = await this.resizeImageForLayout(
        imageData.buffer,
        positions[i].width,
        positions[i].height
      )
      
      processedImages.push({
        buffer: resizedBuffer,
        position: positions[i]
      })
    }

    // Create base canvas
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: layout.background_color
      }
    })

    // Add subtle border/frame effect
    const frameBuffer = await sharp({
      create: {
        width: width - 4,
        height: height - 4,
        channels: 3,
        background: '#ffffff'
      }
    })
    .composite([{
      input: {
        create: {
          width: width - 20,
          height: height - 20,
          channels: 3,
          background: layout.background_color
        }
      },
      left: 8,
      top: 8
    }])
    .png()
    .toBuffer()

    // Compose all images
    const composite = [
      { input: frameBuffer, left: 2, top: 2 },
      ...processedImages.map(({ buffer, position }) => ({
        input: buffer,
        left: position.left,
        top: position.top
      }))
    ]

    const result = await canvas
      .composite(composite)
      .jpeg({ quality: 92 })
      .toBuffer()

    console.log(`✅ Magazine moodboard composed: ${width}x${height}`)
    return result
  }

  /**
   * Creates a modern collage layout with rounded corners
   */
  private async composeCollageLayout(
    images: GeneratedImage[],
    layout: MoodboardLayout
  ): Promise<Buffer> {
    console.log('🎨 Creating collage layout moodboard')
    
    const { width, height, spacing } = layout
    const numImages = Math.min(images.length, 3)
    const cornerRadius = 12

    // Dynamic collage positions
    const positions = this.calculateCollagePositions(numImages, width, height, spacing)

    // Download and process images with rounded corners
    const processedImages: { buffer: Buffer; position: { left: number; top: number; width: number; height: number } }[] = []
    
    for (let i = 0; i < numImages; i++) {
      const imageData = await this.downloadImage(images[i].url)
      
      // Create rounded corner mask
      const roundedCorners = Buffer.from(
        `<svg><rect x="0" y="0" width="${positions[i].width}" height="${positions[i].height}" rx="${cornerRadius}" ry="${cornerRadius}"/></svg>`
      )

      const resizedBuffer = await sharp(imageData.buffer)
        .resize(positions[i].width, positions[i].height, { fit: 'cover' })
        .composite([{
          input: roundedCorners,
          blend: 'dest-in'
        }])
        .png()
        .toBuffer()
      
      processedImages.push({
        buffer: resizedBuffer,
        position: positions[i]
      })
    }

    // Create base canvas with gradient background
    const gradientSvg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${layout.background_color};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f8f9fa;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
      </svg>
    `

    const canvas = sharp(Buffer.from(gradientSvg))

    // Compose images with drop shadows
    const composite = processedImages.map(({ buffer, position }) => ({
      input: buffer,
      left: position.left,
      top: position.top
    }))

    const result = await canvas
      .composite(composite)
      .jpeg({ quality: 90 })
      .toBuffer()

    console.log(`✅ Collage moodboard composed: ${width}x${height}`)
    return result
  }

  /**
   * Calculates optimal positions for collage layout
   */
  private calculateCollagePositions(
    numImages: number, 
    canvasWidth: number, 
    canvasHeight: number, 
    spacing: number
  ): { left: number; top: number; width: number; height: number }[] {
    const positions = []
    
    switch (numImages) {
      case 1:
        positions.push({
          left: spacing,
          top: spacing,
          width: canvasWidth - spacing * 2,
          height: canvasHeight - spacing * 2
        })
        break
        
      case 2:
        const halfWidth = Math.floor((canvasWidth - spacing * 3) / 2)
        positions.push(
          {
            left: spacing,
            top: spacing,
            width: halfWidth,
            height: canvasHeight - spacing * 2
          },
          {
            left: spacing * 2 + halfWidth,
            top: spacing,
            width: halfWidth,
            height: canvasHeight - spacing * 2
          }
        )
        break
        
      case 3:
      default:
        const thirdWidth = Math.floor((canvasWidth - spacing * 4) / 3)
        for (let i = 0; i < 3; i++) {
          positions.push({
            left: spacing + (thirdWidth + spacing) * i,
            top: spacing,
            width: thirdWidth,
            height: canvasHeight - spacing * 2
          })
        }
        break
    }
    
    return positions
  }

  /**
   * Main composition method
   */
  async composeMoodboard(
    images: GeneratedImage[],
    workspaceId?: string,
    supabase?: SupabaseClient,
    layoutType: MoodboardLayout['type'] = 'magazine'
  ): Promise<CompositionResult> {
    const startTime = Date.now()
    
    try {
      if (!images || images.length === 0) {
        throw new Error('No images provided for composition')
      }

      console.log(`🎨 Starting moodboard composition with ${images.length} images`)
      
      // Define layout based on type (legacy layouts)
      const layouts: Partial<Record<MoodboardLayout['type'], MoodboardLayout>> = {
        'grid': {
          type: 'grid',
          width: 1200,
          height: 800,
          spacing: 20,
          background_color: '#ffffff'
        },
        'collage': {
          type: 'collage',
          width: 1200,
          height: 800,
          spacing: 15,
          background_color: '#f8f9fa'
        },
        'magazine': {
          type: 'magazine',
          width: 1200,
          height: 800,
          spacing: 12,
          background_color: '#ffffff'
        },
        // New 3-photo layouts (placeholder - not used in legacy method)
        'grid-3x1': {
          type: 'grid-3x1',
          width: 1920,
          height: 800,
          spacing: 20,
          background_color: '#f8f8f8'
        },
        'l-shape': {
          type: 'l-shape',
          width: 1920,
          height: 1080,
          spacing: 20,
          background_color: '#f8f8f8'
        },
        'diagonal': {
          type: 'diagonal',
          width: 1920,
          height: 1080,
          spacing: 20,
          background_color: '#f8f8f8'
        }
      }

      const layout = layouts[layoutType]
      if (!layout) {
        throw new Error(`Unsupported layout type: ${layoutType}`)
      }

      // Compose based on layout type
      let imageBuffer: Buffer
      
      switch (layoutType) {
        case 'grid':
          imageBuffer = await this.composeGridLayout(images, layout)
          break
        case 'collage':
          imageBuffer = await this.composeCollageLayout(images, layout)
          break
        case 'magazine':
          imageBuffer = await this.composeMagazineLayout(images, layout)
          break
        default:
          throw new Error(`Legacy method doesn't support layout type: ${layoutType}`)
      }

      // Store composed image if workspace and supabase are provided
      let composed_image_url: string | undefined
      let stored_image_path: string | undefined

      if (workspaceId && supabase) {
        try {
          console.log('📤 Storing composed moodboard...')
          
          // Convert buffer to data URL for storage
          const base64Data = imageBuffer.toString('base64')
          const dataUrl = `data:image/jpeg;base64,${base64Data}`
          
          const storageResult = await storageService.saveMoodboardImage(
            supabase,
            dataUrl,
            workspaceId,
            { type: 'composed', layout: layoutType }
          )
          
          if (storageResult.success) {
            composed_image_url = storageResult.url
            stored_image_path = storageResult.path
            console.log('✅ Composed moodboard stored successfully')
          }
        } catch (storageError) {
          console.warn('⚠️ Failed to store composed image:', storageError)
          // Continue without storage - composition was successful
        }
      }

      const compositionTime = Date.now() - startTime
      console.log(`✅ Moodboard composition completed in ${compositionTime}ms`)

      return {
        success: true,
        image_buffer: imageBuffer,
        composed_image_url,
        stored_image_path,
        composition_metadata: {
          layout,
          source_images: images,
          composed_at: new Date().toISOString(),
          final_dimensions: {
            width: layout.width,
            height: layout.height
          }
        }
      }
    } catch (error) {
      console.error('❌ Moodboard composition failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown composition error'
      }
    }
  }

  /**
   * Creates a preview/thumbnail of the composed moodboard
   */
  async createThumbnail(
    imageBuffer: Buffer,
    width: number = 400,
    height: number = 300
  ): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()
  }

  /**
   * NEW METHOD: Compose 3-photo moodboard with color palette integration
   */
  async composeThreePhotoMoodboard(
    photos: [GeneratedImage, GeneratedImage, GeneratedImage],
    colorPalette: string,
    workspaceId?: string,
    supabase?: SupabaseClient,
    layoutType: ThreePhotoLayout['type'] = 'grid-3x1'
  ): Promise<CompositionResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🖼️ Starting 3-photo moodboard composition with ${layoutType} layout`)
      
      // Download all photos
      console.log('📥 Downloading photos...')
      const imageData = await Promise.all(
        photos.map(photo => this.downloadImage(photo.url))
      )
      
      // Get layout configuration
      const layout = this.getThreePhotoLayout(layoutType)
      
      // Create base canvas
      const canvas = sharp({
        create: {
          width: layout.dimensions.width,
          height: layout.dimensions.height,
          channels: 4,
          background: { r: 248, g: 248, b: 248, alpha: 1 } // Light background
        }
      })
      
      // Prepare composite layers
      const compositeLayers = []
      
      // Add photos
      for (let i = 0; i < 3; i++) {
        const pos = layout.positions[i]
        const resizedPhoto = await sharp(imageData[i].buffer)
          .resize(pos.width, pos.height, { fit: 'cover', position: 'center' })
          .toBuffer()
          
        compositeLayers.push({
          input: resizedPhoto,
          left: pos.x,
          top: pos.y
        })
      }
      
      // Add color palette
      const paletteBuffer = await this.generateColorPalette(colorPalette, layout.colorPalettePosition)
      compositeLayers.push({
        input: paletteBuffer,
        left: layout.colorPalettePosition.x,
        top: layout.colorPalettePosition.y
      })
      
      // Add title if position defined
      if (layout.titlePosition) {
        const titleBuffer = await this.generateTitle('Wedding Moodboard', layout.titlePosition)
        compositeLayers.push({
          input: titleBuffer,
          left: layout.titlePosition.x,
          top: layout.titlePosition.y
        })
      }
      
      // Compose final image
      const composedBuffer = await canvas
        .composite(compositeLayers)
        .jpeg({ quality: 95 })
        .toBuffer()
      
      // Store the composed image if workspace provided
      let storedImageUrl: string | undefined
      let storedImagePath: string | undefined
      
      if (workspaceId && supabase) {
        try {
          const filename = `3photo-moodboard-${layoutType}-${Date.now()}.jpg`
          const storageResult = await storageService.saveMoodboardImage(
            supabase,
            `data:image/jpeg;base64,${composedBuffer.toString('base64')}`,
            workspaceId,
            { type: '3-photo-moodboard', layout: layoutType }
          )
          
          if (storageResult.success) {
            storedImageUrl = storageResult.url
            storedImagePath = storageResult.path
          }
        } catch (storageError) {
          console.warn('Failed to store composed image:', storageError)
        }
      }
      
      const compositionTime = Date.now() - startTime
      console.log(`✅ 3-photo moodboard composed in ${compositionTime}ms`)
      
      return {
        success: true,
        image_buffer: composedBuffer,
        composed_image_url: storedImageUrl,
        stored_image_path: storedImagePath,
        composition_metadata: {
          layout: {
            type: layoutType,
            width: layout.dimensions.width,
            height: layout.dimensions.height,
            spacing: 20,
            background_color: '#f8f8f8'
          },
          source_images: photos,
          composed_at: new Date().toISOString(),
          final_dimensions: layout.dimensions
        }
      }
    } catch (error) {
      console.error('❌ 3-photo composition failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown composition error'
      }
    }
  }

  /**
   * Get layout configuration for 3-photo compositions
   */
  private getThreePhotoLayout(type: ThreePhotoLayout['type']): ThreePhotoLayout {
    const layouts: Record<ThreePhotoLayout['type'], ThreePhotoLayout> = {
      'grid-3x1': {
        type: 'grid-3x1',
        dimensions: { width: 1920, height: 800 },
        positions: [
          { x: 50, y: 50, width: 560, height: 560 },   // Photo 1: left
          { x: 680, y: 50, width: 560, height: 560 },  // Photo 2: center
          { x: 1310, y: 50, width: 560, height: 560 }  // Photo 3: right
        ],
        colorPalettePosition: { x: 50, y: 650, width: 1820, height: 100 }
      },
      
      'l-shape': {
        type: 'l-shape',
        dimensions: { width: 1920, height: 1080 },
        positions: [
          { x: 50, y: 50, width: 800, height: 600 },   // Photo 1: large left
          { x: 900, y: 50, width: 470, height: 280 },  // Photo 2: top right
          { x: 900, y: 370, width: 470, height: 280 }  // Photo 3: bottom right
        ],
        colorPalettePosition: { x: 50, y: 700, width: 1320, height: 80 },
        titlePosition: { x: 50, y: 820, width: 800, height: 60 }
      },
      
      'diagonal': {
        type: 'diagonal',
        dimensions: { width: 1920, height: 1080 },
        positions: [
          { x: 100, y: 100, width: 500, height: 400 },  // Photo 1: top left
          { x: 710, y: 300, width: 500, height: 400 },  // Photo 2: center
          { x: 1320, y: 500, width: 500, height: 400 }  // Photo 3: bottom right
        ],
        colorPalettePosition: { x: 100, y: 950, width: 1720, height: 80 }
      }
    }
    
    return layouts[type]
  }

  /**
   * Generate color palette visual element
   */
  private async generateColorPalette(
    colorPalette: string,
    position: { width: number; height: number }
  ): Promise<Buffer> {
    // Parse color palette and create visual representation
    const colors = this.parseColorPalette(colorPalette)
    
    if (colors.length === 0) {
      colors.push('#f8f8f8', '#e5e5e5', '#d1d5db') // Default colors
    }
    
    const colorWidth = Math.floor(position.width / colors.length)
    
    // Create color swatches
    const swatches = await Promise.all(colors.map(async (color) => {
      return sharp({
        create: {
          width: colorWidth,
          height: position.height,
          channels: 4,
          background: color
        }
      }).png().toBuffer()
    }))
    
    // Combine swatches
    const composite = swatches.map((swatch, index) => ({
      input: swatch,
      left: index * colorWidth,
      top: 0
    }))
    
    return sharp({
      create: {
        width: position.width,
        height: position.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .composite(composite)
    .png()
    .toBuffer()
  }

  /**
   * Generate title text element
   */
  private async generateTitle(
    title: string,
    position: { width: number; height: number }
  ): Promise<Buffer> {
    // Create SVG text
    const svg = `
      <svg width="${position.width}" height="${position.height}">
        <text x="20" y="${position.height * 0.7}" 
              font-family="Georgia, serif" 
              font-size="36" 
              font-weight="300" 
              fill="#2d3748">${title}</text>
      </svg>
    `
    
    return sharp(Buffer.from(svg))
      .png()
      .toBuffer()
  }

  /**
   * Parse color palette string to hex colors
   */
  private parseColorPalette(colorPalette: string): string[] {
    // Common color name mappings
    const colorMap: Record<string, string> = {
      white: '#ffffff',
      ivory: '#fffff0', 
      cream: '#f5f5dc',
      beige: '#f5f5dc',
      blush: '#ffc0cb',
      pink: '#ffc0cb',
      rose: '#ff69b4',
      gold: '#ffd700',
      champagne: '#f7e7ce',
      silver: '#c0c0c0',
      sage: '#87a96b',
      eucalyptus: '#87a96b',
      green: '#008000',
      navy: '#000080',
      blue: '#0000ff',
      burgundy: '#800020',
      wine: '#722f37',
      black: '#000000',
      gray: '#808080',
      grey: '#808080'
    }
    
    const colors: string[] = []
    const lowerPalette = colorPalette.toLowerCase()
    
    // Extract colors from the palette description
    for (const [name, hex] of Object.entries(colorMap)) {
      if (lowerPalette.includes(name) && !colors.includes(hex)) {
        colors.push(hex)
      }
    }
    
    return colors.slice(0, 5) // Limit to 5 colors
  }
}

// Singleton instance
export const imageCompositionService = new ImageCompositionService()

// Type exports
export type { 
  MoodboardLayout,
  ThreePhotoLayout,
  CompositionResult 
}
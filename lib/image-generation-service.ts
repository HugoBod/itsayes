import OpenAI from 'openai'
import { locationContextService, LocationContext } from './location-context-service'
import { generatePromptsWithLocation, generateBatchPrompts, generateBatchPromptsWithOnboarding } from './moodboard-prompts'
import type { OnboardingData } from './ai-service'
import type { PhotoConfiguration } from './moodboard-categories'

// Legacy interface for backward compatibility
interface ImageGenerationRequest {
  type: 'venue-ceremony' | 'style-decor' | 'reception-dining'
  prompt: string
  characteristics: string
  locationContext?: LocationContext
}

// New interface for categorized photo generation
interface CategorizedPhotoRequest {
  category: string
  photoConfig: PhotoConfiguration
  prompt: string
  locationContext?: LocationContext
}

interface GeneratedImage {
  type: ImageGenerationRequest['type'] | string
  url: string
  prompt_used: string
  generation_metadata: {
    model: string
    generated_at: string
    style_focus: string
    category?: string
    elements_included?: string[]
  }
}

interface MultiImageResult {
  success: boolean
  images?: GeneratedImage[]
  error?: string
  generation_time: number
}

// New interface for categorized photo generation result
interface CategorizedPhotoResult {
  success: boolean
  photos?: GeneratedImage[]
  error?: string
  generation_time: number
  categories_generated: string[]
  fallbacks_used: number
}

class ImageGenerationService {
  private openai: OpenAI | null

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY is not configured - using fallback images')
      this.openai = null
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Extracts wedding characteristics for image generation
   */
  private extractWeddingCharacteristics(data: OnboardingData): string {
    const characteristics = []

    // Couple info
    if (data.step_3?.partner1_name && data.step_3?.partner2_name) {
      characteristics.push(`Couple: ${data.step_3.partner1_name} & ${data.step_3.partner2_name}`)
    }

    // Location and planning stage
    if (data.step_2?.wedding_location) {
      characteristics.push(`Location: ${data.step_2.wedding_location}`)
    }

    // Wedding date and season
    if (data.step_3?.wedding_date) {
      const date = new Date(data.step_3.wedding_date)
      const season = this.getSeasonFromDate(date)
      characteristics.push(`Season: ${season}`)
    }

    // Guest count and scale
    if (data.step_4?.guest_count) {
      const scale = data.step_4.guest_count > 100 ? 'large' : data.step_4.guest_count > 50 ? 'medium' : 'intimate'
      characteristics.push(`Scale: ${scale} (${data.step_4.guest_count} guests)`)
    }

    // Budget level
    if (data.step_3?.budget && data.step_3?.currency) {
      const budgetLevel = data.step_3.budget > 50000 ? 'luxury' : data.step_3.budget > 25000 ? 'elegant' : 'charming'
      characteristics.push(`Budget level: ${budgetLevel}`)
    }

    // Style and themes
    if (data.step_5?.themes) {
      const themesArray = Array.isArray(data.step_5.themes) ? data.step_5.themes : [data.step_5.themes]
      characteristics.push(`Style: ${themesArray.join(', ')}`)
    }
    
    if (data.step_5?.color_palette) {
      characteristics.push(`Colors: ${data.step_5.color_palette}`)
    }

    // Style inspiration (free text from user)
    if (data.step_5?.inspiration?.trim()) {
      characteristics.push(`Style inspiration: "${data.step_5.inspiration}"`)
    }

    // Ceremony type
    if (data.step_6?.ceremony_type) {
      characteristics.push(`Ceremony: ${data.step_6.ceremony_type}`)
      if (data.step_6.religion) {
        characteristics.push(`Religious: ${data.step_6.religion}`)
      }
    }

    // Special wishes
    if (data.step_6?.special_wishes?.trim()) {
      characteristics.push(`Special wishes: "${data.step_6.special_wishes}"`)
    }

    return characteristics.join(', ')
  }

  /**
   * Determines season from date
   */
  private getSeasonFromDate(date: Date): string {
    const month = date.getMonth() + 1 // getMonth() returns 0-11
    
    if (month >= 3 && month <= 5) return 'Spring'
    if (month >= 6 && month <= 8) return 'Summer'
    if (month >= 9 && month <= 11) return 'Fall'
    return 'Winter'
  }

  /**
   * Generates location-aware venue/ceremony prompt
   */
  private generateVenueCeremonyPrompt(
    characteristics: string, 
    locationContext?: LocationContext
  ): string {
    const basePrompt = "Wedding ceremony venue and setting"
    
    let locationDetails = ""
    if (locationContext) {
      locationDetails = `
Location: ${locationContext.name}
Architecture: ${locationContext.architecture_style}
Popular venues: ${locationContext.popular_venues.join(', ')}
Cultural elements: ${locationContext.cultural_elements.join(', ')}
Climate: ${locationContext.climate}`
    }

    return `${basePrompt}${locationDetails}

Wedding characteristics: ${characteristics}

Style requirements:
- Authentic to the location's architectural style
- Professional wedding photography aesthetic
- Ceremony setup with altar/arch and seating arrangement
- Natural lighting appropriate for the climate
- Cultural elements integrated naturally
- Elegant and romantic atmosphere
- High-resolution professional quality

Focus on the ceremony space, seating arrangement, and architectural details of the venue.`
  }

  /**
   * Generates style and decor focused prompt
   */
  private generateStyleDecorPrompt(
    characteristics: string,
    locationContext?: LocationContext
  ): string {
    const basePrompt = "Wedding decoration and styling details"
    
    let culturalInfluence = ""
    if (locationContext) {
      culturalInfluence = `
Cultural influence: ${locationContext.cultural_elements.join(', ')}
Local traditions: ${locationContext.local_traditions.join(', ')}`
    }

    return `${basePrompt}${culturalInfluence}

Wedding characteristics: ${characteristics}

Style requirements:
- Focus on color palette, floral arrangements, and decorative elements
- Centerpieces, linens, and table styling
- Lighting design and ambiance
- Cultural decorative elements when appropriate
- Cohesive design theme throughout
- Magazine-quality styling photography
- Luxury wedding aesthetic
- Professional event design

Emphasize flowers, colors, textures, and decorative details.`
  }

  /**
   * Generates reception and dining focused prompt
   */
  private generateReceptionDiningPrompt(
    characteristics: string,
    locationContext?: LocationContext
  ): string {
    const basePrompt = "Wedding reception dining and celebration atmosphere"
    
    let localInfluence = ""
    if (locationContext) {
      localInfluence = `
Local cuisine influence: ${locationContext.cultural_elements.join(', ')}
Climate considerations: ${locationContext.climate}`
    }

    return `${basePrompt}${localInfluence}

Wedding characteristics: ${characteristics}

Style requirements:
- Reception table setup and dining arrangements
- Ambient lighting for evening celebration
- Dance floor and entertainment areas
- Bar setup and cocktail areas
- Cultural food presentation when appropriate
- Celebratory atmosphere
- Professional event photography
- Luxury reception aesthetic
- Guest interaction and celebration spaces

Focus on the dining experience, celebration atmosphere, and guest enjoyment.`
  }

  /**
   * Generates fallback images for development/testing
   */
  private generateFallbackImages(
    requests: ImageGenerationRequest[]
  ): GeneratedImage[] {
    const fallbackImageMap = {
      'venue-ceremony': [
        '/images/fallback/ceremony-1.webp',
        '/images/fallback/ceremony-2.webp',
        '/images/fallback/ceremony-3.webp'
      ],
      'style-decor': [
        '/images/fallback/decor-1.webp',
        '/images/fallback/decor-2.webp',
        '/images/fallback/decor-3.webp'
      ],
      'reception-dining': [
        '/images/fallback/reception-1.webp',
        '/images/fallback/reception-2.webp',
        '/images/fallback/reception-3.webp'
      ]
    }

    return requests.map((request, index) => ({
      type: request.type,
      url: fallbackImageMap[request.type][index % fallbackImageMap[request.type].length],
      prompt_used: request.prompt,
      generation_metadata: {
        model: 'fallback',
        generated_at: new Date().toISOString(),
        style_focus: request.type
      }
    }))
  }

  /**
   * Generates a single image using DALL-E
   */
  private async generateSingleImage(request: ImageGenerationRequest): Promise<GeneratedImage> {
    if (!this.openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      const imageResponse = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: request.prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      })

      if (!imageResponse.data?.[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }

      return {
        type: request.type,
        url: imageResponse.data[0].url,
        prompt_used: request.prompt,
        generation_metadata: {
          model: 'dall-e-3',
          generated_at: new Date().toISOString(),
          style_focus: request.type
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${request.type} image:`, error)
      throw error
    }
  }

  /**
   * Main method to generate multiple specialized images
   */
  async generateMultipleImages(
    onboardingData: OnboardingData,
    locationContext?: LocationContext
  ): Promise<MultiImageResult> {
    const startTime = Date.now()
    
    try {
      const characteristics = this.extractWeddingCharacteristics(onboardingData)
      
      // Create specialized prompts for each image type
      const requests: ImageGenerationRequest[] = [
        {
          type: 'venue-ceremony',
          prompt: this.generateVenueCeremonyPrompt(characteristics, locationContext),
          characteristics,
          locationContext
        },
        {
          type: 'style-decor',
          prompt: this.generateStyleDecorPrompt(characteristics, locationContext),
          characteristics,
          locationContext
        },
        {
          type: 'reception-dining',
          prompt: this.generateReceptionDiningPrompt(characteristics, locationContext),
          characteristics,
          locationContext
        }
      ]

      console.log('🎨 Starting multi-image generation...')

      let images: GeneratedImage[]

      if (!this.openai) {
        console.log('⚠️ OpenAI not available, using fallback images')
        images = this.generateFallbackImages(requests)
      } else {
        try {
          // Generate all images in parallel with timeout
          const imagePromises = requests.map(request => 
            Promise.race([
              this.generateSingleImage(request),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Image generation timeout')), 30000)
              )
            ])
          )

          images = await Promise.all(imagePromises)
          console.log('✅ All images generated successfully')
        } catch (error) {
          console.warn('⚠️ DALL-E generation failed, using fallback:', error)
          images = this.generateFallbackImages(requests)
        }
      }

      const generation_time = Date.now() - startTime

      return {
        success: true,
        images,
        generation_time
      }
    } catch (error) {
      console.error('❌ Multi-image generation failed:', error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generation_time: Date.now() - startTime
      }
    }
  }

  /**
   * Regenerates a specific image type
   */
  async regenerateSpecificImage(
    onboardingData: OnboardingData,
    imageType: ImageGenerationRequest['type'],
    locationContext?: LocationContext
  ): Promise<{ success: boolean; image?: GeneratedImage; error?: string }> {
    try {
      const characteristics = this.extractWeddingCharacteristics(onboardingData)
      
      let prompt: string
      switch (imageType) {
        case 'venue-ceremony':
          prompt = this.generateVenueCeremonyPrompt(characteristics, locationContext)
          break
        case 'style-decor':
          prompt = this.generateStyleDecorPrompt(characteristics, locationContext)
          break
        case 'reception-dining':
          prompt = this.generateReceptionDiningPrompt(characteristics, locationContext)
          break
        default:
          throw new Error(`Unknown image type: ${imageType}`)
      }

      const request: ImageGenerationRequest = {
        type: imageType,
        prompt,
        characteristics,
        locationContext
      }

      if (!this.openai) {
        const fallbackImages = this.generateFallbackImages([request])
        return {
          success: true,
          image: fallbackImages[0]
        }
      }

      const image = await this.generateSingleImage(request)
      
      return {
        success: true,
        image
      }
    } catch (error) {
      console.error(`Failed to regenerate ${imageType}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * NEW METHOD: Generate 3 categorized photos for new moodboard system
   */
  async generateCategorizedPhotos(
    photoConfigs: [PhotoConfiguration, PhotoConfiguration, PhotoConfiguration],
    onboardingData: OnboardingData,
    locationContext?: LocationContext
  ): Promise<CategorizedPhotoResult> {
    const startTime = Date.now()
    
    try {
      console.log('🎨 Starting categorized photo generation for 3 photos')
      
      // Generate intelligent prompts for all photos  
      console.log('🎨 DEBUG: Generating prompts with onboarding data')
      const generatedPrompts = locationContext
        ? generatePromptsWithLocation(photoConfigs, locationContext, onboardingData)
        : generateBatchPromptsWithOnboarding(photoConfigs, onboardingData)
      
      // Create requests for each photo
      const photoRequests: CategorizedPhotoRequest[] = photoConfigs.map((config, index) => ({
        category: config.category,
        photoConfig: config,
        prompt: generatedPrompts[index].prompt,
        locationContext
      }))
      
      let photos: GeneratedImage[] = []
      let fallbacksUsed = 0
      const categoriesGenerated: string[] = []
      
      if (!this.openai) {
        console.log('⚠️ OpenAI not available, using categorized fallback images')
        photos = this.generateCategorizedFallbacks(photoRequests)
        fallbacksUsed = 3
      } else {
        // Generate photos in parallel with individual error handling
        const photoPromises = photoRequests.map((request, index) =>
          this.generateCategorizedPhoto(request, startTime + index * 100)
            .catch(error => {
              console.warn(`Failed to generate photo ${index + 1} (${request.category}):`, error)
              return this.getCategorizedFallback(request, index)
            })
        )
        
        const results = await Promise.allSettled(photoPromises)
        
        // Process results
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          if (result.status === 'fulfilled') {
            photos.push(result.value)
            if (result.value.generation_metadata.model === 'fallback') {
              fallbacksUsed++
            }
            categoriesGenerated.push(photoRequests[i].category)
          } else {
            // Ultimate fallback
            const fallback = this.getCategorizedFallback(photoRequests[i], i)
            photos.push(fallback)
            fallbacksUsed++
            categoriesGenerated.push(photoRequests[i].category)
          }
        }
      }
      
      // Validate we have 3 distinct photos
      if (photos.length !== 3) {
        throw new Error(`Expected 3 photos, got ${photos.length}`)
      }
      
      const generationTime = Date.now() - startTime
      console.log(`✅ Generated ${photos.length} categorized photos in ${generationTime}ms (${fallbacksUsed} fallbacks)`)
      
      return {
        success: true,
        photos,
        generation_time: generationTime,
        categories_generated: categoriesGenerated,
        fallbacks_used: fallbacksUsed
      }
    } catch (error) {
      console.error('❌ Categorized photo generation failed:', error)
      
      const generationTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generation_time: generationTime,
        categories_generated: [],
        fallbacks_used: 0
      }
    }
  }

  /**
   * Generate a single categorized photo with DALL-E
   */
  private async generateCategorizedPhoto(
    request: CategorizedPhotoRequest,
    timeoutSeed: number
  ): Promise<GeneratedImage> {
    if (!this.openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      const imageResponse = await Promise.race([
        this.openai.images.generate({
          model: "dall-e-3",
          prompt: request.prompt,
          size: "1024x1024",
          quality: "standard",
          n: 1,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Individual photo timeout')), 30000)
        )
      ])

      if (!imageResponse.data?.[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }

      return {
        type: request.category,
        url: imageResponse.data[0].url,
        prompt_used: request.prompt,
        generation_metadata: {
          model: 'dall-e-3',
          generated_at: new Date().toISOString(),
          style_focus: request.category,
          category: request.category,
          elements_included: Object.keys(request.photoConfig.elements)
        }
      }
    } catch (error) {
      console.error(`DALL-E generation failed for ${request.category}:`, error)
      throw error
    }
  }

  /**
   * Generate categorized fallback images
   */
  private generateCategorizedFallbacks(requests: CategorizedPhotoRequest[]): GeneratedImage[] {
    const categoryFallbacks: Record<string, string[]> = {
      ceremony: ['/images/home/moodboard/wedding-1.jpg', '/images/home/moodboard/wedding-2.jpg'],
      reception_ballroom: ['/images/home/moodboard/wedding-3.jpg', '/images/home/moodboard/wedding-4.jpg'],
      reception_table: ['/images/home/moodboard/wedding-5.jpg', '/images/home/moodboard/wedding-6.jpg'],
      wedding_cake: ['/images/home/moodboard/wedding-7.jpg', '/images/home/moodboard/wedding-8.jpg'],
      photo_booth: ['/images/home/moodboard/wedding-9.jpg', '/images/home/moodboard/wedding-10.jpg'],
      decorative_details: ['/images/home/moodboard/wedding-11.jpg', '/images/home/moodboard/wedding-12.jpg'],
      couple_entrance: ['/images/home/moodboard/wedding-1.jpg'],
      venue_aerial: ['/images/home/moodboard/wedding-2.jpg'],
      lighting_atmosphere: ['/images/home/moodboard/wedding-3.jpg'],
      traditions_rituals: ['/images/home/moodboard/wedding-4.jpg']
    }

    return requests.map((request, index) => {
      const fallbackImages = categoryFallbacks[request.category] || categoryFallbacks.ceremony
      const selectedImage = fallbackImages[index % fallbackImages.length]

      return {
        type: request.category,
        url: selectedImage,
        prompt_used: request.prompt,
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: request.category,
          category: request.category,
          elements_included: Object.keys(request.photoConfig.elements)
        }
      }
    })
  }

  /**
   * Get a single categorized fallback image
   */
  private getCategorizedFallback(request: CategorizedPhotoRequest, index: number): GeneratedImage {
    const fallbacks = this.generateCategorizedFallbacks([request])
    return fallbacks[0]
  }
}

// Singleton instance
export const imageGenerationService = new ImageGenerationService()

// Type exports
export type { 
  ImageGenerationRequest, 
  CategorizedPhotoRequest,
  GeneratedImage, 
  MultiImageResult,
  CategorizedPhotoResult
}
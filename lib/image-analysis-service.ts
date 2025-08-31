// Image Analysis Service for Element Detection and Swapping
// Detects flowers, tables, linens, and chairs in generated photos to prevent repetition

import OpenAI from 'openai'
import type { GeneratedImage } from './image-generation-service'
import type { PhotoConfiguration } from './moodboard-categories'
import { buildScene } from './moodboard-randomizer'
import type { OnboardingData } from './ai-service'

interface ElementDetection {
  flowers: boolean
  tables: boolean
  linens: boolean
  chairs: boolean
  confidence: number
  description: string
}

interface ConflictAnalysis {
  photoIndex: number
  conflicts: string[]
  severity: 'low' | 'medium' | 'high'
  recommendSwap: boolean
}

interface SwappingResult {
  success: boolean
  swapsPerformed: number
  finalPhotos: GeneratedImage[]
  conflictsResolved: string[]
  error?: string
}

class ImageAnalysisService {
  private openai: OpenAI | null

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured - image analysis will use fallback detection')
      this.openai = null
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    }
  }

  /**
   * Analyze photos for visual element conflicts
   */
  async detectVisualConflicts(
    photos: [GeneratedImage, GeneratedImage, GeneratedImage],
    maxConflictThreshold: number = 2
  ): Promise<ConflictAnalysis[]> {
    const startTime = Date.now()
    console.log('🔍 Analyzing photos for visual element conflicts...')

    try {
      // Analyze each photo for elements
      const elementAnalyses = await Promise.all(
        photos.map((photo, index) => this.analyzePhotoElements(photo, index))
      )

      // Compare photos for conflicts
      const conflicts: ConflictAnalysis[] = []

      // Check for similar elements between photos
      for (let i = 0; i < photos.length; i++) {
        const photoConflicts: string[] = []
        const currentElements = elementAnalyses[i]

        // Compare with other photos
        for (let j = i + 1; j < photos.length; j++) {
          const otherElements = elementAnalyses[j]
          
          // Check each element type for similarity
          if (currentElements.flowers && otherElements.flowers) {
            if (this.areElementsSimilar('flowers', currentElements.description, otherElements.description)) {
              photoConflicts.push(`Similar flowers with photo ${j + 1}`)
            }
          }

          if (currentElements.tables && otherElements.tables) {
            if (this.areElementsSimilar('tables', currentElements.description, otherElements.description)) {
              photoConflicts.push(`Similar tables with photo ${j + 1}`)
            }
          }

          if (currentElements.linens && otherElements.linens) {
            if (this.areElementsSimilar('linens', currentElements.description, otherElements.description)) {
              photoConflicts.push(`Similar linens with photo ${j + 1}`)
            }
          }
        }

        // Determine severity and recommendation
        const severity = photoConflicts.length >= 3 ? 'high' : 
                        photoConflicts.length >= 2 ? 'medium' : 'low'
        const recommendSwap = photoConflicts.length >= maxConflictThreshold

        if (photoConflicts.length > 0) {
          conflicts.push({
            photoIndex: i,
            conflicts: photoConflicts,
            severity,
            recommendSwap
          })
        }
      }

      const analysisTime = Date.now() - startTime
      console.log(`✅ Conflict analysis completed in ${analysisTime}ms - ${conflicts.length} conflicts found`)

      return conflicts
    } catch (error) {
      console.error('❌ Conflict detection failed:', error)
      // Return empty array to continue without swapping
      return []
    }
  }

  /**
   * Regenerate photos with different elements to resolve conflicts
   */
  async regenerateWithDifferentElements(
    conflicts: ConflictAnalysis[],
    originalPhotos: [GeneratedImage, GeneratedImage, GeneratedImage],
    photoConfigs: [PhotoConfiguration, PhotoConfiguration, PhotoConfiguration],
    onboardingData: OnboardingData,
    locationContext?: any
  ): Promise<SwappingResult> {
    const startTime = Date.now()
    console.log(`🔄 Starting element swapping for ${conflicts.length} conflicts...`)

    try {
      const { imageGenerationService } = await import('./image-generation-service')
      let finalPhotos = [...originalPhotos]
      let swapsPerformed = 0
      const conflictsResolved: string[] = []

      // Sort conflicts by severity (high first)
      const sortedConflicts = conflicts
        .filter(c => c.recommendSwap)
        .sort((a, b) => {
          const severityOrder = { high: 3, medium: 2, low: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        })

      // Limit to maximum 2 swaps to prevent infinite loops
      const maxSwaps = Math.min(2, sortedConflicts.length)

      for (let i = 0; i < maxSwaps; i++) {
        const conflict = sortedConflicts[i]
        const photoIndex = conflict.photoIndex

        console.log(`🔄 Swapping photo ${photoIndex + 1} (${conflict.severity} severity)`)

        try {
          // Generate alternative elements for this photo
          const modifiedConfig = this.generateAlternativeElements(
            photoConfigs[photoIndex],
            conflict.conflicts
          )

          // Regenerate the specific photo with different elements
          const newPhotoResult = await imageGenerationService.generateCategorizedPhotos(
            [modifiedConfig] as any,
            onboardingData,
            locationContext
          )

          if (newPhotoResult.success && newPhotoResult.photos && newPhotoResult.photos[0]) {
            finalPhotos[photoIndex] = newPhotoResult.photos[0]
            swapsPerformed++
            conflictsResolved.push(`Photo ${photoIndex + 1}: ${conflict.conflicts.join(', ')}`)
            console.log(`✅ Successfully swapped photo ${photoIndex + 1}`)
          } else {
            console.warn(`⚠️ Failed to regenerate photo ${photoIndex + 1}, keeping original`)
          }
        } catch (swapError) {
          console.warn(`⚠️ Error swapping photo ${photoIndex + 1}:`, swapError)
          // Continue with original photo
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const swappingTime = Date.now() - startTime
      console.log(`🎉 Element swapping completed in ${swappingTime}ms - ${swapsPerformed} swaps performed`)

      return {
        success: true,
        swapsPerformed,
        finalPhotos: finalPhotos as [GeneratedImage, GeneratedImage, GeneratedImage],
        conflictsResolved
      }
    } catch (error) {
      console.error('❌ Element swapping failed:', error)
      return {
        success: false,
        swapsPerformed: 0,
        finalPhotos: originalPhotos,
        conflictsResolved: [],
        error: error instanceof Error ? error.message : 'Unknown swapping error'
      }
    }
  }

  /**
   * Analyze a single photo for wedding elements using OpenAI Vision or fallback detection
   */
  private async analyzePhotoElements(photo: GeneratedImage, index: number): Promise<ElementDetection> {
    try {
      // If OpenAI Vision is available, use it
      if (this.openai && photo.url.startsWith('https://')) {
        return await this.analyzeWithOpenAIVision(photo, index)
      } else {
        // Fallback to prompt-based analysis
        return this.analyzeWithPromptHeuristics(photo, index)
      }
    } catch (error) {
      console.warn(`⚠️ Photo analysis failed for photo ${index + 1}, using fallback:`, error)
      return this.analyzeWithPromptHeuristics(photo, index)
    }
  }

  /**
   * Analyze photo using OpenAI Vision API
   */
  private async analyzeWithOpenAIVision(photo: GeneratedImage, index: number): Promise<ElementDetection> {
    if (!this.openai) {
      throw new Error('OpenAI not configured')
    }

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this wedding photo and identify if it contains: flowers, tables, linens/fabrics, chairs. Respond with JSON: {\"flowers\": boolean, \"tables\": boolean, \"linens\": boolean, \"chairs\": boolean, \"confidence\": 0-1, \"description\": \"brief description of visible elements\"}"
            },
            {
              type: "image_url",
              image_url: { url: photo.url }
            }
          ]
        }
      ],
      max_tokens: 300
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from Vision API')
    }

    return JSON.parse(content)
  }

  /**
   * Fallback analysis using prompt text and metadata
   */
  private analyzeWithPromptHeuristics(photo: GeneratedImage, index: number): ElementDetection {
    const prompt = photo.prompt_used.toLowerCase()
    const category = photo.generation_metadata?.category || photo.type
    const elementsIncluded = photo.generation_metadata?.elements_included || []

    // Analyze based on prompt content and metadata
    const flowers = prompt.includes('flower') || prompt.includes('floral') || 
                   prompt.includes('roses') || prompt.includes('bouquet') ||
                   elementsIncluded.includes('flowers')

    const tables = prompt.includes('table') || prompt.includes('dining') || 
                  prompt.includes('reception') || category === 'reception_table' ||
                  elementsIncluded.includes('tables')

    const linens = prompt.includes('linen') || prompt.includes('fabric') || 
                  prompt.includes('tablecloth') || prompt.includes('runner') ||
                  elementsIncluded.includes('linens')

    const chairs = prompt.includes('chair') || prompt.includes('seating') || 
                  prompt.includes('chiavari') || category === 'ceremony' ||
                  elementsIncluded.includes('chairs')

    // Calculate confidence based on explicit mentions
    const explicitMentions = [flowers, tables, linens, chairs].filter(Boolean).length
    const confidence = Math.min(0.9, 0.4 + (explicitMentions * 0.15))

    return {
      flowers,
      tables, 
      linens,
      chairs,
      confidence,
      description: `${category} photo with ${elementsIncluded.join(', ')}`
    }
  }

  /**
   * Check if two elements of the same type are visually similar
   */
  private areElementsSimilar(elementType: string, desc1: string, desc2: string): boolean {
    const d1 = desc1.toLowerCase()
    const d2 = desc2.toLowerCase()

    // Simple keyword-based similarity detection
    const similarityKeywords = {
      flowers: ['white roses', 'pink roses', 'garden roses', 'peonies', 'hydrangeas'],
      tables: ['round', 'long', 'wood', 'marble', 'glass'],
      linens: ['white', 'ivory', 'lace', 'satin', 'cotton']
    }

    const keywords = similarityKeywords[elementType as keyof typeof similarityKeywords] || []
    
    // Check if both descriptions mention the same specific keywords
    for (const keyword of keywords) {
      if (d1.includes(keyword) && d2.includes(keyword)) {
        return true
      }
    }

    return false
  }

  /**
   * Generate alternative elements for a photo configuration to avoid conflicts
   */
  private generateAlternativeElements(
    originalConfig: PhotoConfiguration,
    conflicts: string[]
  ): PhotoConfiguration {
    const { GLOBAL_ELEMENT_POOLS } = require('./moodboard-categories')
    const { pick } = require('./moodboard-randomizer')
    
    const newElements = { ...originalConfig.elements }
    const newSeed = Date.now()

    // Replace elements that are in conflict
    for (const conflict of conflicts) {
      if (conflict.includes('flowers') && newElements.flowers) {
        // Pick a different flower type
        const availableFlowers = GLOBAL_ELEMENT_POOLS.flowers.filter(
          (f: string) => f !== newElements.flowers
        )
        if (availableFlowers.length > 0) {
          newElements.flowers = pick(availableFlowers, newSeed + 1)
        }
      }

      if (conflict.includes('tables') && newElements.tables) {
        // Pick a different table type
        const availableTables = GLOBAL_ELEMENT_POOLS.tables.filter(
          (t: string) => t !== newElements.tables
        )
        if (availableTables.length > 0) {
          newElements.tables = pick(availableTables, newSeed + 2)
        }
      }

      if (conflict.includes('linens') && newElements.linens) {
        // Pick a different linen type
        const availableLinens = GLOBAL_ELEMENT_POOLS.linens.filter(
          (l: string) => l !== newElements.linens
        )
        if (availableLinens.length > 0) {
          newElements.linens = pick(availableLinens, newSeed + 3)
        }
      }
    }

    return {
      ...originalConfig,
      elements: newElements
    }
  }

  /**
   * Get analysis statistics
   */
  getAnalysisStats(): {
    openai_available: boolean
    fallback_mode: boolean
    supported_formats: string[]
  } {
    return {
      openai_available: !!this.openai,
      fallback_mode: !this.openai,
      supported_formats: this.openai ? ['https urls', 'data urls'] : ['prompt analysis']
    }
  }
}

// Singleton instance
export const imageAnalysisService = new ImageAnalysisService()

// Type exports
export type { ElementDetection, ConflictAnalysis, SwappingResult }
// Intelligent Prompt Generation for Moodboard Categories
// Template system with smart field merging and location context integration

import { PROMPT_TEMPLATES } from './moodboard-config'
import type { PhotoConfiguration } from './moodboard-categories'
import type { LocationContext } from './location-context-service'
import type { OnboardingData } from './ai-service'

export interface PromptGenerationOptions {
  locationContext?: LocationContext
  qualityEnhancements?: boolean
  variationSeed?: number
}

export interface GeneratedPrompt {
  prompt: string
  metadata: {
    category: string
    subType: string
    elementsIncluded: string[]
    locationEnhanced: boolean
    qualityTokens: string[]
  }
}

/**
 * Generate AI prompt for a specific photo configuration
 */
export function generatePrompt(
  photoConfig: PhotoConfiguration,
  options: PromptGenerationOptions = {}
): GeneratedPrompt {
  const { locationContext, qualityEnhancements = true, variationSeed } = options

  // Get base template function
  const templateFn = PROMPT_TEMPLATES[photoConfig.category as keyof typeof PROMPT_TEMPLATES]
  if (!templateFn) {
    throw new Error(`No template found for category: ${photoConfig.category}`)
  }

  // Prepare template data with all configuration
  const templateData = {
    ...photoConfig,
    ...photoConfig.elements,
    ...photoConfig.helpers
  }

  // Generate base prompt
  let prompt = templateFn(templateData)

  // Enhance with location context if available
  if (locationContext) {
    prompt = enhanceWithLocationContext(prompt, photoConfig, locationContext)
  }

  // Add quality enhancements and anti-repetition tokens
  if (qualityEnhancements) {
    prompt = addQualityTokens(prompt, photoConfig, variationSeed)
  }

  // Track metadata
  const elementsIncluded = Object.keys(photoConfig.elements).filter(
    key => !key.endsWith('Subtle') && photoConfig.elements[key as keyof typeof photoConfig.elements]
  )

  const qualityTokens = extractQualityTokens(prompt)

  return {
    prompt: prompt.trim(),
    metadata: {
      category: photoConfig.category,
      subType: photoConfig.subType,
      elementsIncluded,
      locationEnhanced: !!locationContext,
      qualityTokens
    }
  }
}

/**
 * Enhance prompt with location-specific context
 */
function enhanceWithLocationContext(
  basePrompt: string,
  photoConfig: PhotoConfiguration,
  locationContext: LocationContext
): string {
  let enhanced = basePrompt

  // Add architectural style context
  if (photoConfig.category === 'ceremony' || photoConfig.category === 'reception_ballroom') {
    enhanced = enhanced.replace(
      photoConfig.environment,
      `${photoConfig.environment} with ${locationContext.architecture_style} architectural elements`
    )
  }

  // Add cultural elements for appropriate categories
  if (shouldIncludeCulturalContext(photoConfig.category)) {
    const culturalElement = pickCulturalElement(locationContext.cultural_elements)
    if (culturalElement) {
      enhanced += ` Incorporate subtle ${culturalElement} influences in the styling.`
    }
  }

  // Add climate considerations
  if (photoConfig.category === 'venue_aerial' || photoConfig.category === 'ceremony') {
    const climateAdjustment = getClimateAdjustment(locationContext.climate, photoConfig.time)
    if (climateAdjustment) {
      enhanced += ` ${climateAdjustment}`
    }
  }

  return enhanced
}

/**
 * Add quality tokens and variation elements to prevent AI repetition
 */
function addQualityTokens(
  prompt: string,
  photoConfig: PhotoConfiguration,
  variationSeed?: number
): string {
  const antiRepetitionTokens = generateAntiRepetitionTokens(photoConfig.category, variationSeed)
  const compositionGuidance = getCompositionGuidance(photoConfig.category)
  
  let enhanced = prompt

  // Add anti-repetition tokens
  if (antiRepetitionTokens.length > 0) {
    enhanced += ` ${antiRepetitionTokens.join(', ')}.`
  }

  // Add composition guidance
  if (compositionGuidance) {
    enhanced += ` ${compositionGuidance}`
  }

  return enhanced
}

/**
 * Determine if cultural context should be included for this category
 */
function shouldIncludeCulturalContext(category: string): boolean {
  const culturalCategories = [
    'ceremony',
    'traditions_rituals', 
    'reception_ballroom',
    'decorative_details'
  ]
  return culturalCategories.includes(category)
}

/**
 * Pick appropriate cultural element from location context
 */
function pickCulturalElement(culturalElements: string[]): string | null {
  if (!culturalElements || culturalElements.length === 0) return null
  
  // Filter out overly specific elements
  const suitable = culturalElements.filter(element => 
    !element.toLowerCase().includes('language') &&
    !element.toLowerCase().includes('religion') &&
    element.length < 30
  )
  
  return suitable.length > 0 ? suitable[0] : null
}

/**
 * Get climate-specific adjustments for outdoor categories
 */
function getClimateAdjustment(climate: string, time: string): string | null {
  const adjustments: Record<string, Record<string, string>> = {
    tropical: {
      'golden hour': 'Warm, humid golden light filtering through palm fronds.',
      'blue hour': 'Balmy evening air with soft twilight ambiance.',
      'bright daytime': 'Vibrant tropical sunshine with deep shadows.',
      'candlelit night': 'Warm night air with gentle sea breeze.'
    },
    mediterranean: {
      'golden hour': 'Warm Mediterranean sun casting long shadows.',
      'blue hour': 'Gentle evening breeze with olive grove ambiance.',
      'bright daytime': 'Clear, bright Mediterranean sunlight.',
      'candlelit night': 'Mild night air with cypress tree silhouettes.'
    },
    temperate: {
      'golden hour': 'Soft, diffused golden light through deciduous trees.',
      'blue hour': 'Cool evening air with subtle mist.',
      'bright daytime': 'Clear, crisp natural lighting.',
      'candlelit night': 'Cool night air with seasonal foliage.'
    }
  }

  return adjustments[climate]?.[time] || null
}

/**
 * Generate anti-repetition tokens based on category and variation
 */
function generateAntiRepetitionTokens(category: string, variationSeed?: number): string[] {
  const baseTokens: Record<string, string[]> = {
    ceremony: ['unique altar design', 'distinctive seating arrangement', 'personal ceremonial touches'],
    reception_table: ['creative centerpiece styling', 'unique table configuration', 'innovative place setting design'],
    wedding_cake: ['artistic cake styling', 'creative dessert presentation', 'unique cake stand design'],
    reception_ballroom: ['distinctive room layout', 'unique lighting design', 'creative space utilization'],
    photo_booth: ['innovative backdrop design', 'creative prop arrangement', 'unique lighting setup']
  }

  const variationTokens: Record<string, string[]> = {
    ceremony: ['asymmetric elements', 'mixed textures', 'layered compositions'],
    reception_table: ['varying heights', 'textural contrasts', 'organic arrangements'],
    wedding_cake: ['geometric elements', 'natural textures', 'artistic draping'],
    reception_ballroom: ['dramatic angles', 'layered lighting', 'architectural details'],
    photo_booth: ['dynamic angles', 'mixed materials', 'creative framing']
  }

  const tokens = baseTokens[category] || ['unique styling', 'creative composition']
  
  // Add variation if seed provided
  if (variationSeed !== undefined && variationTokens[category]) {
    const variation = variationTokens[category][variationSeed % variationTokens[category].length]
    tokens.push(variation)
  }

  return tokens.slice(0, 2) // Limit to 2 tokens to avoid prompt bloat
}

/**
 * Get composition guidance for specific categories
 */
function getCompositionGuidance(category: string): string | null {
  const guidance: Record<string, string> = {
    ceremony: 'Frame to show both intimacy and grandeur of the ceremony space.',
    reception_table: 'Focus on tablescape details with shallow depth of field.',
    wedding_cake: 'Emphasize cake as hero element with elegant negative space.',
    reception_ballroom: 'Capture room atmosphere with balanced lighting and composition.',
    venue_aerial: 'Show venue layout relationship to natural surroundings.',
    decorative_details: 'Use macro photography techniques for intimate detail shots.',
    photo_booth: 'Create inviting, Instagram-worthy backdrop composition.',
    couple_entrance: 'Frame pathway to create anticipation and romantic journey feel.',
    lighting_atmosphere: 'Emphasize mood and ambiance over specific details.',
    traditions_rituals: 'Capture emotional significance of the moment.'
  }

  return guidance[category] || null
}

/**
 * Extract quality tokens from generated prompt for metadata
 */
function extractQualityTokens(prompt: string): string[] {
  const tokens = []
  
  if (prompt.includes('Editorial wedding photography')) tokens.push('editorial')
  if (prompt.includes('cinematic lighting')) tokens.push('cinematic')
  if (prompt.includes('ultra high resolution')) tokens.push('high-res')
  if (prompt.includes('no people')) tokens.push('no-people')
  if (prompt.includes('macro photography')) tokens.push('macro')
  if (prompt.includes('shallow depth of field')) tokens.push('shallow-dof')
  
  return tokens
}

/**
 * Batch generate prompts for multiple photo configurations
 */
export function generateBatchPrompts(
  photoConfigs: PhotoConfiguration[],
  options: PromptGenerationOptions = {}
): GeneratedPrompt[] {
  return photoConfigs.map((config, index) => 
    generatePrompt(config, {
      ...options,
      variationSeed: options.variationSeed ? options.variationSeed + index : undefined
    })
  )
}

/**
 * Generate prompts with location context integration
 */
export function generatePromptsWithLocation(
  photoConfigs: PhotoConfiguration[],
  locationContext: LocationContext,
  onboardingData: OnboardingData
): GeneratedPrompt[] {
  return generateBatchPrompts(photoConfigs, {
    locationContext,
    qualityEnhancements: true,
    variationSeed: generateVariationSeed(onboardingData)
  })
}

/**
 * Generate variation seed from onboarding data
 */
function generateVariationSeed(onboardingData: OnboardingData): number {
  let seed = 0
  
  if (onboardingData.step_5?.color_palette) {
    seed += onboardingData.step_5.color_palette.length
  }
  
  if (onboardingData.step_4?.guest_count) {
    seed += onboardingData.step_4.guest_count
  }
  
  return seed
}
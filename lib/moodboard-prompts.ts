// Intelligent Prompt Generation for Moodboard Categories
// Template system with smart field merging and location context integration

import { PROMPT_TEMPLATES, extractColorsFromPalette } from './moodboard-config'
import type { PhotoConfiguration } from './moodboard-categories'
import type { LocationContext } from './location-context-service'
import type { OnboardingData } from './ai-service'
import type { OnboardingTemplateData } from './types/onboarding-template'

export interface PromptGenerationOptions {
  locationContext?: LocationContext
  qualityEnhancements?: boolean
  variationSeed?: number
  colorPalette?: string
  themes?: string[]
  onboardingData?: OnboardingData
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
 * Prepare OnboardingTemplateData from PhotoConfiguration and options
 */
function prepareOnboardingTemplateData(
  photoConfig: PhotoConfiguration,
  options: PromptGenerationOptions
): OnboardingTemplateData {
  const { onboardingData, colorPalette, themes } = options
  
  // Extract ceremony details from onboarding data
  const ceremonyType = (onboardingData as any)?.step_5?.ceremonyType || 'outdoor'
  const religiousType = (onboardingData as any)?.step_5?.religiousType
  
  // Extract colors from palette string
  const colors = colorPalette ? extractColorsFromPalette(colorPalette) : []
  
  // Extract location from onboarding data
  const location = (onboardingData as any)?.step_3?.venue || 
                  (onboardingData as any)?.location || 
                  photoConfig.environment
  
  return {
    ceremonyType: ceremonyType as 'religious' | 'civil' | 'outdoor',
    religiousType: religiousType as 'Hindu' | 'Christian' | 'Jewish' | 'Muslim' | undefined,
    colorPalette: colorPalette || '',
    colors,
    themes: themes || [],
    style: photoConfig.style || '',
    location: location || '',
    environment: photoConfig.environment || 'outdoor',
    venue: photoConfig.venue
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

  // Prepare OnboardingTemplateData for dynamic templates
  const onboardingTemplateData: OnboardingTemplateData = prepareOnboardingTemplateData(
    photoConfig, 
    options
  )

  // Generate base prompt with dynamic template
  let prompt = templateFn(onboardingTemplateData)

  // Enhance with location context if available
  if (locationContext) {
    prompt = enhanceWithLocationContext(prompt, photoConfig, locationContext)
  }

  // Enhance with color palette if available
  if (options.colorPalette) {
    prompt = enhanceWithColorPalette(prompt, photoConfig, options.colorPalette)
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
 * Enhance prompt with color palette context
 */
function enhanceWithColorPalette(
  basePrompt: string,
  photoConfig: PhotoConfiguration,
  colorPalette: string
): string {
  console.log(`🎨 Adding color palette "${colorPalette}" to ${photoConfig.category} prompt`)
  
  // Map color palette names to descriptive colors
  const colorMappings: Record<string, string[]> = {
    'Sage & Cream': ['soft sage green', 'warm cream', 'muted earthy tones'],
    'Blush & Gold': ['dusty rose', 'champagne gold', 'warm blush tones'],
    'Navy & White': ['deep navy blue', 'crisp white', 'classic nautical colors'],
    'Navy & Rose': ['deep navy blue', 'dusty rose', 'elegant contrasting tones'],
    'Burgundy & Ivory': ['rich burgundy', 'soft ivory', 'elegant wine tones'],
    'Dusty Blue & Mauve': ['dusty blue', 'gentle mauve', 'soft romantic hues'],
    'Forest Green & Gold': ['deep forest green', 'antique gold', 'rich natural tones'],
    'Terracotta & Sage': ['warm terracotta', 'muted sage', 'earthy desert tones'],
    'Lavender & Silver': ['soft lavender', 'charcoal gray', 'serene pastel tones']
  }
  
  const colors = colorMappings[colorPalette] || [colorPalette.toLowerCase()]
  // Use random color from palette instead of all colors
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const colorDescription = randomColor
  
  console.log(`🎨 DEBUG: Available colors for ${colorPalette}:`, colors)
  console.log(`🎨 DEBUG: Selected random color: "${randomColor}"`)
  
  // Add color context to the prompt based on category
  const categoryColorIntegration: Record<string, string> = {
    'ceremony': `featuring ${colorDescription} ceremony decor`,
    'reception_ballroom': `with ${colorDescription} styling throughout`,
    'reception_table': `incorporating ${colorDescription} in table settings and linens`,
    'wedding_cake': `with ${colorDescription} decorative accents`,
    'decorative_details': `showcasing ${colorDescription} color scheme`,
    'couple_entrance': `decorated with ${colorDescription} aisle styling`,
    'photo_booth': `styled with ${colorDescription} design elements`
  }
  
  const colorIntegration = categoryColorIntegration[photoConfig.category] || `with ${colorDescription} accents`
  
  // Insert color context naturally into the prompt - updated for simplified templates
  const enhanced = basePrompt.replace(
    /captured in/,
    `${colorIntegration}, captured in`
  ).replace(
    /shot in/,
    `${colorIntegration}, shot in`
  ).replace(
    /photographed in/,
    `${colorIntegration}, photographed in`
  )
  
  const finalPrompt = enhanced !== basePrompt ? enhanced : `${basePrompt.slice(0, -1)}, ${colorIntegration}.`
  console.log(`🎨 DEBUG: Final enhanced prompt: "${finalPrompt}"`)
  return finalPrompt
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
 * Generate prompts with onboarding data integration (colors, themes)
 */
export function generateBatchPromptsWithOnboarding(
  photoConfigs: PhotoConfiguration[],
  onboardingData: OnboardingData
): GeneratedPrompt[] {
  // Extract color palette and themes from onboarding data - matching simulation structure
  const colorPalette = (onboardingData as any).step_4?.colorPalette || (onboardingData as any).step_4?.selectedColorPalette || (onboardingData as any).step_5?.color_palette
  const themes = (onboardingData as any).step_4?.themes || (onboardingData as any).step_5?.themes
  
  console.log('🎨 DEBUG: Using onboarding colors and themes:', { colorPalette, themes })
  
  return generateBatchPrompts(photoConfigs, {
    qualityEnhancements: true,
    variationSeed: generateVariationSeed(onboardingData),
    colorPalette,
    themes,
    onboardingData
  })
}

/**
 * Generate prompts with location context integration
 */
export function generatePromptsWithLocation(
  photoConfigs: PhotoConfiguration[],
  locationContext: LocationContext,
  onboardingData: OnboardingData
): GeneratedPrompt[] {
  // Extract color palette and themes from onboarding data - same as generateBatchPromptsWithOnboarding
  const colorPalette = (onboardingData as any).step_4?.colorPalette || (onboardingData as any).step_4?.selectedColorPalette || (onboardingData as any).step_5?.color_palette
  const themes = (onboardingData as any).step_4?.themes || (onboardingData as any).step_5?.themes
  
  console.log('🎨 DEBUG: generatePromptsWithLocation using colors and themes:', { colorPalette, themes })
  
  return generateBatchPrompts(photoConfigs, {
    locationContext,
    qualityEnhancements: true,
    variationSeed: generateVariationSeed(onboardingData),
    colorPalette,
    themes,
    onboardingData
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
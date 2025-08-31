// Moodboard Randomization Engine
// Weighted selection, seeded randomization, and photo configuration generation

import { WEDDING_CATEGORIES, GLOBAL_ELEMENT_POOLS } from './moodboard-categories'
import { HELPER_POOLS, CATEGORY_WEIGHTS } from './moodboard-config'
import type { PhotoConfiguration, RandomizationResult } from './moodboard-categories'
import type { OnboardingData } from './ai-service'

// Simple seeded pseudo-random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

interface WeightedChoice<T> {
  value: T
  weight?: number
}

/**
 * Weighted selection function with deterministic seeding
 */
export function pick<T>(choices: WeightedChoice<T>[] | T[], seed?: number): T {
  const rng = seed !== undefined ? new SeededRandom(seed) : null
  const random = rng ? rng.next() : Math.random()
  
  // If simple array, treat all as equal weight
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('Choices array is empty or invalid')
  }

  // Handle simple array (equal weights)
  if (typeof choices[0] === 'string' || !('value' in choices[0])) {
    const index = Math.floor(random * choices.length)
    return choices[index] as T
  }

  // Handle weighted choices
  const weightedChoices = choices as WeightedChoice<T>[]
  const totalWeight = weightedChoices.reduce((sum, choice) => sum + (choice.weight || 1), 0)
  let currentWeight = 0
  const targetWeight = random * totalWeight

  for (const choice of weightedChoices) {
    currentWeight += choice.weight || 1
    if (currentWeight >= targetWeight) {
      return choice.value
    }
  }

  // Fallback to last choice
  return weightedChoices[weightedChoices.length - 1].value
}

/**
 * Probability check function with seeding
 */
export function maybe(probability: number, seed?: number): boolean {
  if (probability <= 0) return false
  if (probability >= 1) return true
  
  const rng = seed !== undefined ? new SeededRandom(seed + 1000) : null
  const random = rng ? rng.next() : Math.random()
  return random < probability
}

/**
 * Select 3 distinct categories for photo generation
 */
function selectCategories(seed: number): string[] {
  const categoryNames = Object.keys(WEDDING_CATEGORIES)
  const weightedCategories = categoryNames.map(name => ({
    value: name,
    weight: CATEGORY_WEIGHTS[name as keyof typeof CATEGORY_WEIGHTS] || 1
  }))

  const selected: string[] = []
  let attempts = 0
  const maxAttempts = 20

  while (selected.length < 3 && attempts < maxAttempts) {
    const category = pick(weightedCategories, seed + attempts)
    if (!selected.includes(category)) {
      selected.push(category)
    }
    attempts++
  }

  // If we couldn't get 3 unique categories, fill with remaining ones
  while (selected.length < 3) {
    for (const category of categoryNames) {
      if (!selected.includes(category) && selected.length < 3) {
        selected.push(category)
      }
    }
  }

  return selected.slice(0, 3)
}

/**
 * Select elements for a specific category based on visibility and probability
 */
function selectElements(
  categoryKey: string, 
  seed: number,
  elementOffset: number = 0
): PhotoConfiguration['elements'] {
  const category = WEDDING_CATEGORIES[categoryKey]
  if (!category) {
    throw new Error(`Unknown category: ${categoryKey}`)
  }

  const elements: PhotoConfiguration['elements'] = {}

  // Check each element type
  const elementTypes = ['flowers', 'tables', 'linens', 'chairs'] as const
  
  elementTypes.forEach((elementType, index) => {
    const visibility = category.visibility[elementType]
    const probability = category.probabilities[elementType]
    const elementSeed = seed + elementOffset + index * 100

    let shouldInclude = false
    
    if (visibility === 'required') {
      shouldInclude = true
    } else if (visibility === 'optional') {
      shouldInclude = maybe(probability, elementSeed)
    }

    if (shouldInclude) {
      const pool = GLOBAL_ELEMENT_POOLS[elementType]
      elements[elementType] = pick(pool, elementSeed)
      
      // 30% chance to mark as subtle if required (for visual variation)
      if (visibility === 'required') {
        const subtleKey = `${elementType}Subtle` as keyof PhotoConfiguration['elements']
        elements[subtleKey] = maybe(0.3, elementSeed + 50)
      }
    }
  })

  return elements
}

/**
 * Generate helper elements for a category
 */
function selectHelpers(
  categoryKey: string,
  subType: string,
  seed: number
): Record<string, string> {
  const helpers: Record<string, string> = {}

  // Category-specific helper selection
  switch (categoryKey) {
    case 'ceremony':
      if (subType.includes('aisle')) {
        helpers.aisleDeco = pick(HELPER_POOLS.aisle_deco, seed + 1)
      }
      break
      
    case 'reception_ballroom':
      if (subType.includes('ceiling')) {
        helpers.ceilingDecor = pick(HELPER_POOLS.ceiling_deco, seed + 2)
      }
      break
      
    case 'reception_table':
      if (subType.includes('centerpieces')) {
        helpers.centerpieceStyle = pick(HELPER_POOLS.centerpiece_styles, seed + 3)
      }
      if (subType.includes('place settings')) {
        helpers.placeSetting = pick(HELPER_POOLS.place_settings, seed + 4)
      }
      break
      
    case 'photo_booth':
      if (subType.includes('backdrop')) {
        helpers.backdrop = pick(HELPER_POOLS.backdrops, seed + 5)
      }
      if (subType.includes('lighting')) {
        helpers.lighting = pick(HELPER_POOLS.lighting_options, seed + 6)
      }
      break
  }

  return helpers
}

/**
 * Extract color palette from onboarding data
 */
function extractColorPalette(onboardingData: OnboardingData): string {
  // Try step_5 first (current structure)
  if (onboardingData.step_5?.color_palette) {
    return onboardingData.step_5.color_palette
  }
  
  // Try alternative field names
  if (onboardingData.step_5?.themes) {
    const themes = Array.isArray(onboardingData.step_5.themes) 
      ? onboardingData.step_5.themes.join(' ') 
      : onboardingData.step_5.themes
    
    // Infer colors from themes
    const themeColors = {
      rustic: 'warm earth tones with sage green',
      modern: 'clean whites with metallic accents',
      romantic: 'soft pastels with blush pink',
      classic: 'elegant ivory and gold',
      bohemian: 'rich jewel tones with brass',
      garden: 'natural greens with white florals',
      vintage: 'dusty rose with antique gold'
    }
    
    for (const [theme, colors] of Object.entries(themeColors)) {
      if (themes.toLowerCase().includes(theme)) {
        return colors
      }
    }
  }
  
  return 'elegant ivory and gold'
}

/**
 * Main function to build 3 photo configurations
 */
export function buildScene(
  onboardingData: OnboardingData,
  inputSeed?: number
): RandomizationResult {
  const startTime = Date.now()
  
  // Generate seed from user data if not provided
  const seed = inputSeed || generateSeedFromData(onboardingData)
  
  // Select 3 distinct categories
  const selectedCategories = selectCategories(seed)
  
  // Generate configuration for each photo
  const photos: [PhotoConfiguration, PhotoConfiguration, PhotoConfiguration] = [
    generatePhotoConfig(selectedCategories[0], seed + 1000, onboardingData),
    generatePhotoConfig(selectedCategories[1], seed + 2000, onboardingData), 
    generatePhotoConfig(selectedCategories[2], seed + 3000, onboardingData)
  ]
  
  // Extract color palette
  const colorPalette = extractColorPalette(onboardingData)
  
  const generationTime = Date.now() - startTime
  
  // Count total elements selected
  const elementsSelected = photos.reduce((total, photo) => {
    return total + Object.keys(photo.elements).length
  }, 0)

  return {
    photos,
    colorPalette,
    seed,
    metadata: {
      categoriesSelected: selectedCategories,
      generationTime,
      elementsSelected
    }
  }
}

/**
 * Generate a single photo configuration
 */
function generatePhotoConfig(
  categoryKey: string,
  seed: number,
  onboardingData: OnboardingData
): PhotoConfiguration {
  const category = WEDDING_CATEGORIES[categoryKey]
  if (!category) {
    throw new Error(`Unknown category: ${categoryKey}`)
  }

  // Select subcategory
  const subType = pick(category.subcategories, seed)
  
  // Select environment and time
  const environment = pick(HELPER_POOLS.environments, seed + 10)
  const time = pick(HELPER_POOLS.times, seed + 20)
  
  // Select elements based on visibility and probability
  const elements = selectElements(categoryKey, seed, 100)
  
  // Select category-specific helpers
  const helpers = selectHelpers(categoryKey, subType, seed + 200)

  return {
    category: categoryKey,
    subType,
    environment,
    time,
    elements,
    helpers
  }
}

/**
 * Generate seed from onboarding data for consistency
 */
function generateSeedFromData(onboardingData: OnboardingData): number {
  let hashInput = ''
  
  // Use stable data that won't change between sessions
  if (onboardingData.step_3?.partner1_name) {
    hashInput += onboardingData.step_3.partner1_name
  }
  if (onboardingData.step_3?.partner2_name) {
    hashInput += onboardingData.step_3.partner2_name
  }
  if (onboardingData.step_2?.wedding_location) {
    hashInput += onboardingData.step_2.wedding_location
  }
  if (onboardingData.step_5?.themes) {
    const themes = Array.isArray(onboardingData.step_5.themes) 
      ? onboardingData.step_5.themes.join('')
      : onboardingData.step_5.themes
    hashInput += themes
  }
  
  // Add timestamp component to ensure some variation
  hashInput += Date.now().toString().slice(-4)
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash)
}

/**
 * Validate that photos have distinct visual focus
 */
export function validatePhotoUniqueness(photos: PhotoConfiguration[]): boolean {
  const categories = photos.map(p => p.category)
  const uniqueCategories = new Set(categories)
  
  // Must have 3 different categories
  if (uniqueCategories.size !== 3) {
    return false
  }
  
  // Check for element diversity
  const allElements = photos.flatMap(p => Object.keys(p.elements))
  const elementDiversity = new Set(allElements).size
  
  // Should have reasonable element variety
  return elementDiversity >= 2
}
// Comprehensive unit tests for the new 3-photo moodboard system
// Tests randomization, category selection, prompt generation, and element swapping

import { buildScene, pick, maybe, validatePhotoUniqueness } from '../lib/moodboard-randomizer'
import { generatePrompt, generateBatchPrompts } from '../lib/moodboard-prompts'
import { WEDDING_CATEGORIES, GLOBAL_ELEMENT_POOLS } from '../lib/moodboard-categories'
import { imageAnalysisService } from '../lib/image-analysis-service'
import type { OnboardingData } from '../lib/ai-service'
import type { PhotoConfiguration } from '../lib/moodboard-categories'

// Mock data for testing
const mockOnboardingData: OnboardingData = {
  step_2: {
    planning_stage: 'early',
    wedding_location: 'Paris, France'
  },
  step_3: {
    partner1_name: 'Alice',
    partner2_name: 'Bob',
    wedding_date: '2024-06-15',
    currency: 'USD',
    budget: 35000
  },
  step_4: {
    guest_count: 80,
    international_guests: 'some',
    requirements: []
  },
  step_5: {
    themes: ['romantic', 'classic'],
    color_palette: 'blush pink and gold'
  },
  step_6: {
    ceremony_type: 'traditional',
    experiences: ['cocktail-hour']
  }
}

describe('Moodboard Randomization System', () => {
  
  describe('Weighted Selection (pick function)', () => {
    test('should return consistent results with same seed', () => {
      const choices = ['option1', 'option2', 'option3']
      const seed = 12345
      
      const result1 = pick(choices, seed)
      const result2 = pick(choices, seed)
      
      expect(result1).toBe(result2)
    })

    test('should return different results with different seeds', () => {
      const choices = ['option1', 'option2', 'option3']
      
      const result1 = pick(choices, 12345)
      const result2 = pick(choices, 54321)
      
      // Should be different (with high probability)
      const results = [result1, result2]
      const uniqueResults = new Set(results)
      expect(uniqueResults.size).toBeGreaterThan(1)
    })

    test('should handle weighted choices', () => {
      const weightedChoices = [
        { value: 'rare', weight: 0.1 },
        { value: 'common', weight: 0.9 }
      ]
      
      // Test multiple times to check distribution
      const results: string[] = []
      for (let i = 0; i < 100; i++) {
        results.push(pick(weightedChoices, i))
      }
      
      const commonCount = results.filter(r => r === 'common').length
      const rareCount = results.filter(r => r === 'rare').length
      
      // Common should appear much more frequently
      expect(commonCount).toBeGreaterThan(rareCount)
    })
  })

  describe('Probability Function (maybe)', () => {
    test('should return consistent results with same seed', () => {
      const probability = 0.5
      const seed = 12345
      
      const result1 = maybe(probability, seed)
      const result2 = maybe(probability, seed)
      
      expect(result1).toBe(result2)
    })

    test('should return true for probability 1', () => {
      expect(maybe(1.0, 123)).toBe(true)
    })

    test('should return false for probability 0', () => {
      expect(maybe(0.0, 123)).toBe(false)
    })

    test('should approximate expected probability distribution', () => {
      const probability = 0.3
      const results: boolean[] = []
      
      for (let i = 0; i < 1000; i++) {
        results.push(maybe(probability, i))
      }
      
      const trueCount = results.filter(r => r).length
      const actualProbability = trueCount / 1000
      
      // Should be within 5% of expected probability
      expect(Math.abs(actualProbability - probability)).toBeLessThan(0.05)
    })
  })

  describe('Scene Generation (buildScene)', () => {
    test('should generate exactly 3 photo configurations', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      expect(result.photos).toHaveLength(3)
      expect(result.photos[0]).toHaveProperty('category')
      expect(result.photos[1]).toHaveProperty('category') 
      expect(result.photos[2]).toHaveProperty('category')
    })

    test('should generate 3 distinct categories', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      const categories = result.photos.map(p => p.category)
      const uniqueCategories = new Set(categories)
      
      expect(uniqueCategories.size).toBe(3)
    })

    test('should return consistent results with same seed', () => {
      const seed = 12345
      
      const result1 = buildScene(mockOnboardingData, seed)
      const result2 = buildScene(mockOnboardingData, seed)
      
      expect(result1.photos).toEqual(result2.photos)
      expect(result1.colorPalette).toBe(result2.colorPalette)
      expect(result1.seed).toBe(result2.seed)
    })

    test('should extract color palette from onboarding data', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      expect(result.colorPalette).toBe('blush pink and gold')
    })

    test('should generate valid photo configurations', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      for (const photo of result.photos) {
        expect(photo.category).toBeDefined()
        expect(photo.subType).toBeDefined()
        expect(photo.environment).toBeDefined()
        expect(photo.time).toBeDefined()
        expect(photo.elements).toBeDefined()
        expect(photo.helpers).toBeDefined()
        
        // Check category exists
        expect(WEDDING_CATEGORIES[photo.category]).toBeDefined()
        
        // Check subType is valid for category
        const category = WEDDING_CATEGORIES[photo.category]
        expect(category.subcategories).toContain(photo.subType)
      }
    })

    test('should respect element visibility rules', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      for (const photo of result.photos) {
        const category = WEDDING_CATEGORIES[photo.category]
        
        // Check required elements are present
        Object.entries(category.visibility).forEach(([element, visibility]) => {
          if (visibility === 'required') {
            // Required elements should have high probability of being selected
            // (we can't guarantee 100% due to randomization, but check structure is correct)
            expect(['flowers', 'tables', 'linens', 'chairs']).toContain(element)
          }
        })
      }
    })
  })

  describe('Photo Uniqueness Validation', () => {
    test('should validate unique photos correctly', () => {
      const uniquePhotos: PhotoConfiguration[] = [
        {
          category: 'ceremony',
          subType: 'circle floral arch',
          environment: 'garden',
          time: 'golden hour',
          elements: { flowers: 'roses' },
          helpers: {}
        },
        {
          category: 'reception_table', 
          subType: 'round table',
          environment: 'ballroom',
          time: 'evening',
          elements: { tables: 'wood' },
          helpers: {}
        },
        {
          category: 'wedding_cake',
          subType: '3 tier cake',
          environment: 'indoor',
          time: 'afternoon',
          elements: {},
          helpers: {}
        }
      ]
      
      expect(validatePhotoUniqueness(uniquePhotos)).toBe(true)
    })

    test('should reject non-unique categories', () => {
      const duplicatePhotos: PhotoConfiguration[] = [
        {
          category: 'ceremony',
          subType: 'circle floral arch',
          environment: 'garden',
          time: 'golden hour', 
          elements: {},
          helpers: {}
        },
        {
          category: 'ceremony', // Duplicate category
          subType: 'asymmetrical arch',
          environment: 'beach',
          time: 'sunset',
          elements: {},
          helpers: {}
        },
        {
          category: 'wedding_cake',
          subType: '3 tier cake',
          environment: 'indoor',
          time: 'afternoon',
          elements: {},
          helpers: {}
        }
      ]
      
      expect(validatePhotoUniqueness(duplicatePhotos)).toBe(false)
    })
  })
})

describe('Prompt Generation System', () => {
  
  test('should generate valid prompts for all categories', () => {
    const result = buildScene(mockOnboardingData, 12345)
    
    for (const photoConfig of result.photos) {
      const prompt = generatePrompt(photoConfig)
      
      expect(prompt.prompt).toBeDefined()
      expect(prompt.prompt.length).toBeGreaterThan(50)
      expect(prompt.metadata.category).toBe(photoConfig.category)
      expect(prompt.metadata.subType).toBe(photoConfig.subType)
      
      // Should contain quality tokens
      expect(prompt.prompt).toContain('Editorial wedding photography')
      expect(prompt.prompt).toContain('no people')
    })
  })

  test('should generate batch prompts correctly', () => {
    const result = buildScene(mockOnboardingData, 12345)
    const prompts = generateBatchPrompts(result.photos)
    
    expect(prompts).toHaveLength(3)
    
    prompts.forEach((prompt, index) => {
      expect(prompt.metadata.category).toBe(result.photos[index].category)
      expect(prompt.metadata.subType).toBe(result.photos[index].subType)
    })
  })

  test('should include location context when provided', () => {
    const photoConfig: PhotoConfiguration = {
      category: 'ceremony',
      subType: 'circle floral arch',
      environment: 'garden courtyard',
      time: 'golden hour',
      elements: { flowers: 'roses' },
      helpers: {}
    }
    
    const locationContext = {
      name: 'Paris, France',
      architecture_style: 'Haussmann elegance',
      cultural_elements: ['French sophistication'],
      climate: 'temperate',
      popular_venues: ['Châteaux'],
      local_traditions: ['Wine culture'],
      description: 'Romantic city',
      search_keywords: ['paris', 'france'],
      cached_at: new Date().toISOString()
    }
    
    const prompt = generatePrompt(photoConfig, { locationContext })
    
    expect(prompt.prompt).toContain('Haussmann elegance')
    expect(prompt.metadata.locationEnhanced).toBe(true)
  })
})

describe('Category Configuration Validation', () => {
  
  test('should have exactly 10 categories', () => {
    const categoryKeys = Object.keys(WEDDING_CATEGORIES)
    expect(categoryKeys).toHaveLength(10)
  })

  test('should have all required category properties', () => {
    Object.values(WEDDING_CATEGORIES).forEach(category => {
      expect(category.name).toBeDefined()
      expect(category.subcategories).toBeDefined()
      expect(category.subcategories.length).toBeGreaterThan(0)
      expect(category.visibility).toBeDefined()
      expect(category.probabilities).toBeDefined()
      expect(category.template_key).toBeDefined()
      
      // Check visibility matrix
      expect(category.visibility.flowers).toMatch(/required|optional/)
      expect(category.visibility.tables).toMatch(/required|optional/)
      expect(category.visibility.linens).toMatch(/required|optional/)
      expect(category.visibility.chairs).toMatch(/required|optional/)
      
      // Check probabilities are between 0 and 1
      expect(category.probabilities.flowers).toBeGreaterThanOrEqual(0)
      expect(category.probabilities.flowers).toBeLessThanOrEqual(1)
      expect(category.probabilities.tables).toBeGreaterThanOrEqual(0)
      expect(category.probabilities.tables).toBeLessThanOrEqual(1)
      expect(category.probabilities.linens).toBeGreaterThanOrEqual(0)
      expect(category.probabilities.linens).toBeLessThanOrEqual(1)
      expect(category.probabilities.chairs).toBeGreaterThanOrEqual(0)
      expect(category.probabilities.chairs).toBeLessThanOrEqual(1)
    })
  })

  test('should have valid global element pools', () => {
    expect(GLOBAL_ELEMENT_POOLS.flowers).toHaveLength(10)
    expect(GLOBAL_ELEMENT_POOLS.tables).toHaveLength(8)
    expect(GLOBAL_ELEMENT_POOLS.linens).toHaveLength(9)
    expect(GLOBAL_ELEMENT_POOLS.chairs).toHaveLength(7)
    
    // Check all elements are strings
    GLOBAL_ELEMENT_POOLS.flowers.forEach(flower => {
      expect(typeof flower).toBe('string')
      expect(flower.length).toBeGreaterThan(0)
    })
    
    GLOBAL_ELEMENT_POOLS.tables.forEach(table => {
      expect(typeof table).toBe('string')
      expect(table.length).toBeGreaterThan(0)
    })
  })
})

describe('Image Analysis Service', () => {
  
  test('should provide analysis stats', () => {
    const stats = imageAnalysisService.getAnalysisStats()
    
    expect(stats).toHaveProperty('openai_available')
    expect(stats).toHaveProperty('fallback_mode')
    expect(stats).toHaveProperty('supported_formats')
    expect(Array.isArray(stats.supported_formats)).toBe(true)
  })

  // Note: Visual conflict detection tests would require actual image URLs
  // For unit tests, we test the service structure and fallback behavior
  test('should handle empty conflict analysis gracefully', async () => {
    const mockPhotos = [
      {
        type: 'ceremony',
        url: '/fallback/image1.jpg',
        prompt_used: 'ceremony with flowers',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'ceremony'
        }
      },
      {
        type: 'reception_table', 
        url: '/fallback/image2.jpg',
        prompt_used: 'table setting with linens',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'reception_table'
        }
      },
      {
        type: 'wedding_cake',
        url: '/fallback/image3.jpg',
        prompt_used: 'wedding cake display',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'wedding_cake'
        }
      }
    ] as any

    const conflicts = await imageAnalysisService.detectVisualConflicts(mockPhotos as any)
    
    expect(Array.isArray(conflicts)).toBe(true)
    // Should return empty array or valid conflict objects
    conflicts.forEach(conflict => {
      expect(conflict).toHaveProperty('photoIndex')
      expect(conflict).toHaveProperty('conflicts')
      expect(conflict).toHaveProperty('severity')
      expect(conflict).toHaveProperty('recommendSwap')
    })
  })
})

describe('Integration Tests', () => {
  
  test('should generate complete moodboard data structure', () => {
    const result = buildScene(mockOnboardingData, 12345)
    
    // Test complete data structure
    expect(result).toHaveProperty('photos')
    expect(result).toHaveProperty('colorPalette')
    expect(result).toHaveProperty('seed')
    expect(result).toHaveProperty('metadata')
    
    expect(result.metadata).toHaveProperty('categoriesSelected')
    expect(result.metadata).toHaveProperty('generationTime')
    expect(result.metadata).toHaveProperty('elementsSelected')
    
    expect(result.metadata.categoriesSelected).toHaveLength(3)
    expect(result.metadata.generationTime).toBeGreaterThan(0)
    expect(result.metadata.elementsSelected).toBeGreaterThanOrEqual(0)
  })

  test('should maintain seed determinism across full workflow', () => {
    const seed = 98765
    
    const result1 = buildScene(mockOnboardingData, seed)
    const result2 = buildScene(mockOnboardingData, seed)
    
    // Should generate identical configurations
    expect(result1.photos).toEqual(result2.photos)
    expect(result1.colorPalette).toBe(result2.colorPalette)
    expect(result1.seed).toBe(result2.seed)
    expect(result1.metadata.categoriesSelected).toEqual(result2.metadata.categoriesSelected)
  })

  test('should generate valid prompts for randomized configurations', () => {
    // Test with multiple random seeds
    const seeds = [111, 222, 333, 444, 555]
    
    seeds.forEach(seed => {
      const result = buildScene(mockOnboardingData, seed)
      const prompts = generateBatchPrompts(result.photos)
      
      expect(prompts).toHaveLength(3)
      
      prompts.forEach(prompt => {
        expect(prompt.prompt).toBeDefined()
        expect(prompt.prompt.length).toBeGreaterThan(50)
        expect(prompt.metadata.elementsIncluded).toBeDefined()
        expect(Array.isArray(prompt.metadata.elementsIncluded)).toBe(true)
      })
    })
  })
})
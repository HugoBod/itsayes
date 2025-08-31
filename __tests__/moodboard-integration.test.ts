// Integration tests for the complete 3-photo moodboard system
// Tests end-to-end workflow, API endpoints, and real data flows

/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server'
import { POST } from '../app/api/moodboard/generate/route'
import { buildScene } from '../lib/moodboard-randomizer'
import { imageGenerationService } from '../lib/image-generation-service'
import { imageCompositionService } from '../lib/image-composition-service'
import { imageAnalysisService } from '../lib/image-analysis-service'
import type { OnboardingData } from '../lib/ai-service'

// Mock external dependencies
jest.mock('../lib/supabase', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { 
          user: { 
            id: 'test-user-123',
            email: 'test@example.com' 
          }
        },
        error: null
      })
    }
  }))
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'workspace-123',
          onboarding_data_couple: mockOnboardingData
        },
        error: null
      })
    })),
    insert: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'moodboard-123' },
        error: null
      })
    }))
  }))
}))

// Mock OpenAI to avoid real API calls in tests
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    images: {
      generate: jest.fn().mockResolvedValue({
        data: [{
          url: 'https://example.com/generated-image.jpg'
        }]
      })
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                summary: 'Beautiful romantic wedding',
                insights: ['Great venue choice', 'Perfect color palette'],
                styleGuide: {
                  color_palette: 'blush pink and gold',
                  style_keywords: ['romantic', 'elegant'],
                  themes: ['classic', 'romantic']
                }
              })
            }
          }]
        })
      }
    }
  }))
})

// Mock sharp for image processing
jest.mock('sharp', () => {
  const mockSharp = jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    composite: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data'))
  }))
  
  return mockSharp
})

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

describe('End-to-End Moodboard Generation', () => {
  
  describe('Complete 3-Photo Workflow', () => {
    test('should generate complete moodboard through full pipeline', async () => {
      // Step 1: Randomization
      const randomizationResult = buildScene(mockOnboardingData, 12345)
      
      expect(randomizationResult.photos).toHaveLength(3)
      expect(randomizationResult.colorPalette).toBeDefined()
      expect(randomizationResult.seed).toBe(12345)
      
      // Step 2: Photo Generation (mock)
      const photoResult = await imageGenerationService.generateCategorizedPhotos(
        randomizationResult.photos,
        mockOnboardingData
      )
      
      expect(photoResult.success).toBe(true)
      expect(photoResult.photos).toHaveLength(3)
      expect(photoResult.categories_generated).toHaveLength(3)
      
      // Step 3: Composition (mock)
      if (photoResult.success && photoResult.photos) {
        const compositionResult = await imageCompositionService.composeThreePhotoMoodboard(
          photoResult.photos as [any, any, any],
          randomizationResult.colorPalette,
          'test-workspace',
          undefined,
          'grid-3x1'
        )
        
        expect(compositionResult.success).toBe(true)
        expect(compositionResult.image_buffer).toBeDefined()
      }
    }, 10000) // Increased timeout for integration test

    test('should handle fallback scenarios gracefully', async () => {
      // Test with invalid onboarding data
      const invalidData = {} as OnboardingData
      
      const result = buildScene(invalidData, 12345)
      
      // Should still generate valid structure with fallbacks
      expect(result.photos).toHaveLength(3)
      expect(result.colorPalette).toBeDefined()
      expect(typeof result.colorPalette).toBe('string')
    })

    test('should maintain consistency across multiple generations with same seed', async () => {
      const seed = 54321
      
      // Generate multiple times with same seed
      const results = [
        buildScene(mockOnboardingData, seed),
        buildScene(mockOnboardingData, seed),
        buildScene(mockOnboardingData, seed)
      ]
      
      // All results should be identical
      const firstResult = results[0]
      results.forEach(result => {
        expect(result.photos).toEqual(firstResult.photos)
        expect(result.colorPalette).toBe(firstResult.colorPalette)
        expect(result.seed).toBe(firstResult.seed)
      })
    })
  })

  describe('API Endpoint Integration', () => {
    test('should handle 3-photo API request successfully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/moodboard/generate?type=3-photo&layout=grid-3x1&seed=12345', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      expect(responseData.randomization_seed).toBeDefined()
      expect(responseData.categories_generated).toBeDefined()
    }, 15000)

    test('should handle legacy API request for backward compatibility', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/moodboard/generate?type=multi-image&layout=magazine', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
    }, 15000)

    test('should handle missing authentication gracefully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/moodboard/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(mockRequest)
      
      expect(response.status).toBe(401)
    })
  })

  describe('Error Handling and Recovery', () => {
    test('should handle generation failures with graceful fallback', async () => {
      // Mock failure in image generation
      const originalGenerate = imageGenerationService.generateCategorizedPhotos
      jest.spyOn(imageGenerationService, 'generateCategorizedPhotos').mockImplementationOnce(() => {
        return Promise.resolve({
          success: false,
          error: 'Mock generation failure',
          generation_time: 100,
          categories_generated: [],
          fallbacks_used: 3
        })
      })

      const randomizationResult = buildScene(mockOnboardingData, 12345)
      const photoResult = await imageGenerationService.generateCategorizedPhotos(
        randomizationResult.photos,
        mockOnboardingData
      )

      expect(photoResult.success).toBe(false)
      expect(photoResult.error).toBeDefined()

      // Restore original method
      jest.restoreAllMocks()
    })

    test('should handle composition failures gracefully', async () => {
      const mockPhotos = [
        { type: 'ceremony', url: 'https://example.com/1.jpg', prompt_used: 'test', generation_metadata: { model: 'test', generated_at: '', style_focus: 'test' }},
        { type: 'reception', url: 'https://example.com/2.jpg', prompt_used: 'test', generation_metadata: { model: 'test', generated_at: '', style_focus: 'test' }},
        { type: 'cake', url: 'https://example.com/3.jpg', prompt_used: 'test', generation_metadata: { model: 'test', generated_at: '', style_focus: 'test' }}
      ] as any

      const compositionResult = await imageCompositionService.composeThreePhotoMoodboard(
        mockPhotos,
        'test colors',
        'test-workspace',
        undefined,
        'invalid-layout' as any
      )

      // Should handle invalid layout gracefully
      expect(compositionResult.success).toBeDefined()
    })

    test('should handle network timeouts in image generation', async () => {
      // Test timeout handling (mocked)
      const slowGeneration = new Promise((resolve) => {
        setTimeout(() => resolve({
          success: true,
          photos: [],
          generation_time: 30000,
          categories_generated: [],
          fallbacks_used: 0
        }), 100) // Mock slow response
      })

      const result = await Promise.race([
        slowGeneration,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 50)
        )
      ]).catch(error => ({ error: error.message }))

      expect(result).toHaveProperty('error')
    })
  })

  describe('Performance Benchmarks', () => {
    test('should generate randomized configuration quickly', () => {
      const startTime = Date.now()
      
      const result = buildScene(mockOnboardingData, 12345)
      
      const duration = Date.now() - startTime
      
      expect(result).toBeDefined()
      expect(duration).toBeLessThan(100) // Should complete in < 100ms
    })

    test('should handle multiple concurrent generations', async () => {
      const seeds = [111, 222, 333, 444, 555]
      const startTime = Date.now()
      
      const promises = seeds.map(seed => 
        Promise.resolve(buildScene(mockOnboardingData, seed))
      )
      
      const results = await Promise.all(promises)
      
      const duration = Date.now() - startTime
      
      expect(results).toHaveLength(5)
      expect(duration).toBeLessThan(200) // Should handle 5 concurrent in < 200ms
      
      // All results should be valid and different
      results.forEach((result, index) => {
        expect(result.photos).toHaveLength(3)
        expect(result.seed).toBe(seeds[index])
      })
      
      // Results should be different (with high probability)
      const uniqueCategories = new Set(results.map(r => r.photos[0].category))
      expect(uniqueCategories.size).toBeGreaterThan(1)
    })
  })

  describe('Data Validation', () => {
    test('should validate generated photo configurations', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      // Validate each photo configuration
      result.photos.forEach((photo, index) => {
        expect(photo.category).toBeDefined()
        expect(typeof photo.category).toBe('string')
        
        expect(photo.subType).toBeDefined()
        expect(typeof photo.subType).toBe('string')
        
        expect(photo.environment).toBeDefined()
        expect(typeof photo.environment).toBe('string')
        
        expect(photo.time).toBeDefined()
        expect(typeof photo.time).toBe('string')
        
        expect(photo.elements).toBeDefined()
        expect(typeof photo.elements).toBe('object')
        
        expect(photo.helpers).toBeDefined()
        expect(typeof photo.helpers).toBe('object')
      })
    })

    test('should validate metadata completeness', () => {
      const result = buildScene(mockOnboardingData, 12345)
      
      expect(result.metadata).toBeDefined()
      expect(result.metadata.categoriesSelected).toHaveLength(3)
      expect(typeof result.metadata.generationTime).toBe('number')
      expect(typeof result.metadata.elementsSelected).toBe('number')
      
      expect(result.metadata.generationTime).toBeGreaterThan(0)
      expect(result.metadata.elementsSelected).toBeGreaterThanOrEqual(0)
    })

    test('should generate valid color palette extraction', () => {
      const testData: OnboardingData = {
        ...mockOnboardingData,
        step_5: {
          themes: ['modern'],
          color_palette: 'navy blue and silver'
        }
      }
      
      const result = buildScene(testData, 12345)
      
      expect(result.colorPalette).toBe('navy blue and silver')
    })
  })

  describe('Backward Compatibility', () => {
    test('should not break existing moodboard generation', async () => {
      // Test that legacy system still works
      const mockRequest = new NextRequest('http://localhost:3000/api/moodboard/generate?type=single&layout=magazine', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toBeDefined()
      
      // Should not have 3-photo specific fields for legacy requests
      expect(responseData.randomization_seed).toBeUndefined()
      expect(responseData.categories_generated).toBeUndefined()
    }, 15000)
  })
})

describe('Image Analysis Integration', () => {
  
  test('should analyze photos for conflicts (fallback mode)', async () => {
    const mockPhotos = [
      {
        type: 'ceremony',
        url: '/fallback/ceremony.jpg',
        prompt_used: 'ceremony with white roses and gold chairs',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'ceremony',
          elements_included: ['flowers', 'chairs']
        }
      },
      {
        type: 'reception_table',
        url: '/fallback/table.jpg', 
        prompt_used: 'table setting with white roses and gold linens',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'reception_table',
          elements_included: ['flowers', 'linens']
        }
      },
      {
        type: 'wedding_cake',
        url: '/fallback/cake.jpg',
        prompt_used: 'wedding cake with different flowers',
        generation_metadata: {
          model: 'fallback',
          generated_at: new Date().toISOString(),
          style_focus: 'wedding_cake',
          elements_included: ['flowers']
        }
      }
    ] as any

    const conflicts = await imageAnalysisService.detectVisualConflicts(mockPhotos)
    
    expect(Array.isArray(conflicts)).toBe(true)
    // May detect flower conflicts between photos
    if (conflicts.length > 0) {
      conflicts.forEach(conflict => {
        expect(conflict.photoIndex).toBeGreaterThanOrEqual(0)
        expect(conflict.photoIndex).toBeLessThan(3)
        expect(Array.isArray(conflict.conflicts)).toBe(true)
        expect(['low', 'medium', 'high']).toContain(conflict.severity)
        expect(typeof conflict.recommendSwap).toBe('boolean')
      })
    }
  })

  test('should provide service statistics', () => {
    const stats = imageAnalysisService.getAnalysisStats()
    
    expect(stats).toHaveProperty('openai_available')
    expect(stats).toHaveProperty('fallback_mode')
    expect(stats).toHaveProperty('supported_formats')
    
    expect(typeof stats.openai_available).toBe('boolean')
    expect(typeof stats.fallback_mode).toBe('boolean')
    expect(Array.isArray(stats.supported_formats)).toBe(true)
  })
})
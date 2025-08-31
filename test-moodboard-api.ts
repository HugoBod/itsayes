#!/usr/bin/env tsx

/**
 * Integration test for the moodboard API with real DALL-E generation
 * Tests the complete flow from configuration to final moodboard
 */

import type { OnboardingData } from './lib/ai-service'

const API_BASE_URL = 'http://localhost:3000/api'

// Test data
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
    international_guests: 'some'
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

console.log('🧪 Starting Moodboard API Integration Test...\n')

async function testMoodboardGeneration(testSeed?: number) {
  console.log(`🚀 Testing 3-photo moodboard generation${testSeed ? ' with seed ' + testSeed : ''}`)
  
  try {
    const url = new URL(`${API_BASE_URL}/moodboard/generate`)
    url.searchParams.set('type', '3-photo')
    url.searchParams.set('layout', 'grid-3x1')
    url.searchParams.set('location', 'true')
    if (testSeed) {
      url.searchParams.set('seed', testSeed.toString())
    }
    url.searchParams.set('skipSwapping', 'true') // Skip for faster testing
    
    const startTime = Date.now()
    
    console.log('📡 Making API request to:', url.toString())
    
    // Note: In a real test, you'd need to provide authentication
    // For testing purposes, you might need to manually get a token
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })
    
    const duration = Date.now() - startTime
    console.log(`⏱️ API call completed in ${duration}ms`)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error ${response.status}: ${errorText}`)
    }
    
    const result = await response.json()
    
    console.log('✅ API Response Structure:')
    console.log('   - Success:', result.success)
    console.log('   - Generation Type:', result.generation_type)
    console.log('   - Layout Type:', result.layout_type)
    console.log('   - Source Images Count:', result.source_images_count)
    console.log('   - Categories Generated:', result.categories_generated?.length || 'N/A')
    console.log('   - Location Context:', result.location_context || 'N/A')
    console.log('   - Randomization Seed:', result.randomization_seed || 'N/A')
    console.log('   - Fallbacks Used:', result.fallbacks_used ?? 'N/A')
    
    if (result.data) {
      console.log('   - Final Image URL Present:', !!result.data.image_url)
      console.log('   - Stored Image URL Present:', !!result.data.stored_image_url)
      console.log('   - Wedding Summary:', result.data.wedding_summary?.substring(0, 100) + '...')
      console.log('   - AI Insights Count:', result.data.ai_insights?.length || 0)
      console.log('   - Color Palette:', result.data.style_guide?.color_palette)
      console.log('   - Style Keywords:', result.data.style_guide?.style_keywords?.join(', '))
    }
    
    return {
      success: true,
      duration,
      result,
      testSeed
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      testSeed
    }
  }
}

async function testMoodboardRetrieval() {
  console.log('\n📥 Testing moodboard retrieval...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/moodboard/generate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    })
    
    if (response.status === 404) {
      console.log('ℹ️ No existing moodboard found (expected for first run)')
      return { success: true, found: false }
    }
    
    if (!response.ok) {
      throw new Error(`GET error ${response.status}: ${await response.text()}`)
    }
    
    const result = await response.json()
    console.log('✅ Retrieved existing moodboard:')
    console.log('   - Moodboard ID:', result.moodboard_id)
    console.log('   - Created At:', result.created_at)
    console.log('   - Has Image URL:', !!result.data?.image_url)
    
    return { success: true, found: true, result }
    
  } catch (error) {
    console.error('❌ Retrieval test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

async function runIntegrationTests() {
  console.log('🎯 Starting comprehensive integration tests\n')
  
  const results = []
  
  // Test 1: Check for existing moodboard
  console.log('Test 1: Moodboard Retrieval')
  const retrievalResult = await testMoodboardRetrieval()
  results.push({ test: 'retrieval', ...retrievalResult })
  
  // Test 2: Generate new moodboard (deterministic seed)
  console.log('\nTest 2: New Moodboard Generation (Seeded)')
  const generationResult = await testMoodboardGeneration(12345)
  results.push({ test: 'generation_seeded', ...generationResult })
  
  // Test 3: Generate with different seed for variation
  console.log('\nTest 3: Variation Test (Different Seed)')
  const variationResult = await testMoodboardGeneration(54321)
  results.push({ test: 'generation_variation', ...variationResult })
  
  // Summary
  console.log('\n📊 Test Summary:')
  const passedTests = results.filter(r => r.success).length
  const totalTests = results.length
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`)
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌'
    const duration = result.duration ? ` (${result.duration}ms)` : ''
    console.log(`   ${status} Test ${index + 1} (${result.test})${duration}`)
    if (!result.success && result.error) {
      console.log(`      Error: ${result.error}`)
    }
  })
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All integration tests passed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Start development server: pnpm dev')
    console.log('   2. Test in browser with authentication')
    console.log('   3. Verify image generation quality')
    console.log('   4. Test different layout options')
  } else {
    console.log('\n⚠️ Some tests failed. Check authentication and service configuration.')
  }
  
  return results
}

async function main() {
  console.log('🔄 Note: This test requires:')
  console.log('   1. Development server running (pnpm dev)')
  console.log('   2. Valid authentication token')
  console.log('   3. OpenAI API key configured')
  console.log('   4. Supabase connection active')
  console.log('')
  
  if (process.argv.includes('--help')) {
    console.log('Usage: tsx test-moodboard-api.ts [options]')
    console.log('Options:')
    console.log('  --help    Show this help message')
    console.log('  --quick   Run only basic generation test')
    console.log('')
    return
  }
  
  if (process.argv.includes('--quick')) {
    console.log('🚀 Running quick test...')
    await testMoodboardGeneration(12345)
  } else {
    await runIntegrationTests()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
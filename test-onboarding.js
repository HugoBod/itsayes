#!/usr/bin/env node

// Test to check if onboarding navigation is working
async function testOnboardingNavigation() {
  console.log('🧪 Testing Onboarding Navigation...\n')
  
  try {
    // Test if onboarding pages are accessible
    console.log('1️⃣ Testing Onboarding Pages Accessibility...')
    
    const onboardingPages = [
      '/onboarding',
      '/onboarding/couple-details',
      '/onboarding/stage', 
      '/onboarding/budget-guests',
      '/onboarding/guest-info',
      '/onboarding/style',
      '/onboarding/planners',
      '/onboarding/summary'
    ]
    
    for (const page of onboardingPages) {
      try {
        const response = await fetch(`http://localhost:3001${page}`)
        const status = response.status
        
        if (status === 200) {
          console.log(`   ✅ ${page} - Accessible (${status})`)
        } else if (status === 302 || status === 307) {
          console.log(`   🔀 ${page} - Redirected (${status})`)
        } else if (status === 401) {
          console.log(`   🔐 ${page} - Requires auth (${status})`)
        } else {
          console.log(`   ❌ ${page} - Status: ${status}`)
          return false
        }
      } catch (error) {
        console.log(`   ❌ ${page} - Error: ${error.message}`)
        return false
      }
    }
    
    console.log('\n2️⃣ Testing After-Onboarding Flow...')
    
    // Test moodboard reveal page
    try {
      const response = await fetch(`http://localhost:3001/dashboard/moodboard-reveal`)
      const status = response.status
      
      if (status === 200) {
        console.log(`   ✅ /dashboard/moodboard-reveal - Accessible (${status})`)
      } else if (status === 302 || status === 401) {
        console.log(`   🔐 /dashboard/moodboard-reveal - Requires auth (${status})`)
      } else {
        console.log(`   ❌ /dashboard/moodboard-reveal - Status: ${status}`)
        return false
      }
    } catch (error) {
      console.log(`   ❌ /dashboard/moodboard-reveal - Error: ${error.message}`)
      return false
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run test
testOnboardingNavigation()
  .then(success => {
    if (success) {
      console.log('\n🎉 Onboarding pages are accessible!')
      console.log('\n🔍 Possible issues with Continue button:')
      console.log('   • Check browser console for JavaScript errors')
      console.log('   • Verify authentication state')
      console.log('   • Check if onboarding service is working client-side')
      console.log('   • Look for any validation errors')
    } else {
      console.log('\n💥 Some onboarding pages have issues')
    }
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('💥 Test script error:', error)
    process.exit(1)
  })
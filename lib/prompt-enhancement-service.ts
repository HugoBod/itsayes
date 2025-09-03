/**
 * Prompt Enhancement Service
 * Takes template prompts and enhances them with AI rewriting for photorealistic results
 */

import type { OnboardingData } from './ai-service'
import type { LocationContext } from './location-context-service'
import { 
  CATEGORY_VARIATIONS, 
  getCategoryVariation, 
  getCategoryPhotoSpecs, 
  getCategoryLighting 
} from './category-variations-config'

interface PromptEnhancementOptions {
  colorPalette?: string
  budget?: number
  currency?: string
  inspiration?: string
  guestCount?: number
  locationContext?: LocationContext
  imageSize?: '1024x1024' | '1024x1792' | '1792x1024'
  moodboardLayout?: 'square' | 'portrait' | 'landscape'
}

interface EnhancedPromptResult {
  enhancedPrompt: string
  imageSize: '1024x1024' | '1024x1792' | '1792x1024'
  metadata: {
    budgetTier: 'low' | 'mid' | 'high'
    colorPaletteApplied: boolean
    inspirationApplied: boolean
    locationEnhanced: boolean
    originalLength: number
    enhancedLength: number
    compositionOptimized: boolean
    aspectRatio: 'square' | 'portrait' | 'landscape'
  }
}

export class PromptEnhancementService {
  
  /**
   * Main method to enhance a template prompt with onboarding data
   */
  async enhancePrompt(
    templatePrompt: string,
    category: string,
    onboardingData: OnboardingData,
    locationContext?: LocationContext
  ): Promise<EnhancedPromptResult> {
    
    // Extract enhancement data from onboarding
    const options: PromptEnhancementOptions = {
      colorPalette: onboardingData.step_5?.color_palette,
      budget: onboardingData.step_3?.budget,
      currency: onboardingData.step_3?.currency,
      inspiration: onboardingData.step_5?.inspiration,
      guestCount: onboardingData.step_4?.guest_count,
      locationContext,
      imageSize: this.getOptimalImageSize(category),
      moodboardLayout: this.getMoodboardLayout(category)
    }
    
    // Determine budget tier
    const budgetTier = this.getBudgetTier(options.budget || 0, options.currency || 'USD')
    
    // Parse the template prompt to extract components
    const promptComponents = this.parseTemplatePrompt(templatePrompt)
    
    // Build enhanced prompt following your rules
    const enhancedPrompt = this.buildEnhancedPrompt(
      promptComponents,
      category,
      options,
      budgetTier
    )
    
    return {
      enhancedPrompt,
      imageSize: options.imageSize || '1024x1024',
      metadata: {
        budgetTier,
        colorPaletteApplied: !!options.colorPalette,
        inspirationApplied: !!options.inspiration,
        locationEnhanced: !!locationContext,
        originalLength: templatePrompt.length,
        enhancedLength: enhancedPrompt.length,
        compositionOptimized: true,
        aspectRatio: options.moodboardLayout || 'square'
      }
    }
  }
  
  /**
   * Determine budget tier based on amount and currency
   */
  private getBudgetTier(budget: number, currency: string): 'low' | 'mid' | 'high' {
    // Convert to USD equivalent for consistent tiers
    const usdBudget = this.convertToUSD(budget, currency)
    
    if (usdBudget < 25000) return 'low'
    if (usdBudget < 75000) return 'mid'
    return 'high'
  }
  
  /**
   * Convert budget to USD for tier calculation
   */
  private convertToUSD(amount: number, currency: string): number {
    const rates: Record<string, number> = {
      'USD': 1,
      'EUR': 1.1,
      'GBP': 1.27,
      'CAD': 0.74,
      'AUD': 0.67
    }
    return amount * (rates[currency] || 1)
  }
  
  /**
   * Parse template prompt to extract components
   */
  private parseTemplatePrompt(template: string): {
    baseDescription: string
    environment: string
    time: string
    elements: string[]
  } {
    // Extract environment and time patterns
    const environmentMatch = template.match(/(?:set in a|in a)\s+([^,\s]+(?:\s+[^,\s]+)*)/i)
    const timeMatch = template.match(/at\s+([^.\s]+(?:\s+[^.\s]+)*)/i)
    
    return {
      baseDescription: template.split('Editorial')[0].trim(),
      environment: environmentMatch?.[1] || 'elegant venue',
      time: timeMatch?.[1] || 'golden hour',
      elements: this.extractElements(template)
    }
  }
  
  /**
   * Extract specific elements from template (flowers, chairs, etc.)
   */
  private extractElements(template: string): string[] {
    const elements = []
    
    // Extract flower mentions
    const flowerMatch = template.match(/featuring\s+([^,]+)/i)
    if (flowerMatch) elements.push(`flowers: ${flowerMatch[1]}`)
    
    // Extract furniture mentions
    const chairMatch = template.match(/([^,]*chairs[^,]*)/i)
    if (chairMatch) elements.push(`seating: ${chairMatch[1]}`)
    
    const tableMatch = template.match(/([^,]*table[^,]*)/i)
    if (tableMatch) elements.push(`tables: ${tableMatch[1]}`)
    
    return elements
  }
  
  /**
   * Build enhanced prompt following the improvement rules
   */
  private buildEnhancedPrompt(
    components: any,
    category: string,
    options: PromptEnhancementOptions,
    budgetTier: 'low' | 'mid' | 'high'
  ): string {
    
    // 1. Build base scene description with budget considerations
    let scene = this.buildSceneDescription(category, components, budgetTier, options)
    
    // 2. Add color palette as subtle accents
    if (options.colorPalette) {
      scene += ` ${this.integrateColorPalette(options.colorPalette, category)}`
    }
    
    // 3. Add inspiration style cues
    if (options.inspiration) {
      scene += ` ${this.translateInspiration(options.inspiration)}`
    }
    
    // 4. Add location architectural elements
    if (options.locationContext) {
      scene += ` ${this.integrateLocationStyle(options.locationContext, category)}`
    }
    
    // 5. Add variety/anti-repetition elements
    scene += ` ${this.addVarietyElements(category, budgetTier)}`
    
    // 6. Add size-specific composition guidance
    const compositionGuidance = this.getCompositionForSize(category, options.imageSize || '1024x1024')
    scene += ` ${compositionGuidance}.`
    
    // 7. Add mandatory photorealistic suffix
    scene += ` Shot as editorial wedding photography, naturalistic cinematic lighting, eye-level perspective, shallow depth of field, soft background bokeh, realistic textures, no people, no text or logos.`
    
    // Ensure 80-120 words
    return this.optimizeLength(scene)
  }
  
  /**
   * Build scene description using detailed category variations
   */
  private buildSceneDescription(
    category: string, 
    components: any, 
    budgetTier: 'low' | 'mid' | 'high',
    options: PromptEnhancementOptions
  ): string {
    
    // Get category configuration
    const categoryConfig = CATEGORY_VARIATIONS[category]
    if (!categoryConfig) {
      return this.buildFallbackScene(category, components, budgetTier, options)
    }
    
    // Generate seed for consistent variations within the same session
    const variationSeed = this.generateVariationSeed(options)
    
    // Build hero description with budget-appropriate details
    const heroDescription = this.buildHeroDescription(category, categoryConfig.hero, budgetTier)
    
    // Add specific variations based on category
    const variations = this.buildCategoryVariations(category, budgetTier, variationSeed)
    
    // Add environment and lighting
    const environment = this.enhanceEnvironment(components.environment, budgetTier, options.locationContext)
    const lighting = getCategoryLighting(category, variationSeed)
    
    // Get photography specifications
    const photoSpecs = getCategoryPhotoSpecs(category)
    
    return `${heroDescription} ${variations} set in ${environment} during ${lighting}. ${photoSpecs.photographyStyle}`
  }
  
  /**
   * Build hero description with budget-appropriate luxury level
   */
  private buildHeroDescription(category: string, hero: string, budgetTier: 'low' | 'mid' | 'high'): string {
    const budgetModifiers = {
      low: { prefix: 'Charming', materials: 'simple, natural' },
      mid: { prefix: 'Sophisticated', materials: 'refined, boutique-quality' },
      high: { prefix: 'Luxury', materials: 'opulent, couture-level' }
    }
    
    const modifier = budgetModifiers[budgetTier]
    
    // Category-specific hero adaptations
    const heroAdaptations: Record<string, Record<string, string>> = {
      ceremony: {
        low: 'intimate ceremony with wooden arch and simple seating arrangement',
        mid: 'sophisticated ceremony featuring structured floral installation and elegant seating',
        high: 'grand ceremony with towering floral artistry and luxury seating collection'
      },
      reception_table: {
        low: 'charming tablescape with natural wood surface and modest floral touches',
        mid: 'boutique tablescape featuring layered linens and crystal stemware',
        high: 'couture tablescape with premium charger plates and museum-quality crystal'
      },
      wedding_cake: {
        low: 'elegant single-tier cake with simple buttercream finish',
        mid: 'designer multi-tier cake on marble pedestal with artisan details',
        high: 'architectural cake masterpiece with cascading sugar flower artistry'
      }
    }
    
    return heroAdaptations[category]?.[budgetTier] || `${modifier.prefix} ${hero} with ${modifier.materials} finishes`
  }
  
  /**
   * Build category-specific variations with budget considerations
   */
  private buildCategoryVariations(category: string, budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const variations: string[] = []
    
    // Get variations based on category and budget
    switch (category) {
      case 'ceremony':
        const archType = getCategoryVariation('ceremony', 'archTypes', seed)
        const seating = this.getBudgetAppropriateSeating(budgetTier, seed)
        const aisleDeco = getCategoryVariation('ceremony', 'aisleDeco', seed + 1)
        variations.push(`featuring ${archType}`, `${seating} arranged in perfect rows`, `with ${aisleDeco}`)
        break
        
      case 'reception_table':
        const table = getCategoryVariation('reception_table', 'tables', seed)
        const linen = this.getBudgetAppropriateLinen(budgetTier, seed)
        const floral = getCategoryVariation('reception_table', 'florals', seed + 1)
        const placeSetting = this.getBudgetAppropriatePlaceSetting(budgetTier, seed + 2)
        variations.push(`on ${table}`, `dressed with ${linen}`, `showcasing ${floral}`, `${placeSetting}`)
        break
        
      case 'wedding_cake':
        const cakeStyle = this.getBudgetAppropriateCakeStyle(budgetTier, seed)
        const stand = getCategoryVariation('wedding_cake', 'stands', seed + 1)
        const accent = getCategoryVariation('wedding_cake', 'accents', seed + 2)
        variations.push(`${cakeStyle} presentation`, `displayed on ${stand}`, `enhanced with ${accent}`)
        break
        
      case 'reception_ballroom':
        const ceiling = this.getBudgetAppropriateCeiling(budgetTier, seed)
        const tableLayout = getCategoryVariation('reception_ballroom', 'tables', seed + 1)
        const linens = getCategoryVariation('reception_ballroom', 'linens', seed + 2)
        variations.push(`showcasing ${ceiling}`, `with ${tableLayout} layout`, `dressed in ${linens}`)
        break
        
      default:
        // Generic variation for other categories
        variations.push('with carefully curated styling details')
    }
    
    return variations.filter(Boolean).join(', ')
  }
  
  /**
   * Get budget-appropriate seating option
   */
  private getBudgetAppropriateSeating(budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const seatingSets = {
      low: ['cross-back chairs', 'rustic benches'],
      mid: ['chiavari gold chairs', 'cross-back chairs'],
      high: ['chiavari gold chairs', 'acrylic ghost chairs']
    }
    
    const options = seatingSets[budgetTier]
    return options[seed % options.length]
  }
  
  /**
   * Get budget-appropriate linen option
   */
  private getBudgetAppropriateLinen(budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const linenSets = {
      low: ['ivory linen base', 'textured fabric overlays'],
      mid: ['ivory linen base with silk runners', 'velvet accent details'],
      high: ['premium silk table runners', 'couture textured linens with metallic details']
    }
    
    const options = linenSets[budgetTier]
    return options[seed % options.length]
  }
  
  /**
   * Get budget-appropriate place setting
   */
  private getBudgetAppropriatePlaceSetting(budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const placeSets = {
      low: ['simple white plates with basic glassware', 'minimalist place settings'],
      mid: ['crystal glassware with silver accents', 'gold charger plates with cut glass'],
      high: ['museum-quality crystal with gold chargers', 'couture place settings with premium metallic accents']
    }
    
    const options = placeSets[budgetTier]
    return options[seed % options.length]
  }
  
  /**
   * Get budget-appropriate cake style
   */
  private getBudgetAppropriateCakeStyle(budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const cakeStyles = {
      low: ['buttercream smooth finish', 'semi-naked rustic style'],
      mid: ['sugar flowers cascading', 'buttercream with metallic accents'],
      high: ['architectural sugar artistry', 'couture-level detailed piping work']
    }
    
    const options = cakeStyles[budgetTier]
    return options[seed % options.length]
  }
  
  /**
   * Get budget-appropriate ceiling treatment
   */
  private getBudgetAppropriateCeiling(budgetTier: 'low' | 'mid' | 'high', seed: number): string {
    const ceilingOptions = {
      low: ['string light canopy', 'draped voile fabric'],
      mid: ['hanging greenery installations', 'draped voile with uplighting'],
      high: ['crystal chandeliers', 'crystal installations with silk drapery']
    }
    
    const options = ceilingOptions[budgetTier]
    return options[seed % options.length]
  }
  
  /**
   * Generate variation seed from options for consistency
   */
  private generateVariationSeed(options: PromptEnhancementOptions): number {
    let seed = 0
    
    if (options.colorPalette) {
      seed += options.colorPalette.length
    }
    
    if (options.budget) {
      seed += Math.floor(options.budget / 1000)
    }
    
    if (options.guestCount) {
      seed += options.guestCount
    }
    
    return seed
  }
  
  /**
   * Fallback scene building for unknown categories
   */
  private buildFallbackScene(
    category: string, 
    components: any, 
    budgetTier: 'low' | 'mid' | 'high',
    options: PromptEnhancementOptions
  ): string {
    const budgetModifiers = {
      low: 'Charming',
      mid: 'Sophisticated', 
      high: 'Luxury'
    }
    
    const baseScene = `${budgetModifiers[budgetTier]} ${category} styling`
    const environment = this.enhanceEnvironment(components.environment, budgetTier, options.locationContext)
    const lighting = this.selectLighting(components.time, budgetTier)
    
    return `${baseScene} set in ${environment} during ${lighting}`
  }
  
  /**
   * Integrate color palette as subtle accents only
   */
  private integrateColorPalette(colorPalette: string, category: string): string {
    const colors = colorPalette.toLowerCase().split(/[,&]/).map(c => c.trim())
    
    const accentMappings: Record<string, string> = {
      ceremony: 'with subtle [COLOR] accents in floral petals and ceremony programs',
      reception_table: 'featuring [COLOR] napkin details and delicate floral touches',
      wedding_cake: 'accented with [COLOR] sugar flowers and ribbon details',
      reception_ballroom: 'with [COLOR] uplighting and scattered floral arrangements'
    }
    
    const template = accentMappings[category] || 'with subtle [COLOR] accent details'
    const primaryColor = colors[0] || 'ivory'
    
    return template.replace('[COLOR]', primaryColor)
  }
  
  /**
   * Translate inspiration into visual style cues
   */
  private translateInspiration(inspiration: string): string {
    const inspo = inspiration.toLowerCase()
    
    if (inspo.includes('taylor swift') || inspo.includes('romantic')) {
      return 'with whimsical fairy lights, soft romantic textures, and dreamy floral arrangements'
    }
    
    if (inspo.includes('french') || inspo.includes('luxury')) {
      return 'featuring haute couture textures, crystal chandeliers, and sophisticated French-inspired details'
    }
    
    if (inspo.includes('bohemian') || inspo.includes('boho')) {
      return 'with organic textures, macramé details, pampas grass, and earthy natural elements'
    }
    
    if (inspo.includes('modern') || inspo.includes('minimal')) {
      return 'featuring clean lines, geometric elements, and contemporary sophisticated styling'
    }
    
    if (inspo.includes('rustic') || inspo.includes('country')) {
      return 'with weathered wood textures, mason jars, wildflower arrangements, and vintage charm'
    }
    
    // Generic inspiration fallback
    return 'with custom styling details reflecting the couple\'s personal aesthetic'
  }
  
  /**
   * Integrate location architectural style
   */
  private integrateLocationStyle(locationContext: LocationContext, category: string): string {
    const archStyle = locationContext.architecture_style.toLowerCase()
    
    if (archStyle.includes('art deco')) {
      return 'incorporating Art Deco geometric patterns and metallic accents'
    }
    
    if (archStyle.includes('victorian')) {
      return 'featuring Victorian elegance with ornate details and classical elements'
    }
    
    if (archStyle.includes('modern') || archStyle.includes('contemporary')) {
      return 'showcasing contemporary architectural lines and minimalist sophistication'
    }
    
    if (archStyle.includes('gothic')) {
      return 'highlighting Gothic architectural grandeur with dramatic shadows and stonework'
    }
    
    return 'complementing the local architectural character'
  }
  
  /**
   * Add variety elements to prevent repetition
   */
  private addVarietyElements(category: string, budgetTier: 'low' | 'mid' | 'high'): string {
    const varietyOptions = {
      ceremony: {
        low: ['wooden cross-back chairs', 'wildflower petals', 'burlap aisle runner'],
        mid: ['Chiavari chairs', 'rose petal aisle', 'lace ceremony programs'],  
        high: ['Louis XVI chairs', 'orchid petal carpet', 'silk ceremony ribbons']
      },
      reception_table: {
        low: ['mason jar centerpieces', 'kraft paper menus', 'wildflower posies'],
        mid: ['mercury glass votives', 'linen napkins', 'garden roses'],
        high: ['crystal candelabras', 'silk napkins', 'peony arrangements']
      },
      wedding_cake: {
        low: ['rustic cake stand', 'buttercream finish', 'fresh berry accents'],
        mid: ['marble cake pedestal', 'fondant details', 'sugar flower cascades'],
        high: ['gilded cake stand', 'hand-piped royal icing', 'crystallized sugar work']
      }
    }
    
    const options = varietyOptions[category as keyof typeof varietyOptions]?.[budgetTier] || ['elegant details']
    const selected = options[Math.floor(Math.random() * options.length)]
    
    return `featuring ${selected} and textural depth`
  }
  
  /**
   * Enhance environment based on budget and location
   */
  private enhanceEnvironment(
    baseEnvironment: string, 
    budgetTier: 'low' | 'mid' | 'high',
    locationContext?: LocationContext
  ): string {
    const budgetModifiers = {
      low: 'charming',
      mid: 'elegant',
      high: 'luxurious'
    }
    
    const modifier = budgetModifiers[budgetTier]
    let enhanced = `${modifier} ${baseEnvironment}`
    
    if (locationContext?.popular_venues?.[0]) {
      const venue = locationContext.popular_venues[0].toLowerCase()
      enhanced += ` reminiscent of ${venue}`
    }
    
    return enhanced
  }
  
  /**
   * Select appropriate lighting based on time and budget
   */
  private selectLighting(time: string, budgetTier: 'low' | 'mid' | 'high'): string {
    if (time.includes('golden')) {
      return budgetTier === 'high' ? 'dramatic golden hour with professional lighting' : 'warm golden hour light'
    }
    
    if (time.includes('candlelit') || time.includes('night')) {
      return budgetTier === 'high' ? 'sophisticated candlelit ambiance with crystal chandeliers' : 'romantic candlelit atmosphere'
    }
    
    return budgetTier === 'high' ? 'perfect natural lighting with professional enhancement' : 'soft natural daylight'
  }
  
  /**
   * Get optimal image size for category
   */
  private getOptimalImageSize(category: string): '1024x1024' | '1024x1792' | '1792x1024' {
    // Determine optimal size based on category composition
    const categoryMapping: Record<string, '1024x1024' | '1024x1792' | '1792x1024'> = {
      // Square compositions - perfect for moodboard grid
      'ceremony': '1024x1024',           // Ceremony setup works well square
      'reception_table': '1024x1024',   // Table details are ideal square
      'wedding_cake': '1024x1024',      // Cake display fits perfectly square
      'photo_booth': '1024x1024',       // Photo corner setup is square
      
      // Portrait compositions - for tall elements
      'venue_aerial': '1024x1792',      // Aerial venue shots benefit from portrait
      'couple_entrance': '1024x1792',   // Entrance pathways work in portrait
      
      // Landscape compositions - for wide scenes
      'reception_ballroom': '1792x1024', // Wide ballroom views need landscape
      'lighting_atmosphere': '1792x1024', // Atmospheric lighting spans wide
      
      // Flexible categories default to square for consistency
      'decorative_details': '1024x1024',
      'traditions_rituals': '1024x1024'
    }
    
    return categoryMapping[category] || '1024x1024' // Default to square for moodboard consistency
  }
  
  /**
   * Get moodboard layout preference for category
   */
  private getMoodboardLayout(category: string): 'square' | 'portrait' | 'landscape' {
    const layoutMapping: Record<string, 'square' | 'portrait' | 'landscape'> = {
      'ceremony': 'square',
      'reception_table': 'square',
      'wedding_cake': 'square',
      'photo_booth': 'square',
      'decorative_details': 'square',
      'traditions_rituals': 'square',
      'venue_aerial': 'portrait',
      'couple_entrance': 'portrait',
      'reception_ballroom': 'landscape',
      'lighting_atmosphere': 'landscape'
    }
    
    return layoutMapping[category] || 'square'
  }
  
  /**
   * Add composition guidance based on image size and category
   */
  private getCompositionForSize(category: string, imageSize: string): string {
    if (imageSize === '1024x1024') {
      // Square compositions - centered, balanced
      const squareGuidance: Record<string, string> = {
        ceremony: 'Centered square composition with symmetrical altar arrangement',
        reception_table: 'Overhead square view showcasing complete table setting',
        wedding_cake: 'Centered cake display with balanced negative space around',
        photo_booth: 'Square photo corner setup with backdrop as focal point'
      }
      return squareGuidance[category] || 'Balanced square composition with centered focal point'
    }
    
    if (imageSize === '1024x1792') {
      // Portrait compositions - vertical flow
      return 'Vertical portrait composition emphasizing height and grandeur'
    }
    
    if (imageSize === '1792x1024') {
      // Landscape compositions - horizontal sweep
      return 'Wide landscape composition capturing full scene breadth'
    }
    
    return 'Optimal composition for subject matter'
  }

  /**
   * Optimize prompt length to 80-120 words
   */
  private optimizeLength(prompt: string): string {
    const words = prompt.split(/\s+/)
    
    if (words.length < 80) {
      // Add descriptive elements
      return prompt + ' with exquisite attention to detail and premium materials'
    }
    
    if (words.length > 120) {
      // Trim while preserving essential elements and suffix
      const suffix = 'Shot as editorial wedding photography, naturalistic cinematic lighting, eye-level perspective, shallow depth of field, soft background bokeh, realistic textures, no people, no text or logos.'
      const mainContent = words.slice(0, -25).join(' ') // Remove suffix temporarily
      const trimmed = mainContent.split(/\s+/).slice(0, 95).join(' ') // Keep 95 words for main content
      return trimmed + ' ' + suffix
    }
    
    return prompt
  }
}

// Export singleton instance
export const promptEnhancementService = new PromptEnhancementService()
// Moodboard Configuration Management
// Environment pools, helper elements, and prompt templates

import type { HelperPools } from './moodboard-categories'
import type { OnboardingTemplateData, DynamicTemplate } from './types/onboarding-template'

// Environment and timing options
export const HELPER_POOLS: HelperPools = {
  environments: [
    'garden courtyard',
    'beachfront terrace', 
    'rooftop city view',
    'historic ballroom',
    'vineyard',
    'forest clearing'
  ],
  times: [
    'golden hour',
    'blue hour', 
    'candlelit night',
    'bright daytime'
  ],
  aisle_deco: [
    'petals',
    'lanterns', 
    'candles',
    'greenery runners',
    'fabric drape'
  ],
  ceiling_deco: [
    'chandeliers',
    'string lights',
    'hanging florals',
    'fabric drape'
  ],
  centerpiece_styles: [
    'low compact',
    'tall stands',
    'bud-vase cluster', 
    'candles-only'
  ],
  place_settings: [
    'silver',
    'gold',
    'matte black',
    'modern crystal'
  ],
  backdrops: [
    'floral wall',
    'neon sign',
    'hedge',
    'draped fabric',
    'geometric panel'
  ],
  lighting_options: [
    'string lights',
    'lanterns',
    'chandeliers',
    'neon text'
  ]
} as const

// Dynamic Prompt templates using onboarding data
export const PROMPT_TEMPLATES: Record<string, DynamicTemplate> = {
  ceremony: (data: OnboardingTemplateData) => {
    const ceremonyType = data.ceremonyType === 'religious' && data.religiousType 
      ? `${data.religiousType} wedding ceremony`
      : `${data.ceremonyType} wedding ceremony`
    
    // Utiliser la vraie location et le type religieux pour le venue
    let venue = 'elegant venue'
    if (data.location) {
      // Utiliser la location réelle dans le nom du venue
      if (data.religiousType === 'Hindu') {
        venue = `temple courtyard with traditional mandap at ${data.location}`
      } else if (data.religiousType === 'Christian') {
        venue = `chapel altar with cross at ${data.location}`
      } else if (data.religiousType === 'Buddhist') {
        venue = `serene temple grounds at ${data.location}`
      } else {
        venue = `elegant venue at ${data.location}`
      }
    } else {
      // Fallback si pas de location
      venue = data.religiousType === 'Hindu' 
        ? 'temple courtyard with traditional mandap'
        : data.religiousType === 'Christian'
        ? 'chapel altar with cross'
        : data.religiousType === 'Buddhist'
        ? 'serene temple grounds'
        : 'elegant venue'
    }
    
    const florals = data.colors.length > 0 
      ? `${data.colors.join(' and ')} floral arrangements`
      : 'fresh white roses arrangements'
    
    return `${ceremonyType} just before guests arrive, asymmetrical floral arch with slightly uneven positioning,
${florals} with some petals scattered naturally,
wooden cross-back chairs in neat rows with small gaps between some seats,
photographed in ${venue} during golden hour with directional sunlight casting realistic shadows,
documentary wedding photography style, depth of field, some areas in soft focus.`
  },

  reception_ballroom: (data: OnboardingTemplateData) => {
    const colors = data.colors.length > 0 ? data.colors[0] : 'ivory'
    const location = data.location ? `${data.location} ` : ''
    const style = data.themes.includes('luxury') ? 'crystal chandeliers' : 'elegant lighting'
    
    return `Wedding reception hall during final preparations in ${location}ballroom, ballroom space with ${style} visible,
round tables spaced throughout room with slight variations in placement,
tablecloths in ${colors} with natural fabric folds and creases,
chiavari chairs positioned around tables, not perfectly aligned,
photographed at early evening with overhead lights creating varied brightness across room,
professional event photography, wide angle perspective showing authentic venue details.`
  },

  reception_table: (data: OnboardingTemplateData) => {
    const tableColor = data.colors.length > 0 ? data.colors[0] : 'ivory'
    const flowerColors = data.colors.length > 1 ? `${data.colors[0]} and ${data.colors[1]}` : data.colors[0] || 'white'
    const metallic = data.themes.includes('luxury') ? 'gold' : 'silver'
    
    return `Close-up of wedding table moments before dinner service, round table setup with realistic details,
${tableColor} linen table covering with subtle wrinkles and natural texture,
${flowerColors} roses centerpiece with some stems at varying heights,
${metallic} place settings with slight asymmetry and realistic spacing,
captured in elegant venue during golden hour with directional lighting creating depth,
food photography style, macro detail focus, natural imperfections visible.`
  },

  wedding_cake: (data: OnboardingTemplateData) => {
    const cakeColors = data.colors.length > 0 ? data.colors[0] : 'white'
    const flowerDecor = data.colors.length > 0 ? `${data.colors.join(' and ')} roses` : 'white roses'
    const backdrop = data.colors.length > 1 ? data.colors[1] : 'ivory'
    
    return `Wedding cake ready for cutting ceremony, three-tier ${cakeColors} fondant with realistic frosting texture,
fresh ${flowerDecor} decorations with natural stems and slight wilting,
positioned on wooden table surface with visible table edge,
${backdrop} backdrop with natural fabric movement,
photographed in reception venue during evening with side lighting showing texture and depth,
commercial bakery photography style, shallow depth of field highlighting cake details.`
  },

  photo_booth: (data: OnboardingTemplateData) => {
    const backdropColor = data.colors.length > 0 ? data.colors[0] : 'ivory'
    const florals = data.colors.length > 1 ? `${data.colors[1]} floral props` : 'white floral props'
    
    return `Wedding photo area between guest sessions, backdrop setup with visible wear from use,
${florals} with some petals fallen on ground,
${backdropColor} linen backdrop with natural movement and creases,
string lighting equipment visible in frame edges,
captured in reception space at evening with mixed lighting sources creating realistic shadows,
event documentation style, candid between-moments perspective.`
  },

  decorative_details: (data: OnboardingTemplateData) => {
    const flowerColors = data.colors.length > 0 ? `${data.colors[0]} roses` : 'white roses'
    const surfaceColor = data.colors.length > 1 ? data.colors[1] : 'ivory'
    
    return `Wedding detail shot captured during event setup, vintage rings with authentic positioning,
${flowerColors} elements with natural variations in bloom stages,
arranged on ${surfaceColor} linen surface showing fabric texture and folds,
photographed in bridal suite during afternoon with natural window light creating shadows,
detail photography style, macro focus with background elements softly blurred.`
  },

  couple_entrance: (data: OnboardingTemplateData) => {
    const petalColors = data.colors.length > 0 ? `${data.colors[0]} rose petal` : 'rose petal'
    const florals = data.colors.length > 0 ? `${data.colors.join(' and ')} floral arrangements` : 'white floral arrangements'
    const venue = data.environment === 'indoor' ? 'elegant indoor venue' : 'garden venue'
    
    return `Ceremony aisle captured just after final preparations, ${petalColors} aisle with natural outdoor imperfections,
${florals} with some petals scattered on ground,
candle lighting creating pools of light and shadow,
shot in ${venue} during golden hour with directional natural light,
wedding photojournalism style, anticipatory moment before ceremony begins.`
  },

  venue_aerial: (data: OnboardingTemplateData) => {
    const venueType = data.environment === 'outdoor' ? 'garden terrace' : 'ballroom space'
    const florals = data.colors.length > 0 ? `${data.colors.join(' and ')} floral decorations` : 'white floral decorations'
    const location = data.location ? `${data.location} ` : ''
    
    return `Elevated view of wedding venue during final setup, ${location}${venueType} with realistic spacing variations,
${florals} visible from above with natural cluster patterns,
round table arrangement showing practical pathways between seating,
captured in estate grounds during golden hour with overhead natural lighting,
architectural photography perspective, balanced composition showing venue context.`
  },

  lighting_atmosphere: (data: OnboardingTemplateData) => {
    const lightingStyle = data.themes.includes('luxury') ? 'crystal chandelier and ambient lighting' : 'mixed lighting sources'
    const location = data.location ? `${data.location} ` : ''
    
    return `Wedding venue atmosphere captured during transition between day and evening, ${location}reception space with ${lightingStyle},
floral elements partially illuminated creating depth,
table surfaces reflecting ambient light with natural variations,
shot in elegant venue during blue hour with layered lighting from multiple sources,
ambient photography style, capturing authentic lighting transitions.`
  },

  traditions_rituals: (data: OnboardingTemplateData) => {
    const culturalElements = data.religiousType === 'Hindu' 
      ? 'traditional mandap with marigold garlands and sacred fire'
      : data.religiousType === 'Christian'
      ? 'altar with cross and religious symbols'
      : 'authentic ceremonial elements'
    
    const ritualDecor = data.religiousType === 'Hindu'
      ? `${data.colors.join(' and ')} marigold ritual decorations`
      : `${data.colors.join(' and ')} roses ritual decorations` || 'white roses ritual decorations'
    
    const venue = data.religiousType === 'Hindu' ? 'temple courtyard' : 'chapel venue'
    
    return `Traditional ${data.religiousType || 'wedding'} ceremony setup moments before ceremony begins, ${culturalElements},
${ritualDecor} with natural aging and wear,
wooden chairs arranged in traditional pattern with slight irregularities,
captured in ${venue} during afternoon with reverent natural lighting,
documentary wedding photography, cultural authenticity with respectful distance.`
  }
}

// Category weights for selection (higher = more likely to be chosen)
export const CATEGORY_WEIGHTS = {
  ceremony: 1.2,
  reception_ballroom: 1.1,
  reception_table: 1.0,
  wedding_cake: 0.8,
  photo_booth: 0.7,
  decorative_details: 0.9,
  couple_entrance: 0.6,
  venue_aerial: 0.5,
  lighting_atmosphere: 0.8,
  traditions_rituals: 0.7
} as const

export type PromptTemplateFn = (picks: any) => string

// Helper function to extract colors array from colorPalette string
export function extractColorsFromPalette(colorPalette: string): string[] {
  if (!colorPalette) return []
  
  // Handle common palette formats
  const normalized = colorPalette.toLowerCase().replace(/[&+]/g, ' and ')
  const colors = normalized.split(/\s+and\s+|\s*,\s*|\s+/)
    .map(color => color.trim())
    .filter(color => color.length > 0 && !['and', '&', '+'].includes(color))
  
  return colors
}
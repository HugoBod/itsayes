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
    // Base ceremony type - ALL religious options
    let base = 'Wedding ceremony'
    if (data.religiousType === 'Hindu') base = 'Hindu wedding mandap ceremony'
    if (data.religiousType === 'Catholic') base = 'Catholic church wedding ceremony'
    if (data.religiousType === 'Christian (non-Catholic)') base = 'Christian church wedding ceremony'
    if (data.religiousType === 'Jewish') base = 'Jewish chuppah ceremony'
    if (data.religiousType === 'Muslim') base = 'Islamic nikah ceremony'
    if (data.religiousType === 'Buddhist') base = 'Buddhist temple wedding ceremony'
    if (data.religiousType === 'Other') base = 'Traditional wedding ceremony'
    
    // Style variation - ALL 6 theme options
    let style = ''
    if (data.themes.includes('classic')) style = 'classic elegant'
    if (data.themes.includes('modern')) style = 'modern minimalist' 
    if (data.themes.includes('bohemian')) style = 'boho outdoor'
    if (data.themes.includes('luxury')) style = 'luxury grand'
    if (data.themes.includes('rustic')) style = 'rustic barn'
    if (data.themes.includes('minimalist')) style = 'clean minimalist'
    
    // Color integration
    const color = data.colors[0] || 'white'
    
    // Guest count affects setup
    const size = (data.guestCount && data.guestCount < 80) ? 'intimate' : (data.guestCount && data.guestCount > 200) ? 'grand' : ''
    
    // Location if provided
    const loc = data.location ? `in ${data.location}` : ''
    
    return `${size} ${style} ${base} ${loc}, ${color} flowers, guests seated, natural daylight`
  },

  reception_ballroom: (data: OnboardingTemplateData) => {
    // Style mapping - ALL 6 theme options
    let venue = 'Wedding reception ballroom'
    if (data.themes.includes('classic')) venue = 'Classic wedding reception ballroom'
    if (data.themes.includes('modern')) venue = 'Modern wedding reception venue'
    if (data.themes.includes('bohemian')) venue = 'Bohemian wedding reception with vintage decor'
    if (data.themes.includes('luxury')) venue = 'Luxury wedding reception ballroom'
    if (data.themes.includes('rustic')) venue = 'Rustic barn wedding reception'
    if (data.themes.includes('minimalist')) venue = 'Minimalist wedding reception space'
    
    const color1 = data.colors[0] || 'white'
    const color2 = data.colors[1] || 'ivory' 
    
    // Size affects room
    const roomType = (data.guestCount && data.guestCount > 150) ? 'grand ballroom' : 'intimate reception hall'
    
    // Luxury affects details
    const lighting = data.isLuxury ? 'crystal chandeliers' : 'string lights'
    
    const loc = data.location ? `${data.location} ` : ''
    
    return `${venue} ${roomType} ${loc}, ${color1} and ${color2} decor, ${lighting}, round tables, evening indoors`
  },

  reception_table: (data: OnboardingTemplateData) => {
    // ALL 6 theme options for table settings
    let setup = 'Wedding table setting'
    if (data.themes.includes('classic')) setup = 'Classic wedding table with fine china'
    if (data.themes.includes('modern')) setup = 'Modern wedding table with sleek plates'
    if (data.themes.includes('bohemian')) setup = 'Boho wedding table with vintage plates'
    if (data.themes.includes('luxury')) setup = 'Luxury wedding table with crystal'
    if (data.themes.includes('rustic')) setup = 'Rustic wedding table with wooden chargers'
    if (data.themes.includes('minimalist')) setup = 'Minimalist wedding table with simple plates'
    
    const color = data.colors[0] || 'white'
    const flowers = data.isLuxury ? `luxury ${color} centerpiece` : `${color} flower centerpiece`
    
    return `${setup}, ${flowers}, elegant place settings, candlelight, overhead view`
  },

  wedding_cake: (data: OnboardingTemplateData) => {
    // ALL 6 theme options for wedding cakes
    let cakeType = 'Three-tier wedding cake'
    if (data.themes.includes('classic')) cakeType = 'Classic tiered wedding cake with roses'
    if (data.themes.includes('modern')) cakeType = 'Modern geometric wedding cake'
    if (data.themes.includes('bohemian')) cakeType = 'Bohemian naked cake with wildflowers'
    if (data.themes.includes('luxury')) cakeType = 'Luxury fondant wedding cake with gold'
    if (data.themes.includes('rustic')) cakeType = 'Rustic buttercream wedding cake'
    if (data.themes.includes('minimalist')) cakeType = 'Simple clean wedding cake'
    
    const color = data.colors[0] || 'white'
    const tiers = (data.guestCount && data.guestCount > 150) ? 'four-tier' : 'three-tier'
    const luxury = data.isLuxury ? 'with gold details' : 'with fresh flowers'
    
    return `${tiers} ${cakeType}, ${color} decoration ${luxury}, wedding reception background`
  },

  photo_booth: (data: OnboardingTemplateData) => {
    // ALL 6 theme options for photo booths
    let booth = 'Wedding photo booth setup'
    if (data.themes.includes('classic')) booth = 'Classic photo booth with elegant backdrop'
    if (data.themes.includes('modern')) booth = 'Modern photo booth with geometric backdrop'
    if (data.themes.includes('bohemian')) booth = 'Boho photo booth with macrame backdrop'
    if (data.themes.includes('luxury')) booth = 'Luxury photo booth with gold backdrop'
    if (data.themes.includes('rustic')) booth = 'Rustic photo booth with wooden backdrop'
    if (data.themes.includes('minimalist')) booth = 'Simple photo booth with clean backdrop'
    
    const color = data.colors[0] || 'white'
    const props = data.isLuxury ? 'luxury props' : 'fun vintage props'
    
    return `${booth}, ${color} decorations, ${props}, string lights, wedding reception background`
  },

  decorative_details: (data: OnboardingTemplateData) => {
    // ALL religious options for details
    let details = 'Wedding rings and invitation details'
    if (data.religiousType === 'Hindu') details = 'Hindu wedding rings with marigold decorations'
    if (data.religiousType === 'Catholic') details = 'Catholic wedding rings with rosary and Bible'
    if (data.religiousType === 'Christian (non-Catholic)') details = 'Christian wedding rings with Bible and cross'
    if (data.religiousType === 'Jewish') details = 'Jewish wedding rings with tallit and Torah'
    if (data.religiousType === 'Muslim') details = 'Islamic wedding rings with Quran'
    if (data.religiousType === 'Buddhist') details = 'Buddhist wedding rings with lotus flowers'
    if (data.religiousType === 'Other') details = 'Traditional wedding rings and ceremony items'
    
    // ALL 6 theme options for styling
    if (data.themes.includes('classic')) details = 'Classic wedding details with roses'
    if (data.themes.includes('modern')) details = 'Modern wedding invitation and rings'
    if (data.themes.includes('bohemian')) details = 'Boho wedding details with dried flowers'
    if (data.themes.includes('luxury')) details = 'Luxury wedding details with gold accents'
    if (data.themes.includes('rustic')) details = 'Rustic wedding details on wood'
    if (data.themes.includes('minimalist')) details = 'Simple wedding rings and clean stationery'
    
    const color = data.colors[0] || 'white'
    
    return `${details}, ${color} flowers, elegant stationery, macro photography, soft natural lighting`
  },

  couple_entrance: (data: OnboardingTemplateData) => {
    // ALL religious options for aisle
    let aisle = 'Wedding ceremony aisle with flower petals'
    if (data.religiousType === 'Hindu') aisle = 'Hindu wedding aisle with rangoli and marigolds'
    if (data.religiousType === 'Catholic') aisle = 'Catholic church aisle with white petals'
    if (data.religiousType === 'Christian (non-Catholic)') aisle = 'Christian church aisle with rose petals'
    if (data.religiousType === 'Jewish') aisle = 'Jewish wedding aisle under chuppah'
    if (data.religiousType === 'Muslim') aisle = 'Islamic wedding aisle with carpet'
    if (data.religiousType === 'Buddhist') aisle = 'Buddhist temple wedding aisle with lotus petals'
    if (data.religiousType === 'Other') aisle = 'Traditional ceremony aisle with flowers'
    
    // ALL 6 theme options for aisle styling
    if (data.themes.includes('classic')) aisle = 'Classic wedding aisle with roses'
    if (data.themes.includes('modern')) aisle = 'Modern minimalist wedding aisle'
    if (data.themes.includes('bohemian')) aisle = 'Boho wedding aisle with wildflowers'
    if (data.themes.includes('luxury')) aisle = 'Luxury wedding aisle with gold details'
    if (data.themes.includes('rustic')) aisle = 'Rustic wedding aisle with wooden markers'
    if (data.themes.includes('minimalist')) aisle = 'Clean simple wedding aisle'
    
    const color = data.colors[0] || 'white'
    const loc = data.location ? `${data.location} ` : ''
    
    return `${aisle}, ${color} petals, ${loc}ceremony venue, guests seated, natural lighting`
  },

  venue_aerial: (data: OnboardingTemplateData) => {
    // ALL 6 theme options for aerial venue view
    let setting = 'Wedding venue'
    if (data.themes.includes('classic')) setting = 'Classic wedding venue'
    if (data.themes.includes('modern')) setting = 'Contemporary wedding venue'
    if (data.themes.includes('bohemian')) setting = 'Outdoor garden wedding'
    if (data.themes.includes('luxury')) setting = 'Luxury estate wedding venue'
    if (data.themes.includes('rustic')) setting = 'Countryside barn wedding'
    if (data.themes.includes('minimalist')) setting = 'Simple outdoor wedding venue'
    
    const loc = data.location ? `${data.location} ` : ''
    
    return `${setting} ${loc}from above, white tents and tables, guests walking around, natural daylight`
  },

  lighting_atmosphere: (data: OnboardingTemplateData) => {
    // ALL 6 theme options - avoid "glow", "atmosphere" words
    let scene = 'Wedding reception dinner'
    if (data.themes.includes('classic')) scene = 'Classic wedding dinner with elegant lighting'
    if (data.themes.includes('modern')) scene = 'Modern wedding dinner with clean lighting'
    if (data.themes.includes('bohemian')) scene = 'Outdoor wedding dinner with fairy lights'
    if (data.themes.includes('luxury')) scene = 'Luxury wedding dinner with chandeliers'
    if (data.themes.includes('rustic')) scene = 'Barn wedding dinner with candles'
    if (data.themes.includes('minimalist')) scene = 'Simple wedding dinner with soft lighting'
    
    const color = data.colors[0] || 'white'
    const loc = data.location ? `${data.location} ` : ''
    
    return `${scene} ${loc}, ${color} table decorations, guests eating and talking, evening indoors`
  },

  traditions_rituals: (data: OnboardingTemplateData) => {
    // ALL religious ceremony options
    let ritual = 'Traditional wedding ceremony setup'
    if (data.religiousType === 'Hindu') ritual = 'Hindu wedding mandap with sacred fire and marigolds'
    if (data.religiousType === 'Catholic') ritual = 'Catholic wedding altar with crucifix and flowers'
    if (data.religiousType === 'Christian (non-Catholic)') ritual = 'Christian wedding altar with cross and flowers'
    if (data.religiousType === 'Jewish') ritual = 'Jewish chuppah ceremony with tallit'
    if (data.religiousType === 'Muslim') ritual = 'Islamic nikah ceremony setup with Quran'
    if (data.religiousType === 'Buddhist') ritual = 'Buddhist temple ceremony with Buddha statue'
    if (data.religiousType === 'Other') ritual = 'Traditional ceremony setup with cultural elements'
    
    const color = data.colors[0] || 'white'
    const scale = (data.guestCount && data.guestCount < 80) ? 'intimate' : 'traditional'
    const loc = data.location ? `${data.location} ` : ''
    
    return `${scale} ${ritual}, ${color} decorations, ${loc}sacred venue, family gathering, ceremonial lighting`
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
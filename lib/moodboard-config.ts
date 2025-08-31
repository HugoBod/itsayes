// Moodboard Configuration Management
// Environment pools, helper elements, and prompt templates

import type { HelperPools } from './moodboard-categories'

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

// Prompt templates for each category
export const PROMPT_TEMPLATES = {
  ceremony: (picks: any) => `
Outdoor wedding ceremony with a ${picks.subType}${picks.flowers ? ` featuring ${picks.flowers}` : ''},
${picks.chairs ? `${picks.chairs} aligned in perfect rows,` : ''}
${picks.aisleDeco ? `aisle decorated with ${picks.aisleDeco},` : ''}
set in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on the ceremony setup.
  `.trim(),

  reception_ballroom: (picks: any) => `
Wide view of a ${picks.environment} reception showing ${picks.ceilingDecor || 'elegant ceiling'} and styled tables,
${picks.tables ? `${picks.tables} layout,` : ''}
${picks.linens ? `tables dressed in ${picks.linens},` : ''}
${picks.chairs ? `seating with ${picks.chairs},` : ''}
golden ambient glow at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on room ambience.
  `.trim(),

  reception_table: (picks: any) => `
Close-up of a reception table with ${picks.subType},
${picks.linens ? `dressed in ${picks.linens},` : ''}
${picks.flowers ? `featuring ${picks.flowers}` : ''}
${picks.placeSetting ? `with ${picks.placeSetting} place settings` : ''}
set in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on tablescape details.
  `.trim(),

  wedding_cake: (picks: any) => `
Wedding cake display: ${picks.subType},
${picks.flowers ? `accented by ${picks.flowers},` : ''}
${picks.tables ? `set on a ${picks.tables} dessert display,` : ''}
${picks.linens ? `with ${picks.linens} linen styling,` : ''}
in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on the cake.
  `.trim(),

  photo_booth: (picks: any) => `
Photo corner with a ${picks.subType},
${picks.flowers ? `floral touches in ${picks.flowers},` : ''}
${picks.linens ? `styled console with ${picks.linens} runner,` : ''}
${picks.lighting ? `subtle ${picks.lighting} highlights,` : ''}
in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on the photo area.
  `.trim(),

  decorative_details: (picks: any) => `
Wedding detail styling featuring ${picks.subType},
${picks.flowers ? `with ${picks.flowers} accents,` : ''}
${picks.linens ? `arranged on ${picks.linens} surfaces,` : ''}
elegant flat lay composition in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on detailed styling.
  `.trim(),

  couple_entrance: (picks: any) => `
Wedding entrance featuring ${picks.subType},
${picks.flowers ? `with ${picks.flowers} installations,` : ''}
${picks.lighting ? `illuminated with ${picks.lighting},` : ''}
romantic pathway in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on the entrance.
  `.trim(),

  venue_aerial: (picks: any) => `
Aerial view of wedding ${picks.subType},
${picks.flowers ? `with ${picks.flowers} visible from above,` : ''}
${picks.tables ? `${picks.tables} arrangement,` : ''}
captured in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on venue layout.
  `.trim(),

  lighting_atmosphere: (picks: any) => `
Wedding atmosphere featuring ${picks.subType},
${picks.flowers ? `with ${picks.flowers} in soft focus,` : ''}
${picks.tables ? `${picks.tables} subtly illuminated,` : ''}
romantic ambience in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on lighting mood.
  `.trim(),

  traditions_rituals: (picks: any) => `
Wedding ${picks.subType} moment,
${picks.flowers ? `with ${picks.flowers} ceremony elements,` : ''}
${picks.chairs ? `${picks.chairs} arrangement for guests,` : ''}
meaningful tradition in a ${picks.environment} at ${picks.time}. 
Editorial wedding photography, cinematic lighting, ultra high resolution, no people, focus on ceremonial elements.
  `.trim()
} as const

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
// Moodboard Category Configuration System
// Defines all categories, subcategories, element pools, and probability weights
// for the new 3-photo randomized moodboard generation

export type ElementVisibility = 'required' | 'optional'

export interface CategoryConfig {
  name: string
  subcategories: string[]
  visibility: {
    flowers: ElementVisibility
    tables: ElementVisibility
    linens: ElementVisibility
    chairs: ElementVisibility
  }
  probabilities: {
    flowers: number
    tables: number
    linens: number
    chairs: number
  }
  template_key: string
}

export interface GlobalElementPools {
  flowers: string[]
  tables: string[]
  linens: string[]
  chairs: string[]
}

export interface HelperPools {
  environments: string[]
  times: string[]
  aisle_deco: string[]
  ceiling_deco: string[]
  centerpiece_styles: string[]
  place_settings: string[]
  backdrops: string[]
  lighting_options: string[]
}

export interface PhotoConfiguration {
  category: string
  subType: string
  environment: string
  time: string
  elements: {
    flowers?: string
    tables?: string
    linens?: string
    chairs?: string
    flowersSubtle?: boolean
    tablesSubtle?: boolean
    linensSubtle?: boolean
    chairsSubtle?: boolean
  }
  helpers: {
    [key: string]: string // Dynamic helper fields per category
  }
}

export interface RandomizationResult {
  photos: [PhotoConfiguration, PhotoConfiguration, PhotoConfiguration]
  colorPalette: string
  seed: number
  metadata: {
    categoriesSelected: string[]
    generationTime: number
    elementsSelected: number
  }
}

// 10 Wedding Photo Categories with Subcategories
export const WEDDING_CATEGORIES: Record<string, CategoryConfig> = {
  'ceremony': {
    name: 'Ceremony',
    subcategories: [
      'circle floral arch',
      'asymmetrical floral arch', 
      'grounded meadow arch',
      'cross arch',
      'chuppah arch',
      'mandap arch',
      'petal aisle',
      'lantern aisle',
      'candle aisle',
      'greenery runner aisle',
      'fabric drape aisle'
    ],
    visibility: {
      flowers: 'required',
      tables: 'optional',
      linens: 'optional', 
      chairs: 'required'
    },
    probabilities: {
      flowers: 0.90,
      tables: 0.20,
      linens: 0.15,
      chairs: 0.85
    },
    template_key: 'ceremony'
  },

  'reception_ballroom': {
    name: 'Reception / Ballroom',
    subcategories: [
      'panoramic room view',
      'vignette corners',
      'ceiling decor focus',
      'stage backdrop',
      'chandelier ceiling',
      'string lights ceiling',
      'hanging florals ceiling',
      'fabric drape ceiling',
      'floral doorway entrance',
      'staircase entrance',
      'statement sign entrance'
    ],
    visibility: {
      flowers: 'required',
      tables: 'required',
      linens: 'required',
      chairs: 'required'
    },
    probabilities: {
      flowers: 0.80,
      tables: 0.85,
      linens: 0.80,
      chairs: 0.80
    },
    template_key: 'reception_ballroom'
  },

  'reception_table': {
    name: 'Reception Table',
    subcategories: [
      'low compact centerpieces',
      'tall stand centerpieces',
      'bud-vase cluster centerpieces',
      'candles-only centerpieces',
      'mixed greenery centerpieces',
      'silver place settings',
      'gold place settings',
      'modern matte place settings',
      'crystal glassware',
      'round table shape',
      'long banquet table',
      'oval table',
      'mirrored table',
      'marble table'
    ],
    visibility: {
      flowers: 'required',
      tables: 'required', 
      linens: 'required',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.90,
      tables: 1.00,
      linens: 0.90,
      chairs: 0.50
    },
    template_key: 'reception_table'
  },

  'wedding_cake': {
    name: 'Wedding Cake',
    subcategories: [
      '3 tier cake',
      '4 tier cake', 
      '5 tier cake',
      'smooth fondant finish',
      'textured buttercream finish',
      'pressed florals finish',
      'metallic accents finish',
      'dessert table display',
      'cake pedestal display',
      'floral base display',
      'candle ring display'
    ],
    visibility: {
      flowers: 'required',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.70,
      tables: 0.50,
      linens: 0.40,
      chairs: 0.10
    },
    template_key: 'wedding_cake'
  },

  'photo_booth': {
    name: 'Photo Booth / Photo Corner',
    subcategories: [
      'floral wall backdrop',
      'neon sign backdrop',
      'hedge backdrop',
      'fabric drape backdrop',
      'geometric panel backdrop',
      'minimal chic props',
      'fun signs props',
      'vintage props',
      'no props',
      'softbox lighting',
      'string lights lighting',
      'neon glow lighting'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.40,
      tables: 0.25,
      linens: 0.25,
      chairs: 0.20
    },
    template_key: 'photo_booth'
  },

  'decorative_details': {
    name: 'Decorative Details',
    subcategories: [
      'invitation stationery',
      'menu stationery',
      'place card stationery',
      'vow book stationery',
      'candle cluster objects',
      'matchbook objects',
      'favor box objects',
      'napkin ribbon objects',
      'macro ring shot',
      'tray styling rings',
      'soft fabric base rings'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.30,
      tables: 0.10,
      linens: 0.20,
      chairs: 0.05
    },
    template_key: 'decorative_details'
  },

  'couple_entrance': {
    name: 'Couple Entrance', 
    subcategories: [
      'floral install doorway',
      'arch doorway',
      'draped curtain doorway',
      'lantern aisle path',
      'sparkler style path',
      'LED tunnel path',
      'vintage car vehicle',
      'boat vehicle',
      'golf cart vehicle'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.50,
      tables: 0.10,
      linens: 0.15,
      chairs: 0.25
    },
    template_key: 'couple_entrance'
  },

  'venue_aerial': {
    name: 'Venue Aerial / Grounds',
    subcategories: [
      'ceremonial layout aerial',
      'tented reception aerial',
      'terrace aerial',
      'courtyard aerial', 
      'beachfront aerial',
      'rooftop aerial',
      'golden hour time',
      'blue hour time',
      'night lights time',
      'top-down grid composition',
      '45° sweep composition',
      'wide panorama composition'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional', 
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.25,
      tables: 0.35,
      linens: 0.25,
      chairs: 0.30
    },
    template_key: 'venue_aerial'
  },

  'lighting_atmosphere': {
    name: 'Lighting & Atmosphere',
    subcategories: [
      'string lights lighting',
      'chandelier lighting',
      'lantern lighting',
      'candle lighting',
      'neon text lighting',
      'romantic glow mood',
      'modern contrast mood',
      'whimsical fairy-lights mood'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.25,
      tables: 0.20,
      linens: 0.15,
      chairs: 0.15
    },
    template_key: 'lighting_atmosphere'
  },

  'traditions_rituals': {
    name: 'Traditions & Rituals',
    subcategories: [
      'vow exchange ritual',
      'ring signing ritual',
      'unity ceremony ritual',
      'tea ceremony ritual',
      'first dance ritual',
      'cultural dance ritual'
    ],
    visibility: {
      flowers: 'optional',
      tables: 'optional',
      linens: 'optional',
      chairs: 'optional'
    },
    probabilities: {
      flowers: 0.35,
      tables: 0.10,
      linens: 0.10,
      chairs: 0.25
    },
    template_key: 'traditions_rituals'
  }
} as const

// Global Element Pools (randomized mix-ins)
export const GLOBAL_ELEMENT_POOLS: GlobalElementPools = {
  flowers: [
    'white roses',
    'garden roses', 
    'peonies (pastel)',
    'orchids (tropical)',
    'hydrangeas (blue)',
    'lavender + eucalyptus',
    'tulips',
    'wildflower mix',
    'lilies',
    'protea + tropical foliage'
  ],
  tables: [
    'round classic',
    'long banquet wood',
    'oval modern',
    'mirrored top',
    'marble top', 
    'minimalist glass-metal',
    'rustic plank',
    'lounge-height cocktail'
  ],
  linens: [
    'ivory cotton',
    'natural beige linen',
    'deep burgundy velvet',
    'champagne satin',
    'romantic lace',
    'matte black',
    'pastel floral print',
    'navy',
    'bare table + colored runner'
  ],
  chairs: [
    'gold Chiavari',
    'clear ghost chairs',
    'rustic wood with white cushion',
    'black metal minimalist',
    'velvet upholstered (green/blue)',
    'benches',
    'white folding'
  ]
} as const
/**
 * Category Variations Configuration
 * Detailed variations for each wedding category with hero elements and specific options
 */

export interface CategoryVariation {
  hero: string
  variations: {
    [key: string]: string[]
  }
  angle: string
  lighting: string[]
  photographyStyle: string
}

export const CATEGORY_VARIATIONS: Record<string, CategoryVariation> = {
  ceremony: {
    hero: 'altar/arch + aisle + seating',
    variations: {
      archTypes: [
        'asymmetrical floral frame',
        'circular arch', 
        'twin columns',
        'geometric metal frame'
      ],
      seating: [
        'cross-back chairs',
        'acrylic ghost chairs', 
        'rustic benches',
        'chiavari gold chairs'
      ],
      aisleDeco: [
        'rose petals scattered',
        'vintage lanterns',
        'taper candles in glass',
        'eucalyptus garlands'
      ]
    },
    angle: 'wide eye-level shot, aisle centered',
    lighting: ['golden hour', 'soft daylight'],
    photographyStyle: 'Wide shot capturing ceremony grandeur and intimate details'
  },

  reception_ballroom: {
    hero: 'chandeliers + tables layout',
    variations: {
      ceiling: [
        'crystal chandeliers',
        'draped voile fabric',
        'hanging greenery installations',
        'string light canopy'
      ],
      tables: [
        'round tables with linens',
        'long wood farm tables',
        'mirrored cocktail tables',
        'glass-top modern tables'
      ],
      linens: [
        'ivory linen tablecloths',
        'velvet blush runners',
        'metallic accent napkins',
        'textured burlap overlays'
      ]
    },
    angle: 'wide room shot, perspective lines visible',
    lighting: ['candlelit evening', 'golden ambient glow'],
    photographyStyle: 'Wide landscape composition capturing full ballroom atmosphere'
  },

  reception_table: {
    hero: 'tablescape centerpiece',
    variations: {
      tables: [
        'natural wood tables',
        'mirrored surface tables', 
        'glass-top tables',
        'marble-topped tables'
      ],
      linens: [
        'ivory linen base',
        'silk table runners',
        'textured fabric overlays',
        'metallic accent placemats'
      ],
      florals: [
        'white peonies arranged low',
        'blush orchids cascading',
        'ranunculus clusters',
        'eucalyptus greenery only'
      ],
      placeSettings: [
        'gold charger plates with crystal',
        'silver cutlery with cut glass',
        'copper accents with smoked tumblers',
        'minimalist white plates with fluted coupes'
      ]
    },
    angle: '45° angle, shallow focus on centerpiece',
    lighting: ['soft daylight', 'golden hour'],
    photographyStyle: 'Close-up macro shot emphasizing tablescape details and textures'
  },

  wedding_cake: {
    hero: 'cake as central subject',
    variations: {
      styles: [
        'buttercream smooth finish',
        'semi-naked rustic style',
        'sugar flowers cascading',
        'minimalist modern geometric'
      ],
      stands: [
        'marble pedestal base',
        'mirrored circular stand',
        'rustic wood slice',
        'crystal glass platform'
      ],
      accents: [
        'gold metallic brushstrokes',
        'fresh floral arrangements',
        'seasonal fruit styling',
        'ribbon and bow details'
      ]
    },
    angle: 'close-up hero shot, eye-level',
    lighting: ['soft daylight', 'candlelit glow'],
    photographyStyle: 'Hero shot with cake as focal point, elegant negative space around'
  },

  photo_booth: {
    hero: 'backdrop styling',
    variations: {
      backdrops: [
        'floral wall installation',
        'neon sign statement',
        'velvet drape backdrop',
        'minimalist geometric arch'
      ],
      props: [
        'vintage wooden chairs',
        'bohemian Persian rugs',
        'ornate crystal frames',
        'modern acrylic stools'
      ],
      lighting: [
        'warm string lights',
        'subtle neon glow',
        'fairy light curtain',
        'soft spotlight focus'
      ]
    },
    angle: 'straight-on eye-level perspective',
    lighting: ['soft daylight', 'candlelit evening'],
    photographyStyle: 'Square composition showcasing complete photo booth setup'
  },

  decorative_details: {
    hero: 'flat lay of stationery/accessories',
    variations: {
      bases: [
        'ivory linen fabric',
        'handmade paper texture',
        'wooden tray surface',
        'marble flat surface'
      ],
      accents: [
        'wax seals and ribbons',
        'silk ribbon details',
        'calligraphy cards',
        'vintage jewelry pieces'
      ],
      florals: [
        'single stem white roses',
        'dried lavender sprigs',
        'eucalyptus branches',
        'pressed flower petals'
      ]
    },
    angle: 'top-down flat lay perspective',
    lighting: ['diffuse soft daylight'],
    photographyStyle: 'Macro flat lay emphasizing textures and intricate details'
  },

  couple_entrance: {
    hero: 'ceremony aisle setup and decor',
    variations: {
      decor: [
        'white fabric aisle runner',
        'rose petal pathway',
        'floating candles along aisle',
        'floral arch at altar'
      ],
      seating: [
        'white ceremony chairs',
        'wooden cross-back chairs',
        'ghost chairs with sashes',
        'vintage mixed seating'
      ]
    },
    angle: 'view down the prepared aisle toward altar',
    lighting: ['soft natural light', 'romantic candlelight'],
    photographyStyle: 'Portrait composition showing ceremony preparation and aisle styling'
  },

  venue_aerial: {
    hero: 'layout of complete venue',
    variations: {
      vantage: [
        'mezzanine level view',
        'balcony perspective',
        'elevated corner angle',
        'staircase viewpoint'
      ],
      elements: [
        'circular table layout',
        'lounge seating areas',
        'bar corner styling',
        'dance floor setup'
      ]
    },
    angle: 'high vantage but realistic indoor perspective',
    lighting: ['soft daylight', 'golden hour'],
    photographyStyle: 'Portrait aerial showing venue layout relationship and flow'
  },

  lighting_atmosphere: {
    hero: 'ambient lighting and glow',
    variations: {
      elements: [
        'string lights overhead',
        'taper candles clustered',
        'crystal chandeliers',
        'fairy lights in trees'
      ],
      accents: [
        'reflections on crystal glasses',
        'metallic candle holder glow',
        'soft fabric light diffusion',
        'mirror surface reflections'
      ]
    },
    angle: 'mid-shot focusing on glow and bokeh effects',
    lighting: ['candlelit evening', 'twilight blue hour'],
    photographyStyle: 'Landscape composition capturing atmospheric lighting and mood'
  },

  traditions_rituals: {
    hero: 'symbolic ceremonial objects',
    variations: {
      religious: [
        'ornate chalice centerpiece',
        'decorative menorah',
        'chuppah fabric details',
        'prayer book styling'
      ],
      symbolic: [
        'unity sand ceremony jars',
        'handfasting cord ritual',
        'candle lighting setup',
        'cultural artifact display'
      ]
    },
    angle: 'close-up hero shot of symbolic elements',
    lighting: ['soft daylight', 'golden hour'],
    photographyStyle: 'Square hero composition emphasizing cultural significance and beauty'
  }
}

/**
 * Get variation for category with rotation to prevent repetition
 */
export function getCategoryVariation(
  category: string, 
  variationType: string, 
  seed?: number
): string {
  const categoryConfig = CATEGORY_VARIATIONS[category]
  if (!categoryConfig || !categoryConfig.variations[variationType]) {
    return ''
  }
  
  const variations = categoryConfig.variations[variationType]
  const index = seed ? seed % variations.length : Math.floor(Math.random() * variations.length)
  
  return variations[index]
}

/**
 * Get photography specifications for category
 */
export function getCategoryPhotoSpecs(category: string): {
  angle: string
  lighting: string[]
  photographyStyle: string
} {
  const categoryConfig = CATEGORY_VARIATIONS[category]
  if (!categoryConfig) {
    return {
      angle: 'eye-level perspective',
      lighting: ['soft daylight'],
      photographyStyle: 'Editorial wedding photography composition'
    }
  }
  
  return {
    angle: categoryConfig.angle,
    lighting: categoryConfig.lighting,
    photographyStyle: categoryConfig.photographyStyle
  }
}

/**
 * Get random lighting option for category
 */
export function getCategoryLighting(category: string, seed?: number): string {
  const specs = getCategoryPhotoSpecs(category)
  const index = seed ? seed % specs.lighting.length : Math.floor(Math.random() * specs.lighting.length)
  return specs.lighting[index]
}
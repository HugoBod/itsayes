import { WEDDING_CATEGORIES } from './moodboard-categories'
import { generate4ColorPalette } from './color-palette-generator'

interface OnboardingData {
  weddingStage?: {
    stage: string
    location: string
  }
  coupleDetails?: {
    partner1Name: string
    partner2Name: string
    weddingDate?: string
    stillDeciding?: boolean
    budgetValue: number
    currency: string
  }
  guestInfo?: {
    guestCount: number
    internationalGuests: string
    specialRequirements?: object
  }
  weddingStyle?: {
    themes?: string[]
    colorPalette?: string
    inspiration?: string
  }
  experiencesExtras?: {
    ceremonyType: string
    experiences?: string[]
    specialWishes?: string
  }
}

interface MoodboardData {
  source_images: Array<{
    type: string
    url: string
    prompt_used: string
    generation_metadata?: {
      category?: string
      elements_included?: string[]
    }
  }>
  style_guide?: {
    color_palette?: string
  }
}

interface MagazineData {
  slug: string
  title: string
  subtitle: string
  summary: {
    stage: string
    location: string
    date?: string
    budgetCurrency: string
    budgetRangeLabel: string
    guests: number
    ceremony: string
    styles: string[]
    inspirations?: string
  }
  images: Array<{
    url: string
    category: string
    displayTitle: string
  }>
  palette: string[] // 5 HEX values
}

export function transformToMagazineFormat(
  onboardingData: OnboardingData,
  moodboardData?: MoodboardData
): MagazineData {
  const partner1 = onboardingData?.coupleDetails?.partner1Name || ''
  const partner2 = onboardingData?.coupleDetails?.partner2Name || ''
  
  // Create title and subtitle
  const title = partner1 && partner2 ? `${partner1} & ${partner2}` : 'Your Wedding Vision'
  const subtitle = 'The beginning of your story'
  
  // Transform summary data
  const summary = {
    stage: onboardingData?.weddingStage?.stage || 'Planning',
    location: onboardingData?.weddingStage?.location || 'To be decided',
    date: onboardingData?.coupleDetails?.weddingDate || undefined,
    budgetCurrency: onboardingData?.coupleDetails?.currency || 'USD',
    budgetRangeLabel: formatBudget(onboardingData?.coupleDetails?.budgetValue, onboardingData?.coupleDetails?.currency),
    guests: onboardingData?.guestInfo?.guestCount || 0,
    ceremony: onboardingData?.experiencesExtras?.ceremonyType || 'Traditional',
    styles: onboardingData?.weddingStyle?.themes || [],
    inspirations: onboardingData?.weddingStyle?.inspiration || undefined
  }
  
  // Transform images with proper category titles
  const images = transformImages(moodboardData?.source_images || [])
  
  // Generate 5-color palette
  const palette = generatePalette(
    onboardingData?.weddingStyle?.colorPalette || 
    onboardingData?.weddingStyle?.selectedColorPalette ||
    moodboardData?.style_guide?.color_palette
  )
  
  return {
    slug: `${partner1}-${partner2}`.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'wedding-vision',
    title,
    subtitle,
    summary,
    images,
    palette
  }
}

function formatBudget(budgetValue?: number, currency = 'USD'): string {
  if (!budgetValue) return 'Not specified'
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  })
  
  // Create budget ranges
  if (budgetValue <= 10000) return `${formatter.format(budgetValue)} - Small intimate`
  if (budgetValue <= 25000) return `${formatter.format(budgetValue)} - Moderate celebration`
  if (budgetValue <= 50000) return `${formatter.format(budgetValue)} - Grand celebration`
  if (budgetValue <= 100000) return `${formatter.format(budgetValue)} - Luxury experience`
  return `${formatter.format(budgetValue)} - Ultra-luxury`
}

function transformImages(sourceImages: MoodboardData['source_images']): Array<{
  url: string
  category: string
  displayTitle: string
}> {
  return sourceImages.slice(0, 3).map(img => {
    const category = img.generation_metadata?.category || img.type || 'decorative_details'
    const displayTitle = getCategoryDisplayTitle(category)
    
    return {
      url: img.url,
      category,
      displayTitle
    }
  })
}

function getCategoryDisplayTitle(category: string): string {
  // Use the WEDDING_CATEGORIES mapping for proper titles
  return WEDDING_CATEGORIES[category]?.name || 
         category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function generatePalette(colorPaletteName?: string): string[] {
  if (!colorPaletteName) {
    // Default wedding palette
    return ['#F8F8FF', '#E6E6FA', '#DDA0DD', '#9370DB', '#8B7D6B']
  }
  
  try {
    // Use your existing color palette generator
    const palette = generate4ColorPalette(colorPaletteName)
    const hexColors = palette.map(color => color.hex)
    
    // Pad to 5 colors if needed
    while (hexColors.length < 5) {
      hexColors.push('#F5F5F5') // Light gray fallback
    }
    
    return hexColors.slice(0, 5)
  } catch (error) {
    console.warn('Error generating palette:', error)
    // Fallback palette
    return ['#F8F8FF', '#E6E6FA', '#DDA0DD', '#9370DB', '#8B7D6B']
  }
}

export type { MagazineData, OnboardingData, MoodboardData }
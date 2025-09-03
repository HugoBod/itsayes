export interface OnboardingTemplateData {
  // Ceremony details
  ceremonyType: 'religious' | 'civil' | 'outdoor'
  religiousType?: 'Catholic' | 'Christian (non-Catholic)' | 'Muslim' | 'Jewish' | 'Hindu' | 'Buddhist' | 'Other'
  
  // Style & aesthetics
  colorPalette: string
  colors: string[]
  themes: string[]
  style?: string
  
  // Location & environment
  location: string
  environment: string
  venue?: string
  
  // User context for personalization
  budget?: number
  guestCount?: number
  inspiration?: string
  
  // Computed context flags
  isLuxury?: boolean
  isIntimate?: boolean
  isLarge?: boolean
  
  // Additional context
  season?: string
  timeOfDay?: string
  formality?: string
}

export type DynamicTemplate = (data: OnboardingTemplateData) => string
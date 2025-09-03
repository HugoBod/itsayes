export interface OnboardingTemplateData {
  // Ceremony details
  ceremonyType: 'religious' | 'civil' | 'outdoor'
  religiousType?: 'Hindu' | 'Christian' | 'Jewish' | 'Muslim' | 'Buddhist'
  
  // Style & aesthetics
  colorPalette: string
  colors: string[]
  themes: string[]
  style: string
  
  // Location & environment
  location: string
  environment: string
  venue?: string
  
  // Additional context
  season?: string
  timeOfDay?: string
  guestCount?: number
  formality?: string
}

export type DynamicTemplate = (data: OnboardingTemplateData) => string
export interface AnonymizedProjectData {
  // Basic project info (safe to show)
  id: string
  name: string
  description?: string
  featured_image_url?: string
  created_at: string
  likes_count: number
  views_count: number

  // Anonymized personal data
  wedding_date_season?: string // "Summer 2024" instead of exact date
  location_region?: string // "Paris, France" instead of exact venue
  guest_count?: number // Keep guest count as it's not personal
  style_preferences?: string // Safe to show wedding styles
  ceremony_type?: string // Safe to show ceremony type
}

interface ProjectData {
  id: string
  name: string
  description: string | null
  public_id?: string
  featured_image_url?: string
  wedding_date: string | null
  created_at: string
  likes_count: number
  views_count: number
  style_preferences: string | null
  partner1_name?: string
  partner2_name?: string
  location?: string
  guest_count?: number
  ceremony_type?: string

  // Potentially additional fields from community_projects view
  [key: string]: any
}

/**
 * Anonymizes project data for public display
 * Removes or transforms personal information while preserving inspiration value
 */
export function anonymizeProjectData(projectData: ProjectData): AnonymizedProjectData {
  // Helper function to convert exact date to season
  const getSeasonFromDate = (dateString?: string): string => {
    if (!dateString) return 'TBD'

    try {
      const date = new Date(dateString)
      const month = date.getMonth() + 1 // getMonth() returns 0-11
      const year = date.getFullYear()

      let season: string
      if (month >= 3 && month <= 5) {
        season = 'Spring'
      } else if (month >= 6 && month <= 8) {
        season = 'Summer'
      } else if (month >= 9 && month <= 11) {
        season = 'Autumn'
      } else {
        season = 'Winter'
      }

      return `${season} ${year}`
    } catch {
      return 'TBD'
    }
  }

  // Helper function to anonymize project name
  const getAnonymizedName = (originalName: string, partners?: { partner1?: string; partner2?: string }): string => {
    // If name contains partner names, replace with generic
    const hasPersonalNames = partners?.partner1 || partners?.partner2

    if (hasPersonalNames) {
      const name1 = partners?.partner1?.toLowerCase() || ''
      const name2 = partners?.partner2?.toLowerCase() || ''
      const lowerName = originalName.toLowerCase()

      if (name1 && lowerName.includes(name1) || name2 && lowerName.includes(name2)) {
        return 'A Beautiful Wedding'
      }
    }

    // Otherwise keep the original name if it's generic
    return originalName
  }

  // Helper function to extract region from full location
  const getLocationRegion = (fullLocation?: string): string => {
    if (!fullLocation) return 'Beautiful Location'

    // Try to extract city/region (keep last 2 parts after comma)
    const parts = fullLocation.split(',').map(part => part.trim())

    if (parts.length >= 2) {
      // Return last 2 parts (e.g., "Paris, France" from "Venue Name, 123 Street, Paris, France")
      return parts.slice(-2).join(', ')
    } else if (parts.length === 1) {
      // Single location, keep as is if it seems like a city/region
      return parts[0]
    }

    return 'Beautiful Location'
  }

  return {
    // Basic identifiers (safe)
    id: projectData.id,
    name: getAnonymizedName(projectData.name, {
      partner1: projectData.partner1_name,
      partner2: projectData.partner2_name
    }),
    description: projectData.description || 'A beautiful wedding celebration',
    featured_image_url: projectData.featured_image_url,
    created_at: projectData.created_at,

    // Engagement metrics (safe)
    likes_count: projectData.likes_count || 0,
    views_count: projectData.views_count || 0,

    // Anonymized personal data
    wedding_date_season: getSeasonFromDate(projectData.wedding_date || undefined),
    location_region: getLocationRegion(projectData.location),
    guest_count: typeof projectData.guest_count === 'number' ? projectData.guest_count : undefined,
    ceremony_type: projectData.ceremony_type || undefined,
    style_preferences: projectData.style_preferences || undefined,
  }
}

/**
 * Anonymize onboarding data for public magazine display
 */
export function anonymizeOnboardingData(onboardingData: any): any {
  if (!onboardingData) return {}

  const anonymized = { ...onboardingData }

  // Anonymize couple details
  if (anonymized.coupleDetails) {
    anonymized.coupleDetails = {
      ...anonymized.coupleDetails,
      partner1Name: 'Partner',
      partner2Name: 'Partner',
      // Keep wedding date season only
      weddingDate: anonymized.coupleDetails.weddingDate
        ? getSeasonFromWeddingDate(anonymized.coupleDetails.weddingDate)
        : undefined,
      // Keep budget range but not exact amount (handled in UI)
    }
  }

  // Wedding stage location can be regionalized
  if (anonymized.weddingStage) {
    anonymized.weddingStage = {
      ...anonymized.weddingStage,
      // Keep location if it's already a region/city level
      location: regionalizeLoc(anonymized.weddingStage.location)
    }
  }

  // Keep style preferences, guest info (anonymized), experiences as they're not personal

  return anonymized
}

// Helper functions for onboarding data anonymization
function getSeasonFromWeddingDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    let season: string
    if (month >= 3 && month <= 5) season = 'Spring'
    else if (month >= 6 && month <= 8) season = 'Summer'
    else if (month >= 9 && month <= 11) season = 'Autumn'
    else season = 'Winter'

    return `${season} ${year}`
  } catch {
    return 'TBD'
  }
}

function regionalizeLoc(location?: string): string {
  if (!location) return 'Beautiful Location'

  // Split by comma and take city/region level info
  const parts = location.split(',').map(p => p.trim())

  // Return last 1-2 parts (city, region/country)
  if (parts.length >= 2) {
    return parts.slice(-2).join(', ')
  }

  return parts[0] || 'Beautiful Location'
}

/**
 * Check if project data contains any personal information that should be filtered
 */
export function hasPersonalInformation(projectData: any): boolean {
  const personalFields = [
    'partner1_name', 'partner2_name',
    'exact_venue_address', 'personal_notes',
    'vendor_contacts', 'budget_breakdown'
  ]

  return personalFields.some(field => projectData[field] && projectData[field].trim() !== '')
}

/**
 * Validate that anonymized data doesn't contain personal info
 */
export function validateAnonymization(anonymizedData: AnonymizedProjectData): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check for common personal identifiers
  const dataString = JSON.stringify(anonymizedData).toLowerCase()

  // Check for email patterns
  if (dataString.includes('@') && dataString.includes('.')) {
    warnings.push('Possible email address detected')
  }

  // Check for phone number patterns
  if (/\d{3,}[-\s]\d{3,}/.test(dataString)) {
    warnings.push('Possible phone number detected')
  }

  // Check for specific venue addresses (multiple numbers)
  if (/\d+\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln)/i.test(dataString)) {
    warnings.push('Possible specific address detected')
  }

  return {
    isValid: warnings.length === 0,
    warnings
  }
}
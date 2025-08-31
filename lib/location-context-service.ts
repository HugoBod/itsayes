import { WebFetch, WebSearch } from '@/lib/web-services'

interface LocationContext {
  name: string
  architecture_style: string
  cultural_elements: string[]
  climate: string
  popular_venues: string[]
  local_traditions: string[]
  description: string
  search_keywords: string[]
  cached_at: string
}

interface CacheEntry {
  data: LocationContext
  timestamp: number
  expires_at: number
}

class LocationContextService {
  private cache = new Map<string, CacheEntry>()
  private readonly CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days
  
  /**
   * Normalizes location string for consistent caching
   */
  private normalizeLocation(location: string): string {
    return location
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
  }

  /**
   * Checks if cached data is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expires_at
  }

  /**
   * Gets location context from cache if available and valid
   */
  private getCachedContext(location: string): LocationContext | null {
    const normalized = this.normalizeLocation(location)
    const entry = this.cache.get(normalized)
    
    if (entry && this.isCacheValid(entry)) {
      console.log(`✅ Cache hit for location: ${location}`)
      return entry.data
    }
    
    // Remove expired entry
    if (entry) {
      this.cache.delete(normalized)
      console.log(`🗑️ Expired cache entry removed for: ${location}`)
    }
    
    return null
  }

  /**
   * Caches location context data
   */
  private setCachedContext(location: string, context: LocationContext): void {
    const normalized = this.normalizeLocation(location)
    const now = Date.now()
    
    this.cache.set(normalized, {
      data: context,
      timestamp: now,
      expires_at: now + this.CACHE_DURATION
    })
    
    console.log(`💾 Cached context for location: ${location}`)
  }

  /**
   * Extracts location context from Wikipedia API
   */
  private async fetchWikipediaContext(location: string): Promise<Partial<LocationContext>> {
    try {
      // Search for location on Wikipedia
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location)}`
      const response = await fetch(searchUrl)
      
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return {
        description: data.extract || `${location} is a beautiful wedding destination.`,
        search_keywords: [location, data.title].filter(Boolean)
      }
    } catch (error) {
      console.warn(`Failed to fetch Wikipedia data for ${location}:`, error)
      return {
        description: `${location} offers unique wedding opportunities.`,
        search_keywords: [location]
      }
    }
  }

  /**
   * Uses WebFetch to get venue-specific information
   */
  private async fetchVenueContext(location: string): Promise<Partial<LocationContext>> {
    try {
      // Search for wedding venues in the location
      const venueQuery = `${location} wedding venues architecture style characteristics`
      
      // Try to fetch from a wedding-focused site
      const weddingWireUrl = `https://www.weddingwire.com/wedding-venues/${encodeURIComponent(location.toLowerCase())}`
      
      const venueData = await WebFetch.fetch(weddingWireUrl, 
        `Extract architectural styles, popular venue types, and local wedding characteristics for ${location}. Focus on:
        - Architectural styles (Gothic, Modern, Colonial, etc.)
        - Popular venue types (Châteaux, Beaches, Gardens, etc.) 
        - Local cultural elements
        - Climate considerations
        Return in structured format.`)
      
      // Parse the response to extract structured data
      const architectureMatch = venueData.match(/architectural?\s*style[s]?[:\-]\s*([^.\n]+)/i)
      const venuesMatch = venueData.match(/popular\s*venue[s]?[:\-]\s*([^.\n]+)/i)
      const cultureMatch = venueData.match(/cultural?\s*element[s]?[:\-]\s*([^.\n]+)/i)
      
      return {
        architecture_style: architectureMatch?.[1]?.trim() || 'Classic elegance',
        popular_venues: venuesMatch?.[1]?.split(',').map(v => v.trim()) || ['Traditional venues'],
        cultural_elements: cultureMatch?.[1]?.split(',').map(c => c.trim()) || ['Local traditions']
      }
    } catch (error) {
      console.warn(`Failed to fetch venue data for ${location}:`, error)
      return this.getFallbackVenueData(location)
    }
  }

  /**
   * Provides fallback venue data based on known locations
   */
  private getFallbackVenueData(location: string): Partial<LocationContext> {
    const locationLower = location.toLowerCase()
    
    // European locations
    if (locationLower.includes('paris') || locationLower.includes('france')) {
      return {
        architecture_style: 'Haussmann elegance and Gothic cathedrals',
        popular_venues: ['Châteaux', 'Historic mansions', 'Seine riverboats'],
        cultural_elements: ['French sophistication', 'Wine culture', 'Haute cuisine'],
        climate: 'temperate'
      }
    }
    
    if (locationLower.includes('tuscany') || locationLower.includes('italy')) {
      return {
        architecture_style: 'Renaissance villas and rustic farmhouses',
        popular_venues: ['Vineyard estates', 'Historic villas', 'Olive groves'],
        cultural_elements: ['Italian romance', 'Wine traditions', 'Mediterranean lifestyle'],
        climate: 'mediterranean'
      }
    }
    
    if (locationLower.includes('bali') || locationLower.includes('indonesia')) {
      return {
        architecture_style: 'Traditional Balinese temples and tropical pavilions',
        popular_venues: ['Clifftop venues', 'Beach resorts', 'Rice terrace locations'],
        cultural_elements: ['Balinese ceremonies', 'Tropical flowers', 'Spiritual traditions'],
        climate: 'tropical'
      }
    }
    
    // US locations
    if (locationLower.includes('miami') || locationLower.includes('florida')) {
      return {
        architecture_style: 'Art Deco and modern beachfront',
        popular_venues: ['Beach clubs', 'Rooftop terraces', 'Historic hotels'],
        cultural_elements: ['Latin influence', 'Beach culture', 'Vibrant nightlife'],
        climate: 'tropical'
      }
    }
    
    if (locationLower.includes('napa') || locationLower.includes('california')) {
      return {
        architecture_style: 'Wine country estates and modern pavilions',
        popular_venues: ['Vineyards', 'Ranch estates', 'Garden venues'],
        cultural_elements: ['Wine culture', 'Farm-to-table', 'Outdoor lifestyle'],
        climate: 'mediterranean'
      }
    }
    
    // Generic fallback
    return {
      architecture_style: 'Local architectural charm',
      popular_venues: ['Traditional venues', 'Local landmarks'],
      cultural_elements: ['Regional traditions', 'Local customs'],
      climate: 'seasonal'
    }
  }

  /**
   * Combines multiple data sources to create comprehensive location context
   */
  private async aggregateLocationContext(location: string): Promise<LocationContext> {
    console.log(`🔍 Fetching context for location: ${location}`)
    
    try {
      // Fetch from multiple sources in parallel
      const [wikiData, venueData] = await Promise.all([
        this.fetchWikipediaContext(location),
        this.fetchVenueContext(location)
      ])
      
      // Combine all data sources
      const context: LocationContext = {
        name: location,
        architecture_style: venueData.architecture_style || 'Classic elegance',
        cultural_elements: venueData.cultural_elements || ['Local traditions'],
        climate: venueData.climate || 'seasonal',
        popular_venues: venueData.popular_venues || ['Traditional venues'],
        local_traditions: venueData.cultural_elements || ['Regional customs'],
        description: wikiData.description || `${location} offers beautiful wedding opportunities`,
        search_keywords: [
          location,
          ...(venueData.popular_venues || []),
          venueData.architecture_style || 'classic'
        ].filter(Boolean),
        cached_at: new Date().toISOString()
      }
      
      console.log(`✅ Successfully aggregated context for ${location}`)
      return context
    } catch (error) {
      console.error(`Failed to aggregate context for ${location}:`, error)
      
      // Ultimate fallback
      return {
        name: location,
        architecture_style: 'Classic elegance',
        cultural_elements: ['Local traditions'],
        climate: 'seasonal',
        popular_venues: ['Beautiful venues'],
        local_traditions: ['Regional customs'],
        description: `${location} is a wonderful place for weddings`,
        search_keywords: [location, 'elegant', 'romantic'],
        cached_at: new Date().toISOString()
      }
    }
  }

  /**
   * Main method to get location context with caching
   */
  async getLocationContext(location: string): Promise<LocationContext> {
    if (!location || location.trim().length === 0) {
      throw new Error('Location is required')
    }
    
    // Check cache first
    const cached = this.getCachedContext(location)
    if (cached) {
      return cached
    }
    
    // Fetch fresh data
    const startTime = Date.now()
    const context = await this.aggregateLocationContext(location)
    const duration = Date.now() - startTime
    
    console.log(`⏱️ Location context fetched in ${duration}ms`)
    
    // Cache the result
    this.setCachedContext(location, context)
    
    return context
  }

  /**
   * Pre-populate cache with popular wedding destinations
   */
  async prePopulateCache(): Promise<void> {
    const popularDestinations = [
      'Paris, France',
      'Tuscany, Italy', 
      'Bali, Indonesia',
      'Napa Valley, California',
      'Miami, Florida',
      'Santorini, Greece',
      'Provence, France',
      'Amalfi Coast, Italy'
    ]
    
    console.log('🚀 Pre-populating location cache...')
    
    const promises = popularDestinations.map(location => 
      this.getLocationContext(location).catch(error => 
        console.warn(`Failed to pre-cache ${location}:`, error)
      )
    )
    
    await Promise.allSettled(promises)
    console.log(`✅ Pre-populated cache with ${popularDestinations.length} locations`)
  }

  /**
   * Clear expired entries from cache
   */
  clearExpiredCache(): void {
    const now = Date.now()
    let cleared = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expires_at) {
        this.cache.delete(key)
        cleared++
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`)
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[]; oldest?: string } {
    const entries = Array.from(this.cache.keys())
    let oldest: string | undefined
    let oldestTimestamp = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldest = key
      }
    }
    
    return {
      size: this.cache.size,
      entries,
      oldest
    }
  }
}

// Singleton instance
export const locationContextService = new LocationContextService()

// Types export
export type { LocationContext }
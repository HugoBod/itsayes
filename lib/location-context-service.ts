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
   * Uses internet search and web scraping to get real venue information
   */
  private async fetchVenueContext(location: string): Promise<Partial<LocationContext>> {
    console.log(`🔍 Searching internet for wedding venue information: ${location}`)
    
    try {
      // First try Wikipedia for basic context
      const wikiResult = await this.fetchFromWikipediaPlaces(location)
      
      // Then search the web for wedding-specific information
      const webResult = await this.searchWeddingVenues(location)
      
      // Combine both sources
      const combined = {
        architecture_style: webResult.architecture_style || wikiResult.architecture_style || 'Contemporary elegance',
        popular_venues: webResult.popular_venues || wikiResult.popular_venues || ['Modern venues'],
        cultural_elements: [...(webResult.cultural_elements || []), ...(wikiResult.cultural_elements || [])].slice(0, 4),
        climate: webResult.climate || wikiResult.climate || 'seasonal',
        description: wikiResult.description || `${location} offers beautiful wedding opportunities.`,
        search_keywords: [location, ...(webResult.popular_venues || []).slice(0, 2)].filter(Boolean)
      }
      
      console.log(`✅ Successfully gathered context from internet for ${location}`)
      return combined
      
    } catch (error) {
      console.error(`❌ Failed to fetch venue data for ${location}:`, error)
      throw new Error(`Could not find wedding information for ${location}. Please check the location name.`)
    }
  }

  /**
   * Search the web specifically for wedding venue information
   */
  private async searchWeddingVenues(location: string): Promise<Partial<LocationContext>> {
    try {
      // Use WebSearch to find wedding venue information
      const searchQuery = `${location} wedding venues architectural style popular venue types`
      console.log(`🔍 Web searching: ${searchQuery}`)
      
      const searchResult = await WebSearch.search(searchQuery)
      
      if (!searchResult.success || !searchResult.results) {
        throw new Error('Web search failed')
      }
      
      const searchResults = searchResult.results
      
      // Extract wedding venue information from search results
      let combinedContent = ''
      if (searchResults.length > 0) {
        for (const result of searchResults.slice(0, 3)) { // Use top 3 results
          try {
            const pageContent = await WebFetch.fetch(result.url, 
              `Extract wedding venue information for ${location}. Focus on:
              - Specific architectural styles popular for weddings
              - Types of wedding venues (gardens, ballrooms, etc.)
              - Cultural elements that influence local weddings
              - Climate and seasonal considerations
              Return structured information.`)
            combinedContent += pageContent + '\n'
          } catch (fetchError) {
            console.warn(`Failed to fetch ${result.url}:`, fetchError)
            continue
          }
        }
      }
      
      if (!combinedContent) {
        throw new Error('No web content retrieved')
      }
      
      // Parse the combined content
      return this.parseWeddingVenueContent(combinedContent, location)
      
    } catch (error) {
      console.warn(`Web search failed for ${location}:`, error)
      throw error
    }
  }

  /**
   * Parse wedding venue content from web search results
   */
  private parseWeddingVenueContent(content: string, location: string): Partial<LocationContext> {
    const lowerContent = content.toLowerCase()
    
    // Extract architecture styles
    const architectureKeywords = [
      'victorian', 'art deco', 'colonial', 'modern', 'contemporary', 'historic', 
      'gothic', 'baroque', 'mediterranean', 'rustic', 'industrial', 'classical'
    ]
    const foundArchStyles = architectureKeywords.filter(style => lowerContent.includes(style))
    const architecture_style = foundArchStyles.length > 0 
      ? `${foundArchStyles.slice(0, 2).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' and ')} architecture`
      : 'Contemporary elegance'
    
    // Extract venue types
    const venueKeywords = [
      'garden', 'ballroom', 'beach', 'rooftop', 'vineyard', 'castle', 'mansion', 
      'loft', 'barn', 'hotel', 'resort', 'museum', 'gallery', 'estate'
    ]
    const foundVenues = venueKeywords.filter(venue => lowerContent.includes(venue))
    const popular_venues = foundVenues.length > 0 
      ? foundVenues.slice(0, 4).map(v => `${v.charAt(0).toUpperCase() + v.slice(1)} venues`)
      : ['Traditional venues']
    
    // Extract cultural elements
    const culturalKeywords = [
      'wine', 'culinary', 'artistic', 'historic', 'tradition', 'heritage', 
      'local', 'regional', 'cultural', 'sophisticated', 'elegant'
    ]
    const foundCultural = culturalKeywords.filter(culture => lowerContent.includes(culture))
    const cultural_elements = foundCultural.length > 0 
      ? foundCultural.slice(0, 3).map(c => `${c.charAt(0).toUpperCase() + c.slice(1)} traditions`)
      : ['Local traditions']
    
    // Determine climate
    let climate = 'seasonal'
    if (lowerContent.includes('tropical') || lowerContent.includes('humid')) climate = 'tropical'
    else if (lowerContent.includes('mediterranean') || lowerContent.includes('dry')) climate = 'mediterranean'
    else if (lowerContent.includes('temperate') || lowerContent.includes('four season')) climate = 'temperate'
    
    return {
      architecture_style,
      popular_venues,
      cultural_elements,
      climate
    }
  }

  /**
   * Fetch context from Wikipedia Places API (more reliable)
   */
  private async fetchFromWikipediaPlaces(location: string): Promise<Partial<LocationContext>> {
    try {
      // Search for the location page
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(location)}`
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Wedding-Planning-App/1.0',
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Extract relevant information from the description
      const description = data.extract || ''
      const title = data.title || location
      
      // Parse architectural and cultural elements from the description
      const context = this.parseLocationDescription(description)
      
      return {
        ...context,
        description: description || `${location} offers unique wedding opportunities.`,
        search_keywords: [location, title, ...context.popular_venues?.slice(0, 2) || []].filter(Boolean)
      }
    } catch (error) {
      console.warn(`Wikipedia Places API failed for ${location}:`, error)
      throw error
    }
  }

  /**
   * Try multiple web sources with WebFetch
   */
  private async fetchFromMultipleSources(location: string): Promise<Partial<LocationContext>> {
    const sources = [
      `https://www.theknot.com/wedding-venues/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}`,
      `https://www.weddingwire.com/wedding-venues/${encodeURIComponent(location.toLowerCase())}`
    ]
    
    for (const url of sources) {
      try {
        const venueData = await WebFetch.fetch(url, 
          `Extract wedding venue information for ${location}. Focus on:
          - Main architectural styles (be specific, e.g. "Victorian mansions" not "classic")
          - 3-4 popular venue types 
          - Local cultural elements that influence weddings
          - Climate/seasonal considerations
          Format as: Architecture: X. Venues: A, B, C. Culture: D, E.`)
        
        const parsed = this.parseVenueWebData(venueData)
        if (parsed.architecture_style && parsed.architecture_style !== 'Classic elegance') {
          return parsed
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error instanceof Error ? error.message : String(error))
        continue
      }
    }
    
    throw new Error('All web sources failed')
  }

  /**
   * Parse location description to extract wedding-relevant context
   */
  private parseLocationDescription(description: string): Partial<LocationContext> {
    const desc = description.toLowerCase()
    
    // Architecture detection
    let architecture_style = 'Classic elegance'
    if (desc.includes('art deco')) architecture_style = 'Art Deco elegance and modern sophistication'
    else if (desc.includes('victorian')) architecture_style = 'Victorian grandeur and historic charm'
    else if (desc.includes('colonial')) architecture_style = 'Colonial architecture and traditional elegance'
    else if (desc.includes('gothic')) architecture_style = 'Gothic cathedrals and medieval charm'
    else if (desc.includes('modern')) architecture_style = 'Contemporary design and modern sophistication'
    else if (desc.includes('baroque')) architecture_style = 'Baroque opulence and classical beauty'
    
    // Venue types based on description
    const popular_venues = []
    if (desc.includes('beach') || desc.includes('coast')) popular_venues.push('Beachfront venues')
    if (desc.includes('mountain') || desc.includes('hill')) popular_venues.push('Mountain venues')
    if (desc.includes('garden') || desc.includes('park')) popular_venues.push('Garden venues')
    if (desc.includes('castle') || desc.includes('palace')) popular_venues.push('Historic castles')
    if (desc.includes('museum') || desc.includes('gallery')) popular_venues.push('Cultural venues')
    if (desc.includes('hotel') || desc.includes('resort')) popular_venues.push('Luxury hotels')
    
    // Default venues if none detected
    if (popular_venues.length === 0) {
      popular_venues.push('Traditional venues', 'Historic locations')
    }
    
    // Cultural elements
    const cultural_elements = ['Local traditions']
    if (desc.includes('wine') || desc.includes('vineyard')) cultural_elements.push('Wine culture')
    if (desc.includes('art') || desc.includes('cultural')) cultural_elements.push('Artistic heritage')
    if (desc.includes('historic') || desc.includes('heritage')) cultural_elements.push('Historic traditions')
    
    // Climate detection
    let climate = 'seasonal'
    if (desc.includes('tropical') || desc.includes('humid')) climate = 'tropical'
    else if (desc.includes('mediterranean')) climate = 'mediterranean'
    else if (desc.includes('desert') || desc.includes('arid')) climate = 'arid'
    else if (desc.includes('temperate')) climate = 'temperate'
    
    return {
      architecture_style,
      popular_venues,
      cultural_elements,
      climate
    }
  }

  /**
   * Parse web data from venue sites
   */
  private parseVenueWebData(webData: string): Partial<LocationContext> {
    // Enhanced parsing of web data
    const architectureMatch = webData.match(/architect[ural]*[:\-\s]([^.\n]{10,80})/i)
    const venuesMatch = webData.match(/venue[s]*[:\-\s]([^.\n]{10,100})/i) || 
                       webData.match(/popular[:\-\s]([^.\n]{10,100})/i)
    const cultureMatch = webData.match(/cultur[al]*[:\-\s]([^.\n]{10,80})/i) ||
                        webData.match(/tradition[s]*[:\-\s]([^.\n]{10,80})/i)
    
    return {
      architecture_style: architectureMatch?.[1]?.trim() || 'Classic elegance',
      popular_venues: venuesMatch?.[1]?.split(/[,&]/).map(v => v.trim()).filter(v => v.length > 3) || ['Traditional venues'],
      cultural_elements: cultureMatch?.[1]?.split(/[,&]/).map(c => c.trim()).filter(c => c.length > 3) || ['Local traditions']
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
   * Main method to get location context - uses existing wedding_location from onboarding
   */
  async getLocationContext(location: string): Promise<LocationContext> {
    if (!location || location.trim().length === 0) {
      throw new Error('Location is required')
    }
    
    // 1. Check memory cache first
    const cached = this.getCachedContext(location)
    if (cached) {
      console.log(`✅ Using cached location context for ${location}`)
      return cached
    }
    
    // 2. Fetch fresh data from internet using the wedding_location
    console.log(`🔍 Fetching fresh location context from internet: ${location}`)
    const startTime = Date.now()
    const context = await this.aggregateLocationContext(location)
    const duration = Date.now() - startTime
    
    console.log(`⏱️ Location context fetched in ${duration}ms`)
    
    // 3. Cache the result in memory only
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
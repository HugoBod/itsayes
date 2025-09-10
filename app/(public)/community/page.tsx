'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { communityService, type CommunityProject, type FilterType, type StyleFilter, WEDDING_STYLES, FILTER_OPTIONS } from '@/lib/community'

// Dynamic imports for heavy community components
const ProjectCard = dynamic(
  () => import('@/components/landing/ProjectCard').then(mod => ({ default: mod.ProjectCard })),
  { 
    loading: () => (
      <div className="animate-pulse">
        <div className="bg-neutral-200 rounded-lg aspect-[4/3]"></div>
        <div className="mt-4 space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    ssr: false 
  }
)

const ProjectFilters = dynamic(
  () => import('@/components/ui/project-filters').then(mod => ({ default: mod.ProjectFilters })),
  { 
    loading: () => (
      <div className="animate-pulse">
        <div className="flex gap-4">
          <div className="h-10 bg-neutral-200 rounded w-24"></div>
          <div className="h-10 bg-neutral-200 rounded w-32"></div>
          <div className="h-10 bg-neutral-200 rounded w-28"></div>
        </div>
      </div>
    ),
    ssr: false 
  }
)

// Helper function to extract style from preferences JSON
function extractStyleFromPreferences(stylePreferences: string | null): string {
  if (!stylePreferences) return 'Classic'
  
  try {
    const parsed = JSON.parse(stylePreferences)
    if (parsed.themes && parsed.themes.length > 0) {
      return parsed.themes[0]
    }
    if (parsed.style) {
      return parsed.style
    }
  } catch {
    // If parsing fails, try to find style keywords in the string
    const styles = ['Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage', 'Industrial', 'Romantic', 'Minimalist', 'Luxury']
    for (const style of styles) {
      if (stylePreferences.toLowerCase().includes(style.toLowerCase())) {
        return style
      }
    }
  }
  
  return 'Classic'
}

export default function CommunityPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Popular')
  const [selectedStyle, setSelectedStyle] = useState<StyleFilter>('All')
  const [projects, setProjects] = useState<CommunityProject[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async (reset = false) => {
    setLoading(true)
    setError(null)
    
    try {
      const offset = reset ? 0 : projects.length
      const result = await communityService.getPublicProjects(
        selectedFilter,
        selectedStyle,
        12, // limit
        offset
      )
      
      if (result.error) {
        setError(result.error)
        setProjects([])
        setHasMore(false)
        return
      }
      
      setProjects(reset ? result.projects : [...projects, ...result.projects])
      setHasMore(result.hasMore)
      
    } catch (error) {
      console.error('Error loading projects:', error)
      setError('Failed to load community projects')
      setProjects([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [selectedFilter, selectedStyle, projects.length])

  const loadMore = useCallback(() => {
    fetchProjects(false)
  }, [fetchProjects])

  useEffect(() => {
    fetchProjects(true)
  }, [selectedFilter, selectedStyle, fetchProjects])

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleFilterChange = useCallback((filter: string) => {
    setSelectedFilter(filter as FilterType)
  }, [])

  const handleStyleChange = useCallback((style: string | null) => {
    setSelectedStyle((style || 'All') as StyleFilter)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white from-20% via-primary/60 via-50% to-primary/80">
      <div className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-normal text-foreground mb-3">
            Wedding Community
          </h1>
          <p className="text-base md:text-lg text-warm max-w-3xl mx-auto">
            Discover thousands of real wedding projects. Get inspired by couples from around the world and share your own journey.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <ProjectFilters
            filters={FILTER_OPTIONS}
            styles={WEDDING_STYLES}
            selectedFilter={selectedFilter}
            selectedStyle={selectedStyle}
            onFilterChange={handleFilterChange}
            onStyleChange={handleStyleChange}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 rounded-lg aspect-[4/3]"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
                <Icon name="alertCircle" className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h3>
            <p className="text-warm mb-6">{error}</p>
            <Button onClick={() => fetchProjects(true)} className="bg-primary hover:bg-primary-600 text-white border-0">
              Try Again
            </Button>
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description || ''}
                  date={project.wedding_date || ''}
                  style={extractStyleFromPreferences(project.style_preferences)}
                  guestCount={0} // We don't store guest count in community view for privacy
                  likes={project.likes_count}
                  views={project.views_count}
                  isPublic={true}
                  publicSlug={project.public_slug}
                />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                  className="border-neutral-300"
                >
                  {loading ? (
                    <>
                      <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <Icon name="arrowDown" className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="flex justify-center mb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-warm">
                <Icon name="heart" className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">No projects found</h3>
            <p className="text-warm mb-6">Be the first to share a {selectedStyle && selectedStyle !== 'All' ? selectedStyle.toLowerCase() : ''} wedding project!</p>
            <Button className="bg-primary hover:bg-primary-600 text-white border-0" asChild>
              <a href="/signup">Create Your Project</a>
            </Button>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './ProjectCard'
import { ProjectFilters } from '@/components/ui/project-filters'
import { Icon } from '@/components/ui/icons'
import { communityService, type CommunityProject } from '@/lib/community'

const styles = ['Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage']
const filters = ['Popular', 'Recent', 'Trending']

// Helper function to extract style from onboarding data
function extractStyleFromPreferences(stylePreferences: string | null): string {
  if (!stylePreferences) return 'Classic'

  try {
    // If it's JSON, parse it
    if (stylePreferences.startsWith('{') || stylePreferences.startsWith('[')) {
      const parsed = JSON.parse(stylePreferences)
      if (parsed.themes && parsed.themes.length > 0) {
        return parsed.themes[0]
      }
      if (parsed.style) {
        return parsed.style
      }
    } else {
      // If it's a plain string, look for style keywords
      const styles = ['Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage', 'Industrial', 'Romantic', 'Minimalist', 'Luxury']
      for (const style of styles) {
        if (stylePreferences.toLowerCase().includes(style.toLowerCase())) {
          return style
        }
      }
    }
  } catch {
    // If parsing fails, return default
  }

  return 'Classic'
}

// Section communauté avec projets réels de la base de données
export function CommunitySection() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [projects, setProjects] = useState<CommunityProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load real projects from database
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await communityService.getPublicProjects(
          selectedFilter as any,
          selectedStyle || 'All',
          8 // Limit to 8 for landing page
        )

        if (result.error) {
          setError(result.error)
          setProjects([])
        } else {
          setProjects(result.projects)
        }
      } catch (err) {
        console.error('Error loading community projects:', err)
        setError('Failed to load projects')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [selectedFilter, selectedStyle])

  // Projects are already filtered by the API call
  const displayProjects = projects

  return (
    <section id="community-section" className="py-16 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-1">
        <div className="bg-white rounded-3xl shadow-sm border border-white/20 p-8 lg:p-12">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-foreground">
              From the community
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            <ProjectFilters
              filters={filters}
              styles={styles}
              selectedFilter={selectedFilter}
              selectedStyle={selectedStyle}
              onFilterChange={setSelectedFilter}
              onStyleChange={setSelectedStyle}
              showDropdownLeft={true}
            />
            
            <Link href="/community">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View all
                <Icon name="arrowRight" className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-200 rounded-lg aspect-[4/3] mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-8">
              <Icon name="alertCircle" className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && displayProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {displayProjects.slice(0, 8).map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description || ''}
                  date={project.wedding_date || ''}
                  style={extractStyleFromPreferences(project.style_preferences)}
                  guestCount={0} // Hidden for privacy in community
                  likes={project.likes_count}
                  views={project.views_count}
                  isPublic={true}
                  publicId={project.public_id}
                  featuredImage={project.featured_image_url}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && displayProjects.length === 0 && (
            <div className="text-center py-12">
              <Icon name="heart" className="h-16 w-16 text-primary/30 mx-auto mb-4" />
              <h3 className="text-xl font-serif text-gray-700 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share your beautiful wedding inspiration!</p>
              <Button
                className="bg-primary hover:bg-primary-600 text-white"
                onClick={() => window.location.href = '/onboarding'}
              >
                Create Your Project
              </Button>
            </div>
          )}
          
          {/* Bouton Show More */}
          <div className="flex justify-center">
            <Link href="/community">
              <Button className="bg-primary hover:bg-primary-600 text-white px-8 py-3">
                Show More
                <Icon name="arrowRight" className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
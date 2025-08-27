'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from '@/components/landing/ProjectCard'
import { ProjectFilters } from '@/components/ui/project-filters'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { DEMO_PROJECTS, WEDDING_STYLES, FILTER_OPTIONS } from '@/lib/constants'

type Project = {
  id: string
  name: string
  description: string
  wedding_date: string
  style: string
  guest_count: number
  likes: number
}

export default function CommunityPage() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [selectedStyle, setSelectedStyle] = useState<string | null>('All')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProjects(true)
  }, [selectedFilter, selectedStyle])

  const fetchProjects = async (reset = false) => {
    setLoading(true)
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, reset ? 800 : 400))

      // Filter by style
      let filteredProjects = selectedStyle && selectedStyle !== 'All' 
        ? DEMO_PROJECTS.filter((project: Project) => project.style === selectedStyle)
        : DEMO_PROJECTS

      // Sort by filter
      if (selectedFilter === 'Recent') {
        filteredProjects = filteredProjects.sort((a: Project, b: Project) => new Date(b.wedding_date).getTime() - new Date(a.wedding_date).getTime())
      } else if (selectedFilter === 'Popular') {
        filteredProjects = filteredProjects.sort((a: Project, b: Project) => b.likes - a.likes)
      } else if (selectedFilter === 'Trending') {
        filteredProjects = filteredProjects.sort((a: Project, b: Project) => b.guest_count - a.guest_count)
      }

      setProjects(reset ? filteredProjects : [...projects, ...filteredProjects])
      setHasMore(false)
    } catch (error) {
      console.warn('Error loading projects')
      setProjects([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    fetchProjects(false)
  }

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
            onFilterChange={setSelectedFilter}
            onStyleChange={setSelectedStyle}
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
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  date={project.wedding_date}
                  style={project.style}
                  guestCount={project.guest_count}
                  likes={project.likes || 0}
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
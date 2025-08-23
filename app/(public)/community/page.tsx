'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from '@/components/landing/ProjectCard'
import { ProjectFilters } from '@/components/ui/project-filters'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { supabase } from '@/lib/supabase'

const styles = ['All', 'Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage']
const filters = ['Popular', 'Recent', 'Trending']

export default function CommunityPage() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [selectedStyle, setSelectedStyle] = useState<string | null>('All')
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const projectsPerPage = 12

  useEffect(() => {
    fetchProjects(true)
  }, [selectedFilter, selectedStyle])

  const fetchProjects = async (reset = false) => {
    setLoading(true)
    try {
      const currentPage = reset ? 1 : page
      if (reset) setPage(1)

      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('is_public', true)

      if (selectedStyle && selectedStyle !== 'All') {
        query = query.eq('style', selectedStyle)
      }

      if (selectedFilter === 'Recent') {
        query = query.order('created_at', { ascending: false })
      } else if (selectedFilter === 'Popular') {
        query = query.order('likes', { ascending: false })
      } else if (selectedFilter === 'Trending') {
        query = query.order('views', { ascending: false })
      }

      query = query.range((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage - 1)

      const { data, error, count } = await query

      if (error) {
        console.warn('Database not configured, using demo data')
        // Données de démo plus complètes
        const demoProjects = [
          { id: '1', name: 'Romantic Garden Wedding', description: 'Beautiful outdoor ceremony', wedding_date: '2024-06-15', style: 'Garden', guest_count: 120, likes: 45 },
          { id: '2', name: 'Modern City Wedding', description: 'Sleek downtown celebration', wedding_date: '2024-08-20', style: 'Modern', guest_count: 80, likes: 32 },
          { id: '3', name: 'Beach Sunset Ceremony', description: 'Intimate beachside wedding', wedding_date: '2024-07-10', style: 'Beach', guest_count: 60, likes: 67 },
          { id: '4', name: 'Rustic Barn Wedding', description: 'Charming countryside celebration', wedding_date: '2024-09-05', style: 'Rustic', guest_count: 150, likes: 28 },
          { id: '5', name: 'Classic Elegance', description: 'Timeless traditional wedding', wedding_date: '2024-05-25', style: 'Classic', guest_count: 100, likes: 38 },
          { id: '6', name: 'Bohemian Dream', description: 'Free-spirited artistic celebration', wedding_date: '2024-10-12', style: 'Bohemian', guest_count: 75, likes: 52 },
          { id: '7', name: 'Vintage Romance', description: 'Nostalgic retro-themed wedding', wedding_date: '2024-04-18', style: 'Vintage', guest_count: 90, likes: 41 },
          { id: '8', name: 'Garden Party Wedding', description: 'Whimsical outdoor garden party', wedding_date: '2024-11-08', style: 'Garden', guest_count: 110, likes: 35 },
        ]
        
        setProjects(reset ? demoProjects : [...projects, ...demoProjects])
        setHasMore(false)
        return
      }
      
      if (reset) {
        setProjects(data || [])
      } else {
        setProjects(prev => [...prev, ...(data || [])])
      }
      
      setHasMore((count || 0) > currentPage * projectsPerPage)
      if (!reset) setPage(currentPage + 1)
    } catch (error) {
      console.warn('Database connection failed, using demo data')
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
            filters={filters}
            styles={styles}
            selectedFilter={selectedFilter}
            selectedStyle={selectedStyle}
            onFilterChange={setSelectedFilter}
            onStyleChange={setSelectedStyle}
          />
        </div>

        {loading && page === 1 ? (
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
              {projects.map((project) => (
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
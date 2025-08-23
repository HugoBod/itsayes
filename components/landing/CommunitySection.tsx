'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './ProjectCard'
import { ProjectFilters } from '@/components/ui/project-filters'
import { Icon } from '@/components/ui/icons'

const styles = ['Classic', 'Bohemian', 'Modern', 'Rustic', 'Beach', 'Garden', 'Vintage']
const filters = ['Popular', 'Recent', 'Trending']

// Section communauté avec projets et filtres (données statiques pour performance)
export function CommunitySection() {
  const [selectedFilter, setSelectedFilter] = useState('Popular')
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [projects] = useState([
    {
      id: '1',
      name: 'Romantic Garden Wedding',
      description: 'A beautiful outdoor ceremony surrounded by blooming flowers',
      wedding_date: '2024-06-15',
      style: 'Garden',
      guest_count: 120,
      likes: 45
    },
    {
      id: '2', 
      name: 'Modern City Wedding',
      description: 'Sleek and sophisticated celebration in downtown venue',
      wedding_date: '2024-08-20',
      style: 'Modern',
      guest_count: 80,
      likes: 32
    },
    {
      id: '3',
      name: 'Beach Sunset Ceremony',
      description: 'Intimate beachside wedding with ocean views',
      wedding_date: '2024-07-10',
      style: 'Beach', 
      guest_count: 60,
      likes: 67
    },
    {
      id: '4',
      name: 'Rustic Barn Wedding',
      description: 'Charming countryside celebration with vintage touches',
      wedding_date: '2024-09-05',
      style: 'Rustic',
      guest_count: 150,
      likes: 28
    },
    {
      id: '5',
      name: 'Vintage Romance Affair',
      description: 'Elegant vintage wedding with classic charm',
      wedding_date: '2024-10-15',
      style: 'Vintage',
      guest_count: 95,
      likes: 41
    },
    {
      id: '6',
      name: 'Bohemian Dream Wedding',
      description: 'Free-spirited celebration with artistic flair',
      wedding_date: '2024-11-20',
      style: 'Bohemian',
      guest_count: 70,
      likes: 36
    },
    {
      id: '7',
      name: 'Classic Elegance Event',
      description: 'Timeless wedding with traditional elements',
      wedding_date: '2024-12-08',
      style: 'Classic',
      guest_count: 130,
      likes: 52
    },
    {
      id: '8',
      name: 'Secret Garden Ceremony',
      description: 'Enchanted outdoor wedding in botanical setting',
      wedding_date: '2025-01-25',
      style: 'Garden',
      guest_count: 85,
      likes: 48
    }
  ])

  // Filtrer les projets selon le style sélectionné
  const filteredProjects = selectedStyle 
    ? projects.filter(p => p.style === selectedStyle)
    : projects

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {filteredProjects.slice(0, 8).map((project) => (
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
'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icons'

interface ProjectCardProps {
  id: string
  name: string
  description?: string
  date?: string
  style?: string
  guestCount?: number
  likes?: number
  views?: number
  isPublic?: boolean
  publicSlug?: string
}

export function ProjectCard({ 
  id, 
  name, 
  description, 
  date, 
  style, 
  guestCount, 
  likes = 0,
  views = 0,
  isPublic = false,
  publicSlug
}: ProjectCardProps) {
  // Use public slug for URL if available, otherwise fall back to id
  const href = isPublic && publicSlug 
    ? `/community/project/${publicSlug}` 
    : `/community/project/${id}`
    
  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-wedding shadow-sm border border-neutral-200/50 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                <Icon name="heart" className="h-6 w-6 text-primary" />
              </div>
              <p className="text-xs text-neutral-600">Wedding Project</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>
          
          {description && (
            <p className="text-neutral-600 text-xs mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
            {date && (
              <span>{new Date(date).toLocaleDateString('fr-FR')}</span>
            )}
            {guestCount && (
              <span>{guestCount} guests</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {style && (
              <Badge variant="secondary" className="text-xs">
                {style}
              </Badge>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Icon name="heart" className="h-3 w-3" />
                <span>{likes}</span>
              </div>
              {isPublic && views > 0 && (
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Icon name="eye" className="h-3 w-3" />
                  <span>{views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
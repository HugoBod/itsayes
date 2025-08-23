'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface ProjectFiltersProps {
  filters: string[]
  styles: string[]
  selectedFilter: string
  selectedStyle: string | null
  onFilterChange: (filter: string) => void
  onStyleChange: (style: string | null) => void
  className?: string
  showDropdownLeft?: boolean
}

export function ProjectFilters({
  filters,
  styles,
  selectedFilter,
  selectedStyle,
  onFilterChange,
  onStyleChange,
  className = '',
  showDropdownLeft = false
}: ProjectFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (showDropdownLeft) {
    return (
      <div className={`flex flex-col lg:flex-row items-center gap-4 lg:gap-8 w-full ${className}`}>
        {/* Dropdown à gauche */}
        <div className="flex items-center lg:order-1" ref={dropdownRef}>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between text-sm font-medium bg-transparent border border-border rounded-lg px-3 py-2 text-foreground hover:bg-muted focus:outline-none transition-colors w-[120px]"
            >
              <span>{selectedFilter}</span>
              <Icon name="chevronDown" className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-border rounded-lg shadow-lg z-50">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      onFilterChange(filter)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedFilter === filter 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Boutons de style centrés */}
        <div className="flex items-center gap-2 flex-wrap justify-center lg:order-2 flex-1">
          {styles.map((style) => (
            <Button
              key={style}
              variant={selectedStyle === style ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (style === 'All') {
                  onStyleChange('All')
                } else {
                  onStyleChange(selectedStyle === style ? null : style)
                }
              }}
              className={selectedStyle === style ? 'bg-primary hover:bg-primary-600 text-white border-primary' : 'border-neutral-300'}
            >
              {style}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col lg:flex-row items-center gap-4 ${className}`}>
      {/* Dropdown pour les filtres */}
      <div className="flex items-center" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between text-sm font-medium bg-transparent border border-border rounded-lg px-3 py-2 text-foreground hover:bg-muted focus:outline-none transition-colors w-[120px]"
          >
            <span>{selectedFilter}</span>
            <Icon name="chevronDown" className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-border rounded-lg shadow-lg z-50">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    onFilterChange(filter)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedFilter === filter 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Boutons pour les styles */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {styles.map((style) => (
          <Button
            key={style}
            variant={selectedStyle === style ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (style === 'All') {
                onStyleChange('All')
              } else {
                onStyleChange(selectedStyle === style ? null : style)
              }
            }}
            className={selectedStyle === style ? 'bg-primary hover:bg-primary-600 text-white border-primary' : 'border-neutral-300'}
          >
            {style}
          </Button>
        ))}
      </div>
    </div>
  )
}
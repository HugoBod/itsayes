import dynamic from 'next/dynamic'
import { memo } from 'react'
import { Icon } from '@/components/ui/icons'

// Lazy loading des composants lourds avec Framer Motion
export const MoodboardWidget = dynamic(() => 
  import('./MoodboardWidget').then(mod => ({ default: mod.MoodboardWidget })), {
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <Icon name="loader" className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
  ssr: false // Désactive le SSR pour les animations
})

export const CinematicMoodboard = dynamic(() => 
  import('./CinematicMoodboard'), {
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <Icon name="loader" className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
  ssr: false
})

export const MoodboardContent = dynamic(() => 
  import('./MoodboardContent'), {
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <Icon name="loader" className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
  ssr: false
})

export const MoodboardGeneratingState = dynamic(() => 
  import('./MoodboardGeneratingState'), {
  loading: () => (
    <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
      <Icon name="loader" className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  ),
  ssr: false
})
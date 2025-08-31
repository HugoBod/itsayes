// Types for the cinematic moodboard poster system

export interface PosterMoodboard {
  title: string              // "Classic Luxury"
  subtitle?: string          // optional tagline
  images: {
    heroLandscape: string    // left big image
    heroPortrait: string     // right tall image  
    accentSquare: string     // bottom-left overlap
  }
  palette: { hex: string; name?: string }[] // 4 colors
  brands?: { label: string; url?: string }[] // "Cartier", etc. (optional)
  credits?: string           // photographer, venue, etc.
  shareUrl: string
}

export interface AnimationConfig {
  backgroundFade: number     // ms for background fade-in
  landscapeDelay: number     // delay before landscape image
  landscapeDuration: number  // landscape fade+slide duration  
  portraitDelay: number      // delay after landscape
  portraitDuration: number   // portrait fade+slide duration
  accentDelay: number        // delay after portrait
  accentDuration: number     // accent scale+shadow duration
  paletteDelay: number       // delay before palette chips
  paletteStagger: number     // stagger between palette chips
  morphDelay: number         // delay before morphing to poster
  controlsFadeDelay: number  // delay before showing controls
}

export interface CinematicMoodboardProps {
  moodboard: any // existing moodboard data structure
  onboardingData: any // existing onboarding data
  onComplete?: () => void
  animationConfig?: Partial<AnimationConfig>
  showControls?: boolean
}

// Default animation timing configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  backgroundFade: 600,
  landscapeDelay: 0,
  landscapeDuration: 800, 
  portraitDelay: 400,
  portraitDuration: 800,
  accentDelay: 300,
  accentDuration: 700,
  paletteDelay: 600,
  paletteStagger: 120,
  morphDelay: 800,
  controlsFadeDelay: 1000
}
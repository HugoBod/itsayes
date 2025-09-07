'use client'

import Image from 'next/image'
import { PaletteBar } from './PaletteBar'
import { WEDDING_CATEGORIES } from '@/lib/moodboard-categories'

interface MoodboardImage {
  url: string
  category: string
  displayTitle: string
}

interface MoodboardPanelProps {
  title: string
  images: MoodboardImage[]
  palette: string[]
  onComplete: () => void
  className?: string
}

export function MoodboardPanel({ 
  title, 
  images, 
  palette, 
  onComplete, 
  className = '' 
}: MoodboardPanelProps) {
  // Get category display name from the categories config
  const getCategoryTitle = (category: string) => {
    return WEDDING_CATEGORIES[category]?.name || category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Ensure we have 3 images, with proper category titles
  const processedImages = images.slice(0, 3).map(img => ({
    ...img,
    displayTitle: img.displayTitle || getCategoryTitle(img.category)
  }))

  // Pad with placeholder if needed
  while (processedImages.length < 3) {
    processedImages.push({
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjVGNUY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBsYWNlaG9sZGVyPC90ZXh0Pjwvc3ZnPg==',
      category: 'placeholder',
      displayTitle: 'Coming Soon'
    })
  }

  return (
    <div className={`w-full h-full flex flex-col relative ${className}`} style={{ 
      background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
      backgroundImage: `
        radial-gradient(circle at 85% 15%, rgba(200, 184, 148, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 15% 85%, rgba(139, 125, 107, 0.05) 0%, transparent 50%)
      `
    }}>
      
      {/* Elegant book header */}
      <div className="text-center pt-8 pb-6 border-b border-[#D4C4A0]/30 mx-6">
        <h1 
          className="font-serif text-[clamp(28px,4.5vh,42px)] leading-[0.9] mb-2 text-[#2C2416] tracking-wide"
          style={{ 
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 1px 2px rgba(139, 125, 107, 0.1)'
          }}
        >
          {title}
        </h1>
        
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent mx-auto mb-3" />
        
        <p className="text-[clamp(12px,1.8vh,16px)] text-[#6B5D4F] italic tracking-wide font-light">
          A visual symphony of our dreams
        </p>
      </div>

      {/* Main content area with magazine layout */}
      <div className="flex-1 px-4 py-4 flex flex-col">
        
        {/* Images in proper book layout */}
        <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
          
          {/* Left column - Two images stacked */}
          <div className="space-y-3">
            {/* First image */}
            <div className="relative aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: '3px' }}>
              <Image
                src={processedImages[0].url}
                alt={`Wedding inspiration: ${processedImages[0].displayTitle}`}
                fill
                className="object-cover"
                sizes="50vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2416]/80 via-[#2C2416]/40 to-transparent p-2">
                <p className="text-white font-serif text-xs md:text-sm tracking-wide">
                  {processedImages[0].displayTitle}
                </p>
              </div>
            </div>

            {/* Second image */}
            <div className="relative aspect-[4/3] overflow-hidden shadow-lg" style={{ borderRadius: '3px' }}>
              <Image
                src={processedImages[1].url}
                alt={`Wedding inspiration: ${processedImages[1].displayTitle}`}
                fill
                className="object-cover"
                sizes="50vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2416]/80 via-[#2C2416]/40 to-transparent p-2">
                <p className="text-white font-serif text-xs md:text-sm tracking-wide">
                  {processedImages[1].displayTitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Third image and palette */}
          <div className="flex flex-col">
            {/* Third image - takes most of the space */}
            <div className="relative flex-1 overflow-hidden shadow-lg mb-3" style={{ borderRadius: '3px' }}>
              <Image
                src={processedImages[2].url}
                alt={`Wedding inspiration: ${processedImages[2].displayTitle}`}
                fill
                className="object-cover"
                sizes="50vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2416]/80 via-[#2C2416]/40 to-transparent p-2">
                <p className="text-white font-serif text-xs md:text-sm tracking-wide">
                  {processedImages[2].displayTitle}
                </p>
              </div>
            </div>

            {/* Color palette - compact */}
            <div className="text-center">
              <h3 className="font-serif text-[#2C2416] text-xs tracking-widest mb-2 uppercase">Palette</h3>
              <div className="flex justify-center">
                <PaletteBar palette={palette} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with elegant quote */}
      <div className="px-6 pb-8">
        <div className="text-center border-t border-[#D4C4A0]/30 pt-6">
          <p className="text-[#6B5D4F] text-sm italic font-light leading-relaxed tracking-wide max-w-md mx-auto mb-6">
            "Every wedding begins with a vision. This collection captures the essence of our love story—a curated glimpse of elegance, beauty, and timeless celebration."
          </p>
          
          <div className="space-y-3">
            {/* Primary CTA */}
            <button className="bg-gradient-to-r from-[#C9A368] to-[#B8926B] text-white font-medium py-3 px-8 text-sm tracking-widest hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5" style={{ borderRadius: '2px' }}>
              SHARE YOUR VISION
            </button>
            
            {/* Secondary action */}
            <button
              onClick={onComplete}
              className="block text-[#8B7D6B] hover:text-[#C9A368] text-xs tracking-widest font-light transition-colors duration-200 mx-auto"
            >
              CONTINUE TO DASHBOARD
            </button>
          </div>

          {/* Bottom ornamental */}
          <div className="flex items-center justify-center mt-8">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
            <div className="mx-3 w-1 h-1 rounded-full bg-[#C9A368] shadow-inner" />
            <div className="w-8 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
          </div>

          {/* Brand signature */}
          <div className="mt-6 text-xs text-[#8B7D6B] tracking-widest font-light">
            ItsaYes — <span className="italic">Because every love story deserves</span>
          </div>
        </div>
      </div>

      {/* Page number */}
      <div className="absolute bottom-4 right-6 text-[#8B7D6B] text-xs tracking-widest font-light">
        2
      </div>
    </div>
  )
}
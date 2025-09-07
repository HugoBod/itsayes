'use client'

import Image from 'next/image'
import { PaletteBar } from './PaletteBar'

interface MoodboardImage {
  url: string
  category: string
  displayTitle: string
}

interface PhotoPalettePageProps {
  title: string
  images: MoodboardImage[]
  palette: string[]
  onComplete: () => void
  className?: string
}

export function PhotoPalettePage({ 
  title, 
  images, 
  palette, 
  onComplete, 
  className = '' 
}: PhotoPalettePageProps) {
  // Process images - ensure we have at least 3, add placeholders if needed
  const processedImages = [...images].slice(0, 3)
  while (processedImages.length < 3) {
    processedImages.push({
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBsYWNlaG9sZGVyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjVGNUY1O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0U4RTdFNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BsYWNlaG9sZGVyKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iUGxheWZhaXIgRGlzcGxheSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZCNUQ0RiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIG9wYWNpdHk9IjAuNyI+Q29taW5nIFNvb248L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJQbGF5ZmFpciBEaXNwbGF5IiBmb250LXNpemU9IjE0IiBmaWxsPSIjOEI3RDZCIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgb3BhY2l0eT0iMC42Ij5Zb3VyIGluc3BpcmF0aW9uPC90ZXh0Pjwvc3ZnPg==',
      category: 'placeholder',
      displayTitle: 'Your Vision'
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
      
      {/* Elegant header */}
      <div className="text-center pt-8 pb-6 border-b border-[#D4C4A0]/30 mx-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-3 w-1.5 h-1.5 rounded-full bg-[#C9A368] shadow-inner" />
          <div className="w-12 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>

        <h1 
          className="font-serif text-[clamp(32px,5vh,48px)] leading-[0.9] mb-3 text-[#2C2416] tracking-wide"
          style={{ 
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 1px 2px rgba(139, 125, 107, 0.1)'
          }}
        >
          {title}
        </h1>
        
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent mx-auto mb-3" />
        
        <p className="text-[clamp(12px,1.8vh,16px)] text-[#6B5D4F] italic tracking-wide font-light">
          Visual Inspiration & Color Harmony
        </p>
      </div>

      {/* Main content - 3 Images + Palette layout */}
      <div className="flex-1 px-6 py-4 space-y-6">
        
        {/* Three images in grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {processedImages.map((image, index) => (
            <div key={index} className="relative aspect-[4/5] overflow-hidden shadow-lg" style={{ borderRadius: '4px' }}>
              <Image
                src={image.url}
                alt={`Wedding inspiration: ${image.displayTitle}`}
                fill
                className="object-cover"
                sizes="33vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#2C2416]/90 via-[#2C2416]/50 to-transparent p-3">
                <p className="text-white font-serif text-sm md:text-base tracking-wide">
                  {image.displayTitle}
                </p>
                <p className="text-[#F8F6F0]/80 text-xs font-light tracking-wide mt-1">
                  Image #{index + 1}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Color Palette Section - Clean design */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-[#E8DCC0]/50 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="font-serif text-[#2C2416] text-xl tracking-wide mb-2">
              Color Palette
            </h3>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent mx-auto mb-3" />
            <p className="text-[#6B5D4F] text-sm italic font-light tracking-wide">
              Your carefully curated color harmony
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <PaletteBar palette={palette} size="large" />
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-[#8B7D6B] text-xs tracking-widest font-light uppercase">
              Harmonious • Timeless • Elegant
            </p>
            <p className="text-[#6B5D4F] text-sm italic font-light">
              Each color chosen to reflect the essence of your love story
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section with elegant completion */}
      <div className="px-8 pb-8">
        <div className="text-center border-t border-[#D4C4A0]/30 pt-6">
          <p className="text-[#6B5D4F] text-sm italic font-light leading-relaxed tracking-wide max-w-md mx-auto mb-6">
            "Your wedding vision brought to life through carefully selected imagery and an exquisite color palette that tells your unique love story."
          </p>
          
          <div className="space-y-4">
            <button
              onClick={onComplete}
              className="group relative bg-gradient-to-r from-[#C9A368] to-[#B8926B] text-white font-medium py-4 px-12 text-base tracking-widest transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              style={{
                borderRadius: '2px',
                boxShadow: '0 4px 12px rgba(201, 163, 104, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="relative z-10">CONTINUE TO DASHBOARD</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4A574] to-[#C9A368] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderRadius: '2px' }} />
            </button>
            
            <p className="text-[#8B7D6B] text-xs tracking-widest font-light">
              Your wedding planning journey begins
            </p>
          </div>

          {/* Bottom ornamental */}
          <div className="flex items-center justify-center mt-8">
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
            <div className="mx-3 w-1 h-1 rounded-full bg-[#C9A368] shadow-inner" />
            <div className="w-8 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
          </div>

          {/* Brand signature */}
          <div className="mt-6 text-xs text-[#8B7D6B] tracking-widest font-light">
            ItsaYes — <span className="italic">Where your vision becomes reality</span>
          </div>
        </div>
      </div>

      {/* Page number */}
      <div className="absolute bottom-4 right-8 text-[#8B7D6B] text-xs tracking-widest font-light">
        3
      </div>
    </div>
  )
}
'use client'

interface TitlePageProps {
  title: string
  subtitle: string
  onNextPage: () => void
  className?: string
}

export function TitlePage({ 
  title, 
  subtitle, 
  onNextPage,
  className = '' 
}: TitlePageProps) {
  return (
    <div 
      className={`w-full h-full flex flex-col justify-center items-center relative cursor-pointer ${className}`} 
      style={{ 
        background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
        backgroundImage: `
          radial-gradient(circle at 85% 15%, rgba(200, 184, 148, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 15% 85%, rgba(139, 125, 107, 0.08) 0%, transparent 60%),
          radial-gradient(circle at 50% 50%, rgba(201, 163, 104, 0.03) 0%, transparent 70%)
        `
      }}
      onClick={onNextPage}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNextPage()
        }
      }}
    >
      
      {/* Ornamental top border */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-6 w-3 h-3 rounded-full bg-[#C9A368] shadow-inner" />
          <div className="w-24 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>
      </div>

      {/* Main content */}
      <div className="text-center px-8 max-w-2xl">
        
        {/* Main Title */}
        <h1 
          className="font-serif text-[clamp(48px,8vh,80px)] leading-[0.85] mb-8 text-[#2C2416] tracking-wide"
          style={{ 
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 2px 4px rgba(139, 125, 107, 0.15)'
          }}
        >
          {title}
        </h1>
        
        {/* Decorative divider */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-4 flex space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A368] shadow-inner" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A368] shadow-inner" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A368] shadow-inner" />
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>
        
        {/* Subtitle */}
        <p 
          className="text-[clamp(18px,3vh,28px)] text-[#6B5D4F] italic tracking-wider font-light leading-relaxed mb-12"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {subtitle}
        </p>

        {/* Elegant quote or tagline */}
        <div className="mb-12">
          <p className="text-[#8B7D6B] text-sm tracking-widest font-light uppercase mb-4">
            Our Love Story
          </p>
          <p className="text-[#6B5D4F] text-base italic font-light leading-relaxed max-w-md mx-auto tracking-wide">
            "A journey of two hearts becoming one, captured in moments of elegance and timeless beauty."
          </p>
        </div>

        {/* Call to action */}
        <div className="space-y-4">
          <p className="text-[#8B7D6B] text-xs tracking-widest font-light uppercase">
            Click to begin
          </p>
          
          {/* Interactive hint */}
          <div className="animate-pulse">
            <div className="inline-block w-6 h-6 border-2 border-[#C9A368] rounded-full relative">
              <div className="absolute inset-1 bg-[#C9A368] rounded-full opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Ornamental bottom border */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-4 w-2 h-2 rounded-full bg-[#C9A368] shadow-inner" />
          <div className="w-20 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>
      </div>

      {/* Brand signature - bottom corner */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-[#8B7D6B] tracking-widest font-light">
        ItsaYes
      </div>
      
      {/* Page indicator */}
      <div className="absolute bottom-4 right-8 text-[#8B7D6B] text-xs tracking-widest font-light">
        Cover
      </div>
    </div>
  )
}
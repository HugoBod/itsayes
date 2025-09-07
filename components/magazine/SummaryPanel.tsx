'use client'

interface SummaryPanelProps {
  title: string
  subtitle: string
  summary: {
    stage: string
    location: string
    date?: string
    budgetCurrency: string
    budgetRangeLabel: string
    guests: number
    ceremony: string
    styles: string[]
    inspirations?: string
  }
  onRevealMoodboard: () => void
  className?: string
}

export function SummaryPanel({ 
  title, 
  subtitle, 
  summary, 
  onRevealMoodboard, 
  className = '' 
}: SummaryPanelProps) {
  const formatBudget = () => {
    if (summary.budgetRangeLabel) {
      return `${summary.budgetRangeLabel.replace(summary.budgetCurrency, '').trim()}`
    }
    return 'Custom budget'
  }

  const formatStyles = () => {
    if (!summary.styles || summary.styles.length === 0) return 'Classic elegance'
    return summary.styles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' • ')
  }

  return (
    <div className={`w-full h-full flex flex-col relative ${className}`} style={{ 
      background: 'linear-gradient(135deg, #F8F6F0 0%, #F0EDE5 100%)',
      backgroundImage: `
        radial-gradient(circle at 85% 15%, rgba(200, 184, 148, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 15% 85%, rgba(139, 125, 107, 0.05) 0%, transparent 50%)
      `
    }}>
      
      {/* Elegant book header with gold accents */}
      <div className="text-center pt-12 pb-8 border-b border-[#D4C4A0]/30 mx-8">
        {/* Ornamental top border */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-4 w-2 h-2 rounded-full bg-[#C9A368] shadow-inner" />
          <div className="w-16 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>

        <h1 
          className="font-serif text-[clamp(32px,5vh,52px)] leading-[0.9] mb-3 text-[#2C2416] tracking-wide"
          style={{ 
            fontFamily: 'Playfair Display, serif',
            textShadow: '0 1px 2px rgba(139, 125, 107, 0.1)'
          }}
        >
          {title}
        </h1>
        
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent mx-auto mb-4" />
        
        <p 
          className="text-[clamp(14px,2.2vh,18px)] text-[#6B5D4F] italic tracking-wide font-light"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          {subtitle}
        </p>
      </div>

      {/* Elegant content in book style */}
      <div className="flex-1 px-8 py-8">
        
        {/* Wedding Details in elegant typography */}
        <div className="mb-12">
          <h2 className="font-serif text-[clamp(18px,2.8vh,24px)] text-[#2C2416] mb-6 text-center tracking-wider">
            Our Celebration
          </h2>
          
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex justify-between items-center py-2 border-b border-[#E8DCC0]/50">
              <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Planning Stage</span>
              <span className="text-[#2C2416] font-medium capitalize tracking-wide">{summary.stage}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-[#E8DCC0]/50">
              <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Location</span>
              <span className="text-[#2C2416] font-medium tracking-wide">{summary.location}</span>
            </div>
            
            {summary.date && (
              <div className="flex justify-between items-center py-2 border-b border-[#E8DCC0]/50">
                <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Date</span>
                <span className="text-[#2C2416] font-medium tracking-wide">{summary.date}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-2 border-b border-[#E8DCC0]/50">
              <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Investment</span>
              <span className="text-[#2C2416] font-medium tracking-wide">{formatBudget()}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-[#E8DCC0]/50">
              <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Guests</span>
              <span className="text-[#2C2416] font-medium tracking-wide">{summary.guests} souls</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B5D4F] text-sm tracking-wide font-light">Ceremony</span>
              <span className="text-[#2C2416] font-medium capitalize tracking-wide">{summary.ceremony}</span>
            </div>
          </div>
        </div>

        {/* Style & Inspiration */}
        <div className="mb-8">
          <h2 className="font-serif text-[clamp(18px,2.8vh,24px)] text-[#2C2416] mb-4 text-center tracking-wider">
            Our Vision
          </h2>
          
          <div className="text-center max-w-sm mx-auto">
            <p className="text-[#2C2416] font-medium text-base mb-3 tracking-wide">
              {formatStyles()}
            </p>
            
            {summary.inspirations && (
              <p className="text-[#6B5D4F] text-sm leading-relaxed italic font-light tracking-wide">
                "{summary.inspirations}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Elegant call to action */}
      <div className="text-center pb-12 px-8">
        <button
          onClick={onRevealMoodboard}
          className="group relative bg-gradient-to-r from-[#C9A368] to-[#B8926B] text-white font-medium py-4 px-12 text-base tracking-widest transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          style={{
            borderRadius: '2px',
            boxShadow: '0 4px 12px rgba(201, 163, 104, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <span className="relative z-10">REVEAL OUR STORY</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4A574] to-[#C9A368] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderRadius: '2px' }} />
        </button>
        
        <p className="text-[#8B7D6B] text-xs mt-4 tracking-widest font-light">
          Turn the page with → or click anywhere
        </p>

        {/* Ornamental bottom */}
        <div className="flex items-center justify-center mt-8">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A368] to-transparent" />
          <div className="mx-3 w-1.5 h-1.5 rounded-full bg-[#C9A368] shadow-inner" />
          <div className="w-12 h-px bg-gradient-to-r from-[#C9A368] via-transparent to-transparent" />
        </div>
      </div>

      {/* Subtle page number */}
      <div className="absolute bottom-4 right-8 text-[#8B7D6B] text-xs tracking-widest font-light">
        1
      </div>
    </div>
  )
}
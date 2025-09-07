'use client'

import { ReactNode } from 'react'

interface PageFrameProps {
  children: ReactNode
  className?: string
}

export function PageFrame({ children, className = '' }: PageFrameProps) {
  return (
    <>
      {/* Global styles for no scroll on desktop */}
      <style jsx global>{`
        html, body {
          height: 100%;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          html, body {
            overflow: auto;
          }
        }
      `}</style>
      
      {/* Luxury book environment */}
      <div className={`min-h-screen w-full flex items-center justify-center p-8 ${className}`}>
        {/* Wooden desk surface */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 30% 30%, rgba(139, 125, 107, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(160, 142, 119, 0.2) 0%, transparent 50%),
              linear-gradient(135deg, 
                #8B7355 0%, 
                #A68B5B 25%, 
                #8B7355 50%, 
                #9D8055 75%, 
                #8B7355 100%
              )
            `,
            backgroundSize: '400px 400px, 300px 300px, 100% 100%',
            filter: 'blur(1px)'
          }}
        />

        {/* Book container with realistic proportions */}
        <div className="relative">
          {/* Book shadow on desk */}
          <div 
            className="absolute -bottom-2 -left-1 right-1 h-8 bg-black/30 rounded-full"
            style={{
              filter: 'blur(12px)',
              transform: 'perspective(100px) rotateX(45deg) scale(0.8)'
            }}
          />

          {/* Actual book */}
          <div 
            className="relative bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE5] shadow-2xl overflow-hidden"
            style={{
              width: 'min(85vw, 800px)', // Real book width
              aspectRatio: '3/4', // Real book proportions (3:4 like a real book)
              maxHeight: '85vh',
              borderRadius: '2px 12px 12px 2px', // Book corner rounding
              // Realistic book shadows
              boxShadow: `
                0 0 0 1px rgba(139, 125, 107, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.1),
                0 8px 16px rgba(0, 0, 0, 0.15),
                0 16px 32px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(255, 255, 255, 0.5)
              `
            }}
          >
            {/* Book spine texture */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#D4C4A0] via-[#C8B894] to-[#D4C4A0]"
              style={{
                borderRadius: '2px 0 0 2px',
                background: `
                  linear-gradient(90deg, 
                    rgba(139, 125, 107, 0.4) 0%,
                    rgba(180, 165, 140, 0.2) 50%,
                    rgba(139, 125, 107, 0.4) 100%
                  ),
                  linear-gradient(180deg,
                    #E8DCC0 0%,
                    #D4C4A0 25%,
                    #C8B894 50%,
                    #D4C4A0 75%,
                    #E8DCC0 100%
                  )
                `
              }}
            />

            {/* Book binding details */}
            <div className="absolute left-2 top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-[#C8B894] to-transparent opacity-60" />
            <div className="absolute left-2 top-12 bottom-12 w-px bg-gradient-to-b from-transparent via-[#8B7D6B] to-transparent opacity-40" />

            {/* Paper texture overlay */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(139, 125, 107, 0.05) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(160, 142, 119, 0.03) 0%, transparent 50%),
                  repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 1px,
                    rgba(139, 125, 107, 0.01) 1px,
                    rgba(139, 125, 107, 0.01) 2px
                  )
                `,
                backgroundSize: '200px 200px, 150px 150px, 4px 4px'
              }}
            />

            {/* Content area with proper book margins */}
            <div className="relative w-full h-full pl-8 pr-4 py-6">
              {children}
            </div>

            {/* Subtle book edge highlight */}
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-60" />
          </div>
        </div>

        {/* Ambient lighting effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(255, 248, 220, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 30%, rgba(255, 245, 210, 0.05) 0%, transparent 70%)
            `
          }}
        />
      </div>
    </>
  )
}
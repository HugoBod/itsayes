'use client'

interface PaletteBarProps {
  palette: string[] // 5 HEX values
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function PaletteBar({ palette, size = 'medium', className = '' }: PaletteBarProps) {
  // Ensure we have exactly 5 colors, pad with neutrals if needed
  const colors = [...palette].slice(0, 5)
  while (colors.length < 5) {
    colors.push('#F5F5F5') // Light gray fallback
  }

  // Size variants
  const sizeClasses = {
    small: 'gap-1',
    medium: 'gap-2', 
    large: 'gap-3'
  }

  const colorSizeClasses = {
    small: 'w-4 h-8',
    medium: 'w-6 h-10 md:w-8 md:h-12',
    large: 'w-8 h-14 md:w-12 md:h-16'
  }

  const textSizeClasses = {
    small: 'text-[8px]',
    medium: 'text-[10px] md:text-xs',
    large: 'text-xs md:text-sm'
  }

  return (
    <div className={`flex ${sizeClasses[size]} ${className}`}>
      {colors.map((color, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`${colorSizeClasses[size]} shadow-lg transition-transform hover:scale-105`}
            style={{ 
              backgroundColor: color,
              borderRadius: size === 'large' ? '4px' : '2px',
              border: '1px solid rgba(139, 125, 107, 0.2)'
            }}
            title={color.toUpperCase()}
          />
          <div className={`${textSizeClasses[size]} text-[#6B5D4F] font-mono mt-1 tracking-wide font-light`}>
            {color.slice(1).toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  )
}
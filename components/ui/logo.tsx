import { PixelHeartMicro } from './icons/pixel-heart-micro'

interface LogoProps {
  className?: string
  textColor?: string
  size?: 'sm' | 'md' | 'lg'
  heartColor?: string
}

export function Logo({ className = '', textColor = 'text-foreground', size = 'md', heartColor = 'bg-primary' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-sm',      // 14px
    md: 'text-[18px]',  // 18px  
    lg: 'text-xl'       // 20px
  }

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`${sizeClasses[size]} font-serif font-normal tracking-wide ${textColor} flex items-center`}>
        <span className="inline-flex items-center justify-center mr-3 translate-y-[-1px]">
          <PixelHeartMicro color={heartColor} />
        </span>
        ItsaYes
      </span>
    </div>
  );
}
import { memo } from 'react'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  className?: string
}

export const SidebarHeader = memo(function SidebarHeader({ 
  className 
}: SidebarHeaderProps) {
  return (
    <div className={cn(
      "p-6 border-b border-border",
      className
    )}>
      <Logo />
    </div>
  )
})
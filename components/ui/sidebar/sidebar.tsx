import { memo } from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export const Sidebar = memo(function Sidebar({ 
  children, 
  className 
}: SidebarProps) {
  return (
    <aside className={cn(
      "w-64 h-full bg-background border-r border-border flex flex-col",
      className
    )}>
      {children}
    </aside>
  )
})
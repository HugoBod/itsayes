import { memo } from 'react'
import { Icon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface ProjectItemProps {
  name: string
  isActive?: boolean
  onClick?: () => void
  className?: string
}

export const ProjectItem = memo(function ProjectItem({ 
  name, 
  isActive,
  onClick,
  className 
}: ProjectItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
    >
      <Icon name="heart" className="h-4 w-4" />
      {name}
    </div>
  )
})
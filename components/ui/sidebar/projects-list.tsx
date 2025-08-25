import { memo } from 'react'
import { ProjectItem } from './project-item'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
}

interface ProjectsListProps {
  projects: Project[]
  activeProjectId?: string
  onProjectSelect?: (projectId: string) => void
  className?: string
}

export const ProjectsList = memo(function ProjectsList({ 
  projects,
  activeProjectId,
  onProjectSelect,
  className 
}: ProjectsListProps) {
  return (
    <div className={cn("px-4", className)}>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Wedding Projects
      </div>
      <div className="space-y-1">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            name={project.name}
            isActive={project.id === activeProjectId}
            onClick={() => onProjectSelect?.(project.id)}
          />
        ))}
      </div>
    </div>
  )
})
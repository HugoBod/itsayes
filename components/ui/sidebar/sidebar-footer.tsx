import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface SidebarFooterProps {
  className?: string
}

export const SidebarFooter = memo(function SidebarFooter({ 
  className 
}: SidebarFooterProps) {
  return (
    <div className={cn(
      "p-4 border-t border-border",
      className
    )}>
      <Button variant="ghost" className="w-full justify-start gap-3">
        <Icon name="settings" className="h-4 w-4" />
        Settings
      </Button>
    </div>
  )
})
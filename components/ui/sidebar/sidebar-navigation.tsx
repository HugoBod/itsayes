import { memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface NavigationItem {
  href: string
  label: string
  icon: string
}

interface SidebarNavigationProps {
  items: NavigationItem[]
  className?: string
}

export const SidebarNavigation = memo(function SidebarNavigation({ 
  items, 
  className 
}: SidebarNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex-1 p-4", className)}>
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href)
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
})
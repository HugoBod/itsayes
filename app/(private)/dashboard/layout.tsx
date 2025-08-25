'use client'

import { memo } from 'react'
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarNavigation, 
  SidebarFooter 
} from '@/components/ui/sidebar'

const navigationItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: 'home'
  },
  {
    href: '/dashboard/budget',
    label: 'Budget & Tracking',
    icon: 'wallet'
  },
  {
    href: '/dashboard/guests',
    label: 'Guest Management',
    icon: 'users'
  },
  {
    href: '/dashboard/planning',
    label: 'Planning & Tasks',
    icon: 'calendar'
  },
  {
    href: '/dashboard/communication',
    label: 'Communication',
    icon: 'message-circle'
  },
  {
    href: '/dashboard/contacts',
    label: 'Contacts',
    icon: 'phone'
  },
  {
    href: '/dashboard/documents',
    label: 'Documents & Files',
    icon: 'folder'
  }
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default memo(function DashboardLayout({ 
  children 
}: DashboardLayoutProps) {
  return (
    <div className="h-screen flex">
      <Sidebar>
        <SidebarHeader />
        <SidebarNavigation items={navigationItems} />
        <SidebarFooter />
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
})
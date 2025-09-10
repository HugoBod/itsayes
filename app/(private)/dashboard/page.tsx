import { Card } from '@/components/ui/card'
import { Icon, IconName } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

const stats: Array<{
  title: string
  value: string
  icon: IconName
  description: string
}> = [
  {
    title: 'Total Budget',
    value: '€ 0',
    icon: 'wallet',
    description: 'Budget not set yet'
  },
  {
    title: 'Guests',
    value: '0',
    icon: 'users',
    description: 'Guest list empty'
  },
  {
    title: 'Tasks',
    value: '0',
    icon: 'checkCircle',
    description: 'No tasks created'
  },
  {
    title: 'Days Until Wedding',
    value: '-',
    icon: 'calendar',
    description: 'Date not set'
  }
]

const quickActions: Array<{
  title: string
  description: string
  href: string
  icon: IconName
  color: string
}> = [
  {
    title: 'Set Your Budget',
    description: 'Define your wedding budget and track expenses',
    href: '/dashboard/budget',
    icon: 'wallet',
    color: 'bg-blue-500'
  },
  {
    title: 'Add Guests',
    description: 'Create your guest list and manage invitations',
    href: '/dashboard/guests',
    icon: 'users',
    color: 'bg-green-500'
  },
  {
    title: 'Plan Tasks',
    description: 'Organize your wedding planning timeline',
    href: '/dashboard/planning',
    icon: 'calendar',
    color: 'bg-purple-500'
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to Your Wedding Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Start planning your perfect wedding day
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className="p-2 bg-muted rounded-lg">
                <Icon name={stat.icon} className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Card key={action.title} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <Icon name={action.icon} className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button asChild size="sm">
                    <a href={action.href}>Get Started</a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <Card className="p-6">
          <div className="text-center py-12">
            <Icon name="activity" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No activity yet. Start planning to see your recent actions here.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
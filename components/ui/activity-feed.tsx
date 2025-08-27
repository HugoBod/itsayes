import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'
import { useActivityLog } from '@/hooks/useActivityLog'

interface Activity {
  id: string
  action: string
  entityType: string
  description: string
  timestamp: string
}

interface ActivityFeedProps {
  workspaceId: string
  limit?: number
  className?: string
}

const getActivityIcon = (action: string, entityType: string) => {
  if (action === 'create') {
    switch (entityType) {
      case 'expense': return 'plus'
      case 'guest': return 'user-plus'
      case 'task': return 'plus'
      default: return 'plus'
    }
  }
  if (action === 'update') return 'edit'
  if (action === 'delete') return 'trash'
  if (action === 'complete') return 'check'
  return 'activity'
}

const getActivityColor = (action: string) => {
  switch (action) {
    case 'create': return 'text-green-600'
    case 'update': return 'text-blue-600'
    case 'delete': return 'text-red-600'
    case 'complete': return 'text-purple-600'
    default: return 'text-gray-600'
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

export const ActivityFeed = memo(function ActivityFeed({ 
  workspaceId, 
  limit = 10,
  className 
}: ActivityFeedProps) {
  const { activities, loading, error } = useActivityLog()

  // Take only the requested number of activities
  const displayActivities = activities.slice(0, limit)

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="flex items-center justify-center">
            <Icon name="loader" className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-red-500">
          <Icon name="alert-triangle" className="h-6 w-6 mx-auto mb-2" />
          <p className="text-sm">Failed to load activity feed</p>
        </div>
      </Card>
    )
  }

  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <Icon name="activity" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent activity</p>
          <p className="text-sm text-muted-foreground">Start planning to see your actions here</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      
      <div className="divide-y">
        {displayActivities.map((activity) => {
          const icon = getActivityIcon(activity.action, activity.entityType)
          const color = getActivityColor(activity.action)
          
          return (
            <div key={activity.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full bg-gray-100 ${color}`}>
                  <Icon name={icon} className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
})
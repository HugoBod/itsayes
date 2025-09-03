import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Icon } from '@/components/ui/icons'

interface TaskStatsProps {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  urgentTasks: number
  overdueTasks: number
  completionPercentage: number
}

export const TaskStats = memo(function TaskStats({
  totalTasks,
  completedTasks,
  inProgressTasks,
  urgentTasks,
  overdueTasks,
  completionPercentage
}: TaskStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="clipboard-list" className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold">{totalTasks}</p>
            <p className="text-sm text-gray-600">Total Tasks</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="check-circle" className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold">{completedTasks}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="clock" className="h-8 w-8 text-yellow-600" />
          <div>
            <p className="text-2xl font-bold">{inProgressTasks}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="alert-triangle" className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-2xl font-bold">{urgentTasks}</p>
            <p className="text-sm text-gray-600">Urgent</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="calendar-x" className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-2xl font-bold">{overdueTasks}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:col-span-2 lg:col-span-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">Overall Progress</p>
            <span className="text-sm text-gray-600">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </Card>
    </div>
  )
})
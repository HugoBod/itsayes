import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'completed'
  category: string
  dueDate?: string
  assignedTo?: string
  notes?: string
}

interface TaskCardProps {
  task: Task
  itemId: string
  onStatusChange: (itemId: string, status: Task['status']) => void
  onPriorityChange: (itemId: string, priority: Task['priority']) => void
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
]

const statusOptions = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
]

export const TaskCard = memo(function TaskCard({
  task,
  itemId,
  onStatusChange,
  onPriorityChange
}: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
  const priorityOption = priorityOptions.find(p => p.value === task.priority)
  const statusOption = statusOptions.find(s => s.value === task.status)

  return (
    <Card className={`p-4 ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={statusOption?.color}>
              {statusOption?.label}
            </Badge>
            <Badge className={priorityOption?.color}>
              {priorityOption?.label}
            </Badge>
            <Badge variant="outline">{task.category}</Badge>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800">
                <Icon name="alert-triangle" className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
          {task.dueDate && (
            <p className="text-sm text-gray-500 mb-2">
              <Icon name="calendar" className="h-4 w-4 inline mr-1" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
          {task.notes && (
            <p className="text-sm text-gray-600 italic">{task.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(itemId, e.target.value as Task['status'])}
            className="text-xs px-2 py-1 border rounded"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={task.priority}
            onChange={(e) => onPriorityChange(itemId, e.target.value as Task['priority'])}
            className="text-xs px-2 py-1 border rounded"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  )
})
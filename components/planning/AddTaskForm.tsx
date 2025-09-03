import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'

interface Task {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  dueDate: string
  notes: string
}

interface AddTaskFormProps {
  isVisible: boolean
  formData: Task
  onFormChange: (field: keyof Task, value: string) => void
  onSubmit: () => void
  onCancel: () => void
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

const defaultCategories = [
  'Venue & Location',
  'Catering & Menu',
  'Photography & Video',
  'Music & Entertainment',
  'Decoration & Flowers',
  'Attire & Beauty',
  'Transportation',
  'Legal & Documents',
  'Invitations',
  'Other'
]

export const AddTaskForm = memo(function AddTaskForm({
  isVisible,
  formData,
  onFormChange,
  onSubmit,
  onCancel
}: AddTaskFormProps) {
  if (!isVisible) return null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add New Task</h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <Icon name="x" className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taskTitle">Title *</Label>
          <Input
            id="taskTitle"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="Enter task title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskCategory">Category</Label>
          <select
            id="taskCategory"
            value={formData.category}
            onChange={(e) => onFormChange('category', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {defaultCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskPriority">Priority</Label>
          <select
            id="taskPriority"
            value={formData.priority}
            onChange={(e) => onFormChange('priority', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="taskDueDate">Due Date</Label>
          <Input
            id="taskDueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => onFormChange('dueDate', e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="taskDescription">Description</Label>
          <Input
            id="taskDescription"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Brief description of the task"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="taskNotes">Notes</Label>
          <Input
            id="taskNotes"
            value={formData.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            placeholder="Additional notes or requirements"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!formData.title}>
          Add Task
        </Button>
      </div>
    </Card>
  )
})
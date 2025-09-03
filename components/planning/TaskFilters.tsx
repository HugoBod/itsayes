import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icons'

interface TaskFiltersProps {
  filterStatus: string
  filterPriority: string
  filterCategory: string
  sortBy: 'dueDate' | 'priority' | 'created'
  onFilterStatusChange: (status: string) => void
  onFilterPriorityChange: (priority: string) => void
  onFilterCategoryChange: (category: string) => void
  onSortByChange: (sortBy: 'dueDate' | 'priority' | 'created') => void
  onAddClick: () => void
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' }
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

export const TaskFilters = memo(function TaskFilters({
  filterStatus,
  filterPriority,
  filterCategory,
  sortBy,
  onFilterStatusChange,
  onFilterPriorityChange,
  onFilterCategoryChange,
  onSortByChange,
  onAddClick
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex flex-wrap gap-2">
        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Status</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => onFilterPriorityChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Priority</option>
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {defaultCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'dueDate' | 'priority' | 'created')}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="dueDate">Sort by Due Date</option>
          <option value="priority">Sort by Priority</option>
          <option value="created">Sort by Created</option>
        </select>
      </div>

      <Button onClick={onAddClick} className="flex items-center space-x-2">
        <Icon name="plus" className="h-4 w-4" />
        <span>Add Task</span>
      </Button>
    </div>
  )
})
'use client'

import { memo, useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'
import { TaskStats } from '@/components/planning/TaskStats'
import { TaskFilters } from '@/components/planning/TaskFilters'
import { TaskCard } from '@/components/planning/TaskCard'
import { AddTaskForm } from '@/components/planning/AddTaskForm'

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

export default memo(function PlanningPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { items, loading: itemsLoading, actions } = useItems()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate')
  
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    category: 'Other',
    dueDate: '',
    notes: ''
  })

  // Filter items to show only task type
  const taskItems = items.filter(item => item.type === 'task')

  // Apply filters and sorting
  const filteredAndSortedTasks = taskItems
    .filter(item => {
      const data = item.data as unknown as Task
      const matchesStatus = !filterStatus || data.status === filterStatus
      const matchesPriority = !filterPriority || data.priority === filterPriority
      const matchesCategory = !filterCategory || data.category === filterCategory
      
      return matchesStatus && matchesPriority && matchesCategory
    })
    .sort((a, b) => {
      const dataA = a.data as unknown as Task
      const dataB = b.data as unknown as Task
      
      if (sortBy === 'dueDate') {
        if (!dataA.dueDate && !dataB.dueDate) return 0
        if (!dataA.dueDate) return 1
        if (!dataB.dueDate) return -1
        return new Date(dataA.dueDate).getTime() - new Date(dataB.dueDate).getTime()
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[dataB.priority] - priorityOrder[dataA.priority]
      } else {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
    })

  // Calculate stats
  const totalTasks = taskItems.length
  const completedTasks = taskItems.filter(item => (item.data as unknown as Task).status === 'completed').length
  const inProgressTasks = taskItems.filter(item => (item.data as unknown as Task).status === 'in_progress').length
  const urgentTasks = taskItems.filter(item => (item.data as unknown as Task).priority === 'urgent').length
  const overdueTasks = taskItems.filter(item => {
    const data = item.data as unknown as Task
    return data.dueDate && new Date(data.dueDate) < new Date() && data.status !== 'completed'
  }).length

  useEffect(() => {
    if (workspace) {
      actions.fetchItems(workspace.id, 'task')
    }
  }, [workspace])

  const handleAddTask = async () => {
    if (!workspace || !newTaskForm.title) return

    try {
      // Get default board ID (planning board)
      const boardId = 'planning-board-id' // This should come from boards table

      await actions.createItem({
        title: newTaskForm.title,
        type: 'task',
        workspace_id: workspace.id,
        board_id: boardId,
        due_date: newTaskForm.dueDate || null,
        data: {
          title: newTaskForm.title,
          description: newTaskForm.description,
          priority: newTaskForm.priority,
          status: 'todo',
          category: newTaskForm.category,
          dueDate: newTaskForm.dueDate,
          notes: newTaskForm.notes
        }
      })

      // Reset form
      setNewTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Other',
        dueDate: '',
        notes: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  const updateTaskStatus = async (itemId: string, status: Task['status']) => {
    const item = taskItems.find(i => i.id === itemId)
    if (!item) return

    try {
      const currentData = item.data as unknown as Task
      await actions.updateItem(itemId, {
        data: {
          ...currentData,
          status
        }
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const updateTaskPriority = async (itemId: string, priority: Task['priority']) => {
    const item = taskItems.find(i => i.id === itemId)
    if (!item) return

    try {
      const currentData = item.data as unknown as Task
      await actions.updateItem(itemId, {
        data: {
          ...currentData,
          priority
        }
      })
    } catch (error) {
      console.error('Failed to update task priority:', error)
    }
  }

  const handleFormChange = (field: keyof typeof newTaskForm, value: string) => {
    setNewTaskForm(prev => ({ ...prev, [field]: value }))
  }

  if (workspaceLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="loader" className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Wedding Planning</h1>
        <p className="text-gray-600 mt-1">
          Organize and track all your wedding planning tasks
        </p>
      </div>

      {/* Stats */}
      <TaskStats
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        inProgressTasks={inProgressTasks}
        urgentTasks={urgentTasks}
        overdueTasks={overdueTasks}
        completionPercentage={completionPercentage}
      />

      {/* Filters and Add Button */}
      <TaskFilters
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        filterCategory={filterCategory}
        sortBy={sortBy}
        onFilterStatusChange={setFilterStatus}
        onFilterPriorityChange={setFilterPriority}
        onFilterCategoryChange={setFilterCategory}
        onSortByChange={setSortBy}
        onAddClick={() => setShowAddForm(true)}
      />

      {/* Add Task Form */}
      <AddTaskForm
        isVisible={showAddForm}
        formData={newTaskForm}
        onFormChange={handleFormChange}
        onSubmit={handleAddTask}
        onCancel={() => setShowAddForm(false)}
      />

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Icon name="clipboard-list" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first wedding planning task
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedTasks.map((item) => (
              <TaskCard
                key={item.id}
                task={item.data as unknown as Task}
                itemId={item.id}
                onStatusChange={updateTaskStatus}
                onPriorityChange={updateTaskPriority}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
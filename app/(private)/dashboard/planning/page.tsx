'use client'

import { memo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'

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
      const data = item.data as Task
      const matchesStatus = !filterStatus || data.status === filterStatus
      const matchesPriority = !filterPriority || data.priority === filterPriority
      const matchesCategory = !filterCategory || data.category === filterCategory
      
      return matchesStatus && matchesPriority && matchesCategory
    })
    .sort((a, b) => {
      const dataA = a.data as Task
      const dataB = b.data as Task
      
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
      await actions.updateItem(itemId, {
        data: {
          ...item.data,
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
      await actions.updateItem(itemId, {
        data: {
          ...item.data,
          priority
        }
      })
    } catch (error) {
      console.error('Failed to update task priority:', error)
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planning & Tasks</h1>
          <p className="text-muted-foreground">Organize your wedding timeline</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{totalTasks}</p>
            </div>
            <Icon name="clipboard-list" className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <Icon name="check-circle" className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
            </div>
            <Icon name="clock" className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent</p>
              <p className="text-2xl font-bold text-red-600">{urgentTasks}</p>
            </div>
            <Icon name="alert-triangle" className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-orange-600">{overdueTasks}</p>
            </div>
            <Icon name="calendar-x" className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{completionPercentage.toFixed(1)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Add Task Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Task</h3>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                <Icon name="x" className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Book wedding venue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newTaskForm.category}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {priorityOptions.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newTaskForm.notes}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTask}>
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters and Sort */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Categories</option>
            {defaultCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Sort by:</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created Date</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Tasks ({filteredAndSortedTasks.length}/{totalTasks})
          </h3>
        </div>
        
        {filteredAndSortedTasks.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="clipboard-list" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {totalTasks === 0 ? "No tasks created yet" : "No tasks match your filters"}
            </p>
            {totalTasks === 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(true)}
                className="mt-4"
              >
                Create Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredAndSortedTasks.map((item) => {
              const data = item.data as Task
              const priority = priorityOptions.find(p => p.value === data.priority)
              const status = statusOptions.find(s => s.value === data.status)
              const isOverdue = data.dueDate && new Date(data.dueDate) < new Date() && data.status !== 'completed'
              
              return (
                <div key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <button
                        onClick={() => updateTaskStatus(item.id, data.status === 'completed' ? 'todo' : 'completed')}
                        className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          data.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {data.status === 'completed' && <Icon name="check" className="h-3 w-3" />}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`font-medium ${data.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {data.title}
                          </h4>
                          
                          {isOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        {data.description && (
                          <p className="text-sm text-muted-foreground mb-2">{data.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="folder" className="h-3 w-3" />
                            {data.category}
                          </span>
                          
                          {data.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                              <Icon name="calendar" className="h-3 w-3" />
                              {new Date(data.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {data.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{data.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {priority && (
                        <select
                          value={data.priority}
                          onChange={(e) => updateTaskPriority(item.id, e.target.value as Task['priority'])}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 ${priority.color}`}
                        >
                          {priorityOptions.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      )}
                      
                      {status && data.status !== 'completed' && (
                        <select
                          value={data.status}
                          onChange={(e) => updateTaskStatus(item.id, e.target.value as Task['status'])}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 ${status.color}`}
                        >
                          {statusOptions.filter(s => s.value !== 'completed').map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
})
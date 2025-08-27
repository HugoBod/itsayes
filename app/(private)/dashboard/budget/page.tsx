'use client'

import { memo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'

interface BudgetItem {
  id: string
  title: string
  budgeted: number
  actual: number
  category: string
  notes?: string
}

const defaultCategories = [
  { name: 'Venue', color: 'bg-blue-500' },
  { name: 'Catering', color: 'bg-green-500' },
  { name: 'Photography', color: 'bg-purple-500' },
  { name: 'Decoration', color: 'bg-pink-500' },
  { name: 'Music', color: 'bg-yellow-500' },
  { name: 'Attire', color: 'bg-red-500' },
  { name: 'Transportation', color: 'bg-indigo-500' },
  { name: 'Other', color: 'bg-gray-500' }
]

export default memo(function BudgetPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { items, loading: itemsLoading, actions } = useItems()
  
  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    budgeted: '',
    category: 'Other',
    notes: ''
  })

  // Filter items to show only expense type
  const expenseItems = items.filter(item => item.type === 'expense')

  // Calculate totals
  const totalBudgeted = expenseItems.reduce((sum, item) => {
    const data = item.data as any
    return sum + (data?.budgeted || 0)
  }, 0)

  const totalActual = expenseItems.reduce((sum, item) => {
    const data = item.data as any
    return sum + (data?.actual || 0)
  }, 0)

  useEffect(() => {
    if (workspace) {
      actions.fetchItems(workspace.id, 'expense')
      // Subscribe to real-time updates for expenses
      actions.subscribe(workspace.id, 'expense')
      
      // Get total budget from workspace onboarding data
      const onboardingData = workspace.onboarding_data_couple as any
      if (onboardingData?.step_2?.budget) {
        setTotalBudget(onboardingData.step_2.budget)
      }
    }

    // Cleanup subscription on unmount
    return () => {
      actions.unsubscribe()
    }
  }, [workspace])

  const handleAddItem = async () => {
    if (!workspace || !newItemForm.title || !newItemForm.budgeted) return

    try {
      // Get default board ID (budget board)
      // Note: In a real implementation, you'd fetch the actual board ID
      const boardId = 'budget-board-id' // This should come from boards table

      await actions.createItem({
        title: newItemForm.title,
        type: 'expense',
        workspace_id: workspace.id,
        board_id: boardId,
        data: {
          budgeted: parseFloat(newItemForm.budgeted),
          actual: 0,
          category: newItemForm.category,
          notes: newItemForm.notes
        }
      })

      // Reset form
      setNewItemForm({ title: '', budgeted: '', category: 'Other', notes: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add budget item:', error)
    }
  }

  const updateItemActual = async (itemId: string, actual: number) => {
    const item = expenseItems.find(i => i.id === itemId)
    if (!item) return

    try {
      await actions.updateItem(itemId, {
        data: {
          ...(item.data as object),
          actual
        }
      })
    } catch (error) {
      console.error('Failed to update actual cost:', error)
    }
  }

  if (workspaceLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="loader" className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const remainingBudget = totalBudget - totalActual
  const budgetUsedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget & Tracking</h1>
          <p className="text-muted-foreground">Manage your wedding expenses</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Icon name="plus" className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">€ {totalBudget.toLocaleString()}</p>
            </div>
            <Icon name="wallet" className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Budgeted</p>
              <p className="text-2xl font-bold">€ {totalBudgeted.toLocaleString()}</p>
            </div>
            <Icon name="target" className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Actual Spent</p>
              <p className="text-2xl font-bold">€ {totalActual.toLocaleString()}</p>
            </div>
            <Icon name="credit-card" className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                € {remainingBudget.toLocaleString()}
              </p>
            </div>
            <Icon 
              name={remainingBudget < 0 ? "alert-triangle" : "check-circle"} 
              className={`h-8 w-8 ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`} 
            />
          </div>
        </Card>
      </div>

      {/* Budget Progress Bar */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Budget Usage</span>
            <span>{budgetUsedPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                budgetUsedPercent > 100 ? 'bg-red-500' : 
                budgetUsedPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Add Expense Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Expense</h3>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                <Icon name="x" className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Expense Title</Label>
                <Input
                  id="title"
                  value={newItemForm.title}
                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                  placeholder="e.g. Venue booking"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgeted">Budgeted Amount (€)</Label>
                <Input
                  id="budgeted"
                  type="number"
                  value={newItemForm.budgeted}
                  onChange={(e) => setNewItemForm({ ...newItemForm, budgeted: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newItemForm.category}
                  onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {defaultCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={newItemForm.notes}
                  onChange={(e) => setNewItemForm({ ...newItemForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddItem}>
                Add Expense
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Expense Items</h3>
        </div>
        
        {expenseItems.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="wallet" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No expenses added yet</p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {expenseItems.map((item) => {
              const data = item.data as any
              const category = defaultCategories.find(cat => cat.name === data.category)
              const variance = (data.actual || 0) - (data.budgeted || 0)
              
              return (
                <div key={item.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${category?.color || 'bg-gray-500'}`} />
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{data.category}</p>
                        {data.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{data.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Budgeted</p>
                        <p className="font-medium">€ {(data.budgeted || 0).toLocaleString()}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Actual</p>
                        <Input
                          type="number"
                          value={data.actual || 0}
                          onChange={(e) => updateItemActual(item.id, parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                        />
                      </div>
                      
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-muted-foreground">Variance</p>
                        <p className={`font-medium ${variance > 0 ? 'text-red-500' : variance < 0 ? 'text-green-500' : ''}`}>
                          {variance !== 0 && (variance > 0 ? '+' : '')}€ {variance.toLocaleString()}
                        </p>
                      </div>
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
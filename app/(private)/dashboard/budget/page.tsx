'use client'

import { memo, useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'
import { BudgetStats } from '@/components/budget/BudgetStats'
import { BudgetFilters } from '@/components/budget/BudgetFilters'
import { BudgetCard } from '@/components/budget/BudgetCard'
import { AddBudgetForm } from '@/components/budget/AddBudgetForm'

interface BudgetItem {
  id: string
  title: string
  description?: string
  amount: number
  category: string
  status: 'pending' | 'paid' | 'overdue'
  dueDate?: string
  vendor?: string
  notes?: string
}

export default memo(function BudgetPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { items, loading: itemsLoading, actions } = useItems()
  
  const [totalBudget, setTotalBudget] = useState<number>(50000) // Default budget
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState<'amount' | 'dueDate' | 'created'>('amount')
  
  const [newItemForm, setNewItemForm] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'Other',
    dueDate: '',
    vendor: '',
    notes: ''
  })

  // Filter items to show only expense type
  const expenseItems = items.filter(item => item.type === 'expense')

  // Apply filters and sorting
  const filteredAndSortedItems = expenseItems
    .filter(item => {
      const data = item.data as unknown as BudgetItem
      const matchesCategory = !filterCategory || data.category === filterCategory
      const matchesStatus = !filterStatus || data.status === filterStatus
      
      return matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const dataA = a.data as unknown as BudgetItem
      const dataB = b.data as unknown as BudgetItem
      
      if (sortBy === 'amount') {
        return dataB.amount - dataA.amount
      } else if (sortBy === 'dueDate') {
        if (!dataA.dueDate && !dataB.dueDate) return 0
        if (!dataA.dueDate) return 1
        if (!dataB.dueDate) return -1
        return new Date(dataA.dueDate).getTime() - new Date(dataB.dueDate).getTime()
      } else {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      }
    })

  // Calculate stats
  const totalSpent = expenseItems.reduce((sum, item) => {
    const data = item.data as unknown as BudgetItem
    return sum + (data.amount || 0)
  }, 0)
  
  const remainingBudget = totalBudget - totalSpent
  const totalItems = expenseItems.length
  const paidItems = expenseItems.filter(item => (item.data as unknown as BudgetItem).status === 'paid').length

  useEffect(() => {
    if (workspace) {
      actions.fetchItems(workspace.id, 'expense')
    }
  }, [workspace])

  const handleAddItem = async () => {
    if (!workspace || !newItemForm.title || !newItemForm.amount) return

    try {
      const boardId = 'budget-board-id' // This should come from boards table
      const amount = parseFloat(newItemForm.amount)

      await actions.createItem({
        title: newItemForm.title,
        type: 'expense',
        workspace_id: workspace.id,
        board_id: boardId,
        due_date: newItemForm.dueDate || null,
        data: {
          title: newItemForm.title,
          description: newItemForm.description,
          amount,
          category: newItemForm.category,
          status: 'pending',
          dueDate: newItemForm.dueDate,
          vendor: newItemForm.vendor,
          notes: newItemForm.notes
        }
      })

      // Reset form
      setNewItemForm({
        title: '',
        description: '',
        amount: '',
        category: 'Other',
        dueDate: '',
        vendor: '',
        notes: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add budget item:', error)
    }
  }

  const updateItemStatus = async (itemId: string, status: BudgetItem['status']) => {
    const item = expenseItems.find(i => i.id === itemId)
    if (!item) return

    try {
      const currentData = item.data as unknown as BudgetItem
      await actions.updateItem(itemId, {
        data: {
          ...currentData,
          status
        }
      })
    } catch (error) {
      console.error('Failed to update item status:', error)
    }
  }

  const handleFormChange = (field: keyof typeof newItemForm, value: string) => {
    setNewItemForm(prev => ({ ...prev, [field]: value }))
  }

  if (workspaceLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="loader" className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600 mt-1">
          Track your wedding expenses and stay within budget
        </p>
      </div>

      {/* Stats */}
      <BudgetStats
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        remainingBudget={remainingBudget}
        totalItems={totalItems}
        paidItems={paidItems}
      />

      {/* Filters and Add Button */}
      <BudgetFilters
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        sortBy={sortBy}
        onFilterCategoryChange={setFilterCategory}
        onFilterStatusChange={setFilterStatus}
        onSortByChange={setSortBy}
        onAddClick={() => setShowAddForm(true)}
      />

      {/* Add Budget Form */}
      <AddBudgetForm
        isVisible={showAddForm}
        formData={newItemForm}
        onFormChange={handleFormChange}
        onSubmit={handleAddItem}
        onCancel={() => setShowAddForm(false)}
      />

      {/* Budget Items List */}
      <div className="space-y-4">
        {filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Icon name="wallet" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budget items yet</h3>
            <p className="text-gray-600 mb-4">
              Start tracking your wedding expenses
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedItems.map((item) => (
              <BudgetCard
                key={item.id}
                item={item.data as unknown as BudgetItem}
                itemId={item.id}
                onStatusChange={updateItemStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
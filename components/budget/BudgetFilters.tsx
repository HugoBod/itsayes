import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icons'

interface BudgetFiltersProps {
  filterCategory: string
  filterStatus: string
  sortBy: 'amount' | 'dueDate' | 'created'
  onFilterCategoryChange: (category: string) => void
  onFilterStatusChange: (status: string) => void
  onSortByChange: (sortBy: 'amount' | 'dueDate' | 'created') => void
  onAddClick: () => void
}

const budgetCategories = [
  'Venue & Reception',
  'Catering',
  'Photography',
  'Attire',
  'Flowers & Decoration',
  'Music & Entertainment',
  'Transportation',
  'Invitations',
  'Other'
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' }
]

export const BudgetFilters = memo(function BudgetFilters({
  filterCategory,
  filterStatus,
  sortBy,
  onFilterCategoryChange,
  onFilterStatusChange,
  onSortByChange,
  onAddClick
}: BudgetFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex flex-wrap gap-2">
        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {budgetCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

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

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'amount' | 'dueDate' | 'created')}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="amount">Sort by Amount</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="created">Sort by Created</option>
        </select>
      </div>

      <Button onClick={onAddClick} className="flex items-center space-x-2">
        <Icon name="plus" className="h-4 w-4" />
        <span>Add Expense</span>
      </Button>
    </div>
  )
})
import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'

interface BudgetItem {
  title: string
  description: string
  amount: string
  category: string
  dueDate: string
  vendor: string
  notes: string
}

interface AddBudgetFormProps {
  isVisible: boolean
  formData: BudgetItem
  onFormChange: (field: keyof BudgetItem, value: string) => void
  onSubmit: () => void
  onCancel: () => void
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

export const AddBudgetForm = memo(function AddBudgetForm({
  isVisible,
  formData,
  onFormChange,
  onSubmit,
  onCancel
}: AddBudgetFormProps) {
  if (!isVisible) return null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add Budget Item</h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <Icon name="x" className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budgetTitle">Title *</Label>
          <Input
            id="budgetTitle"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            placeholder="Wedding venue deposit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetAmount">Amount *</Label>
          <Input
            id="budgetAmount"
            type="number"
            value={formData.amount}
            onChange={(e) => onFormChange('amount', e.target.value)}
            placeholder="5000"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetCategory">Category</Label>
          <select
            id="budgetCategory"
            value={formData.category}
            onChange={(e) => onFormChange('category', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {budgetCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetDueDate">Due Date</Label>
          <Input
            id="budgetDueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => onFormChange('dueDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetVendor">Vendor</Label>
          <Input
            id="budgetVendor"
            value={formData.vendor}
            onChange={(e) => onFormChange('vendor', e.target.value)}
            placeholder="Vendor or business name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budgetDescription">Description</Label>
          <Input
            id="budgetDescription"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            placeholder="Brief description"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="budgetNotes">Notes</Label>
          <Input
            id="budgetNotes"
            value={formData.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            placeholder="Additional notes or payment terms"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!formData.title || !formData.amount}>
          Add Item
        </Button>
      </div>
    </Card>
  )
})
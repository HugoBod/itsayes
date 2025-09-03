import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icons'

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

interface BudgetCardProps {
  item: BudgetItem
  itemId: string
  onStatusChange: (itemId: string, status: BudgetItem['status']) => void
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-800' }
]

export const BudgetCard = memo(function BudgetCard({
  item,
  itemId,
  onStatusChange
}: BudgetCardProps) {
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid'
  const statusOption = statusOptions.find(s => s.value === item.status)

  return (
    <Card className={`p-4 ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900">{item.title}</h3>
            <p className="text-lg font-bold text-gray-900">
              ${item.amount.toLocaleString()}
            </p>
          </div>
          
          {item.description && (
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={statusOption?.color}>
              {statusOption?.label}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
            {isOverdue && (
              <Badge className="bg-red-100 text-red-800">
                <Icon name="alert-triangle" className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
          
          {item.vendor && (
            <p className="text-sm text-gray-600 mb-1">
              <Icon name="briefcase" className="h-4 w-4 inline mr-1" />
              Vendor: {item.vendor}
            </p>
          )}
          
          {item.dueDate && (
            <p className="text-sm text-gray-500 mb-2">
              <Icon name="calendar" className="h-4 w-4 inline mr-1" />
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </p>
          )}
          
          {item.notes && (
            <p className="text-sm text-gray-600 italic">{item.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={item.status}
            onChange={(e) => onStatusChange(itemId, e.target.value as BudgetItem['status'])}
            className="text-xs px-2 py-1 border rounded"
          >
            {statusOptions.map(option => (
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
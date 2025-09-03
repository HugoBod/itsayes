import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Icon } from '@/components/ui/icons'

interface BudgetStatsProps {
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  totalItems: number
  paidItems: number
}

export const BudgetStats = memo(function BudgetStats({
  totalBudget,
  totalSpent,
  remainingBudget,
  totalItems,
  paidItems
}: BudgetStatsProps) {
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const isOverBudget = totalSpent > totalBudget

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="target" className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Budget</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="credit-card" className={`h-8 w-8 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
          <div>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="wallet" className={`h-8 w-8 ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`} />
          <div>
            <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : ''}`}>
              ${remainingBudget.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Remaining</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="check-circle" className="h-8 w-8 text-purple-600" />
          <div>
            <p className="text-2xl font-bold">{paidItems}/{totalItems}</p>
            <p className="text-sm text-gray-600">Items Paid</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:col-span-2 lg:col-span-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">Budget Usage</p>
            <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
              {Math.round(spentPercentage)}%
            </span>
          </div>
          <Progress 
            value={Math.min(spentPercentage, 100)} 
            className={`h-2 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`} 
          />
          {isOverBudget && (
            <p className="text-sm text-red-600 flex items-center mt-2">
              <Icon name="alert-triangle" className="h-4 w-4 mr-1" />
              Over budget by ${(totalSpent - totalBudget).toLocaleString()}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
})
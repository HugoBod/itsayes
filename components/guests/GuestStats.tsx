import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icons'

interface GuestStatsProps {
  totalGuests: number
  confirmedGuests: number
  pendingGuests: number
  declinedGuests: number
  plusOnes: number
}

export const GuestStats = memo(function GuestStats({
  totalGuests,
  confirmedGuests,
  pendingGuests,
  declinedGuests,
  plusOnes
}: GuestStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="users" className="h-8 w-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold">{totalGuests}</p>
            <p className="text-sm text-gray-600">Total Guests</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="check-circle" className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-2xl font-bold">{confirmedGuests}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="clock" className="h-8 w-8 text-yellow-600" />
          <div>
            <p className="text-2xl font-bold">{pendingGuests}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="x-circle" className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-2xl font-bold">{declinedGuests}</p>
            <p className="text-sm text-gray-600">Declined</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Icon name="user-plus" className="h-8 w-8 text-purple-600" />
          <div>
            <p className="text-2xl font-bold">{plusOnes}</p>
            <p className="text-sm text-gray-600">Plus Ones</p>
          </div>
        </div>
      </Card>
    </div>
  )
})
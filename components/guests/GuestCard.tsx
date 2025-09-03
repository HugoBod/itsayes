import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icons'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  category: 'bride' | 'groom' | 'family' | 'friends'
  status: 'invited' | 'confirmed' | 'declined' | 'pending'
  plusOne: boolean
  notes?: string
}

interface GuestCardProps {
  guest: Guest
  itemId: string
  onStatusChange: (itemId: string, status: Guest['status']) => void
}

const guestCategories = [
  { value: 'bride', label: "Bride's Side", color: 'bg-pink-100 text-pink-800' },
  { value: 'groom', label: "Groom's Side", color: 'bg-blue-100 text-blue-800' },
  { value: 'family', label: 'Family', color: 'bg-purple-100 text-purple-800' },
  { value: 'friends', label: 'Friends', color: 'bg-green-100 text-green-800' }
]

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'invited', label: 'Invited', color: 'bg-blue-100 text-blue-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-800' }
]

export const GuestCard = memo(function GuestCard({
  guest,
  itemId,
  onStatusChange
}: GuestCardProps) {
  const categoryOption = guestCategories.find(c => c.value === guest.category)
  const statusOption = statusOptions.find(s => s.value === guest.status)

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{guest.name}</h3>
          
          {guest.email && (
            <p className="text-sm text-gray-600 mb-1">
              <Icon name="mail" className="h-4 w-4 inline mr-1" />
              {guest.email}
            </p>
          )}
          
          {guest.phone && (
            <p className="text-sm text-gray-600 mb-2">
              <Icon name="phone" className="h-4 w-4 inline mr-1" />
              {guest.phone}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={statusOption?.color}>
              {statusOption?.label}
            </Badge>
            <Badge className={categoryOption?.color}>
              {categoryOption?.label}
            </Badge>
            {guest.plusOne && (
              <Badge variant="outline">
                <Icon name="user-plus" className="h-3 w-3 mr-1" />
                Plus One
              </Badge>
            )}
          </div>
          
          {guest.notes && (
            <p className="text-sm text-gray-600 italic">{guest.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <select
            value={guest.status}
            onChange={(e) => onStatusChange(itemId, e.target.value as Guest['status'])}
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
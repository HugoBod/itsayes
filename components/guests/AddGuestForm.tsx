import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'

interface Guest {
  name: string
  email: string
  phone: string
  category: 'bride' | 'groom' | 'family' | 'friends'
  plusOne: boolean
  notes: string
}

interface AddGuestFormProps {
  isVisible: boolean
  formData: Guest
  onFormChange: (field: keyof Guest, value: string | boolean) => void
  onSubmit: () => void
  onCancel: () => void
}

const guestCategories = [
  { value: 'bride', label: "Bride's Side" },
  { value: 'groom', label: "Groom's Side" },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' }
]

export const AddGuestForm = memo(function AddGuestForm({
  isVisible,
  formData,
  onFormChange,
  onSubmit,
  onCancel
}: AddGuestFormProps) {
  if (!isVisible) return null

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add New Guest</h3>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <Icon name="x" className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guestName">Name *</Label>
          <Input
            id="guestName"
            value={formData.name}
            onChange={(e) => onFormChange('name', e.target.value)}
            placeholder="Enter guest name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestCategory">Category</Label>
          <select
            id="guestCategory"
            value={formData.category}
            onChange={(e) => onFormChange('category', e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {guestCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestEmail">Email</Label>
          <Input
            id="guestEmail"
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            placeholder="guest@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guestPhone">Phone</Label>
          <Input
            id="guestPhone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="guestNotes">Notes</Label>
          <Input
            id="guestNotes"
            value={formData.notes}
            onChange={(e) => onFormChange('notes', e.target.value)}
            placeholder="Additional notes about dietary restrictions, etc."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.plusOne}
              onChange={(e) => onFormChange('plusOne', e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium">Allow Plus One</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!formData.name}>
          Add Guest
        </Button>
      </div>
    </Card>
  )
})
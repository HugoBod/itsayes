import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icons'

interface GuestFiltersProps {
  filterCategory: string
  filterStatus: string
  searchTerm: string
  onFilterCategoryChange: (category: string) => void
  onFilterStatusChange: (status: string) => void
  onSearchChange: (term: string) => void
  onAddClick: () => void
}

const guestCategories = [
  { value: 'bride', label: "Bride's Side" },
  { value: 'groom', label: "Groom's Side" },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' }
]

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'invited', label: 'Invited' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' }
]

export const GuestFilters = memo(function GuestFilters({
  filterCategory,
  filterStatus,
  searchTerm,
  onFilterCategoryChange,
  onFilterStatusChange,
  onSearchChange,
  onAddClick
}: GuestFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="">All Categories</option>
          {guestCategories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
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
      </div>

      <Button onClick={onAddClick} className="flex items-center space-x-2">
        <Icon name="user-plus" className="h-4 w-4" />
        <span>Add Guest</span>
      </Button>
    </div>
  )
})
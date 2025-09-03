'use client'

import { memo, useState, useEffect } from 'react'
import { Icon } from '@/components/ui/icons'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'
import { GuestStats } from '@/components/guests/GuestStats'
import { GuestFilters } from '@/components/guests/GuestFilters'
import { GuestCard } from '@/components/guests/GuestCard'
import { AddGuestForm } from '@/components/guests/AddGuestForm'

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

export default memo(function GuestsPage() {
  const { workspace, loading: workspaceLoading } = useWorkspace()
  const { items, loading: itemsLoading, actions } = useItems()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newGuestForm, setNewGuestForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'friends' as Guest['category'],
    plusOne: false,
    notes: ''
  })

  // Filter items to show only guest type
  const guestItems = items.filter(item => item.type === 'guest')

  // Apply filters and search
  const filteredGuests = guestItems.filter(item => {
    const data = item.data as unknown as Guest
    const matchesCategory = !filterCategory || data.category === filterCategory
    const matchesStatus = !filterStatus || data.status === filterStatus
    const matchesSearch = !searchTerm || 
      data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.phone?.includes(searchTerm)
    
    return matchesCategory && matchesStatus && matchesSearch
  })

  // Calculate stats
  const totalGuests = guestItems.length
  const confirmedGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'confirmed').length
  const pendingGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'pending').length
  const declinedGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'declined').length
  const plusOnes = guestItems.filter(item => (item.data as unknown as Guest).plusOne).length

  useEffect(() => {
    if (workspace) {
      actions.fetchItems(workspace.id, 'guest')
    }
  }, [workspace])

  const handleAddGuest = async () => {
    if (!workspace || !newGuestForm.name) return

    try {
      // Get default board ID (guests board)
      const boardId = 'guests-board-id' // This should come from boards table

      await actions.createItem({
        title: newGuestForm.name,
        type: 'guest',
        workspace_id: workspace.id,
        board_id: boardId,
        due_date: null,
        data: {
          name: newGuestForm.name,
          email: newGuestForm.email,
          phone: newGuestForm.phone,
          category: newGuestForm.category,
          status: 'pending',
          plusOne: newGuestForm.plusOne,
          notes: newGuestForm.notes
        }
      })

      // Reset form
      setNewGuestForm({
        name: '',
        email: '',
        phone: '',
        category: 'friends',
        plusOne: false,
        notes: ''
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add guest:', error)
    }
  }

  const updateGuestStatus = async (itemId: string, status: Guest['status']) => {
    const item = guestItems.find(i => i.id === itemId)
    if (!item) return

    try {
      const currentData = item.data as unknown as Guest
      await actions.updateItem(itemId, {
        data: {
          ...currentData,
          status
        }
      })
    } catch (error) {
      console.error('Failed to update guest status:', error)
    }
  }

  const handleFormChange = (field: keyof typeof newGuestForm, value: string | boolean) => {
    setNewGuestForm(prev => ({ ...prev, [field]: value }))
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
        <h1 className="text-2xl font-bold text-gray-900">Guest Management</h1>
        <p className="text-gray-600 mt-1">
          Manage your wedding guest list and track RSVPs
        </p>
      </div>

      {/* Stats */}
      <GuestStats
        totalGuests={totalGuests}
        confirmedGuests={confirmedGuests}
        pendingGuests={pendingGuests}
        declinedGuests={declinedGuests}
        plusOnes={plusOnes}
      />

      {/* Filters and Add Button */}
      <GuestFilters
        filterCategory={filterCategory}
        filterStatus={filterStatus}
        searchTerm={searchTerm}
        onFilterCategoryChange={setFilterCategory}
        onFilterStatusChange={setFilterStatus}
        onSearchChange={setSearchTerm}
        onAddClick={() => setShowAddForm(true)}
      />

      {/* Add Guest Form */}
      <AddGuestForm
        isVisible={showAddForm}
        formData={newGuestForm}
        onFormChange={handleFormChange}
        onSubmit={handleAddGuest}
        onCancel={() => setShowAddForm(false)}
      />

      {/* Guests List */}
      <div className="space-y-4">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Icon name="users" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No guests yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your guest list for your special day
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGuests.map((item) => (
              <GuestCard
                key={item.id}
                guest={item.data as unknown as Guest}
                itemId={item.id}
                onStatusChange={updateGuestStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
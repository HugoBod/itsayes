'use client'

import { memo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useItems } from '@/hooks/useItems'

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

  // Apply filters
  const filteredGuests = guestItems.filter(item => {
    const data = item.data as unknown as Guest
    const matchesSearch = !searchTerm || 
      data.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || data.category === filterCategory
    const matchesStatus = !filterStatus || data.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Calculate stats
  const totalGuests = guestItems.length
  const confirmedGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'confirmed').length
  const declinedGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'declined').length
  const pendingGuests = guestItems.filter(item => (item.data as unknown as Guest).status === 'pending').length
  const guestsWithPlusOne = guestItems.filter(item => (item.data as unknown as Guest).plusOne).length

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
      await actions.updateItem(itemId, {
        data: {
          ...(item.data as object),
          status
        }
      })
    } catch (error) {
      console.error('Failed to update guest status:', error)
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Guest Management</h1>
          <p className="text-muted-foreground">Manage your wedding guest list</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Icon name="user-plus" className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
              <p className="text-2xl font-bold">{totalGuests}</p>
            </div>
            <Icon name="users" className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{confirmedGuests}</p>
            </div>
            <Icon name="check-circle" className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Declined</p>
              <p className="text-2xl font-bold text-red-600">{declinedGuests}</p>
            </div>
            <Icon name="x-circle" className="h-8 w-8 text-red-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingGuests}</p>
            </div>
            <Icon name="clock" className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">With +1</p>
              <p className="text-2xl font-bold text-purple-600">{guestsWithPlusOne}</p>
            </div>
            <Icon name="user-plus" className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Add Guest Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Add New Guest</h3>
              <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                <Icon name="x" className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newGuestForm.name}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, name: e.target.value })}
                  placeholder="Guest full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuestForm.email}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, email: e.target.value })}
                  placeholder="guest@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newGuestForm.phone}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newGuestForm.category}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, category: e.target.value as Guest['category'] })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  {guestCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newGuestForm.notes}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="plusOne"
                  checked={newGuestForm.plusOne}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, plusOne: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <Label htmlFor="plusOne">Plus One (+1)</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddGuest}>
                Add Guest
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Categories</option>
            {guestCategories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Guests List */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            Guests ({filteredGuests.length}/{totalGuests})
          </h3>
        </div>
        
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="users" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {totalGuests === 0 ? "No guests added yet" : "No guests match your filters"}
            </p>
            {totalGuests === 0 && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(true)}
                className="mt-4"
              >
                Add Your First Guest
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredGuests.map((item) => {
              const data = item.data as unknown as Guest
              const category = guestCategories.find(cat => cat.value === data.category)
              const status = statusOptions.find(s => s.value === data.status)
              
              return (
                <div key={item.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="user" className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{data.name}</h4>
                          {data.plusOne && (
                            <Badge variant="secondary" className="text-xs">
                              +1
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {data.email && (
                            <span className="flex items-center gap-1">
                              <Icon name="mail" className="h-3 w-3" />
                              {data.email}
                            </span>
                          )}
                          {data.phone && (
                            <span className="flex items-center gap-1">
                              <Icon name="phone" className="h-3 w-3" />
                              {data.phone}
                            </span>
                          )}
                        </div>
                        
                        {data.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{data.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {category && (
                        <Badge className={category.color}>
                          {category.label}
                        </Badge>
                      )}
                      
                      <select
                        value={data.status}
                        onChange={(e) => updateGuestStatus(item.id, e.target.value as Guest['status'])}
                        className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                          status?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusOptions.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
})
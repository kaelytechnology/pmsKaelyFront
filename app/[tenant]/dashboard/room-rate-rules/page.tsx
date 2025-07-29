'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'
import { MoreHorizontal, Plus, Search, Eye, Edit, Trash2, Download, Upload } from 'lucide-react'
import { CreateRoomRateRuleDialog } from './components/create-room-rate-rule-dialog'
import { EditRoomRateRuleDialog } from './components/edit-room-rate-rule-dialog'
import { ViewRoomRateRuleDialog } from './components/view-room-rate-rule-dialog'

interface RoomRateRule {
  id: number
  code: string
  class: string
  room_type_name: string
  min_nights: number
  max_guests: number
  included_dinners?: number
  rule_text?: string
  is_active: boolean
  user_add: number
  user_edit?: number
  user_deleted?: number
  created_at: string
  updated_at: string
  deleted_at?: string
}

interface RoomRateRuleClass {
  class: string
  count: number
}

export default function RoomRateRulesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<RoomRateRule | null>(null)

  const queryClient = useQueryClient()

  // Get room rate rules
  const { data: roomRateRulesResponse, isLoading } = useQuery({
    queryKey: ['room-rate-rules', searchTerm, statusFilter, classFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('is_active', statusFilter)
      if (classFilter !== 'all') params.append('class', classFilter)
      
      const response = await api.get(`/api/pms/room-rate-rules?${params.toString()}`)
      return response.data
    },
  })

  // Get room rate rule classes
  const { data: roomRateRuleClasses } = useQuery<RoomRateRuleClass[]>({
    queryKey: ['room-rate-rule-classes'],
    queryFn: async () => {
      const response = await api.get('/api/pms/room-rate-rules/classes')
      return response.data.data || response.data
    },
  })

  const roomRateRules = roomRateRulesResponse?.data || []

  // Delete room rate rule mutation
  const deleteRoomRateRuleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/pms/room-rate-rules/${id}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Room rate rule deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['room-rate-rules'] })
      queryClient.invalidateQueries({ queryKey: ['room-rate-rule-classes'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete room rate rule')
    },
  })

  // Export room rate rules
  const exportRoomRateRules = async () => {
    try {
      const response = await api.get('/api/pms/room-rate-rules/export', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `room-rate-rules-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Room rate rules exported successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export room rate rules')
    }
  }

  const handleEdit = (rule: RoomRateRule) => {
    setSelectedRule(rule)
    setEditDialogOpen(true)
  }

  const handleView = (rule: RoomRateRule) => {
    setSelectedRule(rule)
    setViewDialogOpen(true)
  }

  const handleDelete = (rule: RoomRateRule) => {
    if (window.confirm(`Are you sure you want to delete the room rate rule "${rule.code}"?`)) {
      deleteRoomRateRuleMutation.mutate(rule.id)
    }
  }

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['room-rate-rules'] })
    queryClient.invalidateQueries({ queryKey: ['room-rate-rule-classes'] })
  }

  const filteredRules = roomRateRules.filter((rule: RoomRateRule) => {
    const matchesSearch = 
      rule.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.room_type_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'true' && rule.is_active) ||
      (statusFilter === 'false' && !rule.is_active)
    
    const matchesClass = classFilter === 'all' || rule.class === classFilter
    
    return matchesSearch && matchesStatus && matchesClass
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Rate Rules</h1>
          <p className="text-muted-foreground">
            Manage room rate rules and pricing configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportRoomRateRules}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room Rate Rule
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Rate Rules</CardTitle>
          <CardDescription>
            A list of all room rate rules in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code, class, or room type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {roomRateRuleClasses && Array.isArray(roomRateRuleClasses) && roomRateRuleClasses.length > 0 ? (
                  roomRateRuleClasses.map((ruleClass) => (
                    <SelectItem key={ruleClass.class} value={ruleClass.class}>
                      {ruleClass.class} ({ruleClass.count})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-classes" disabled>
                    No classes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Min Nights</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead>Dinners</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading room rate rules...
                    </TableCell>
                  </TableRow>
                ) : filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No room rate rules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule: RoomRateRule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.code}</TableCell>
                      <TableCell>{rule.class}</TableCell>
                      <TableCell>{rule.room_type_name}</TableCell>
                      <TableCell>{rule.min_nights}</TableCell>
                      <TableCell>{rule.max_guests}</TableCell>
                      <TableCell>{rule.included_dinners || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(rule)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(rule)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(rule)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredRules.length} of {roomRateRules.length} room rate rules
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateRoomRateRuleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refreshData}
      />

      {selectedRule && (
        <>
          <EditRoomRateRuleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            rule={selectedRule}
            onSuccess={refreshData}
          />
          <ViewRoomRateRuleDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            rule={selectedRule}
          />
        </>
      )}
    </div>
  )
}
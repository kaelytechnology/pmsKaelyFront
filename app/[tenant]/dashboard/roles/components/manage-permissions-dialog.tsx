'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'
import { Search, Shield } from 'lucide-react'

interface Permission {
  id: number
  name: string
  slug: string
  description?: string
}

interface RoleCategory {
  id: number
  name: string
  description?: string
}

interface Role {
  id: number
  name: string
  slug: string
  description?: string
  role_category_id?: number
  status: boolean
  user_add?: number
  user_edit?: number
  user_deleted?: number
  created_at: string
  updated_at: string
  deleted_at?: string
  roleCategory?: RoleCategory
  permissions: Permission[]
  userCount: number
}

interface ManagePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
  permissions: Permission[]
  onSuccess: () => void
}

export function ManagePermissionsDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSuccess,
}: ManagePermissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Get current role permissions
  const { data: rolePermissions, isLoading: isLoadingRolePermissions } = useQuery<Permission[]>({
    queryKey: ['role-permissions', role.id],
    queryFn: async () => {
      const response = await api.get(`/api/auth/roles/${role.id}/permissions`)
      return response.data.data || response.data
    },
    enabled: open && !!role.id,
  })

  useEffect(() => {
    if (rolePermissions && Array.isArray(rolePermissions)) {
      setSelectedPermissions(rolePermissions.map(p => p.id))
    }
  }, [rolePermissions])

  const assignPermissionsMutation = useMutation({
    mutationFn: async (permissionIds: number[]) => {
      const response = await api.post(`/api/auth/roles/${role.id}/permissions`, {
        permission_ids: permissionIds
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Permissions updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions')
    },
  })

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId]
      } else {
        return prev.filter(id => id !== permissionId)
      }
    })
  }

  const handleSelectAll = () => {
    setSelectedPermissions(filteredPermissions.map(p => p.id))
  }

  const handleDeselectAll = () => {
    setSelectedPermissions([])
  }

  const handleSubmit = () => {
    assignPermissionsMutation.mutate(selectedPermissions)
  }

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const category = permission.slug.split('.')[0] || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions - {role.name}
          </DialogTitle>
          <DialogDescription>
            Assign or remove permissions for this role. Changes will affect all users with this role.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
              >
                Deselect All
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedPermissions.length} of {permissions.length} selected
            </Badge>
          </div>
          
          {/* Permissions List */}
          <ScrollArea className="h-[400px] border rounded-md p-4">
            {isLoadingRolePermissions ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading permissions...
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-3">
                      {category.replace(/[-_]/g, ' ')}
                    </h4>
                    <div className="space-y-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(permission.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 space-y-1">
                            <Label 
                              htmlFor={`permission-${permission.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {permission.slug}
                              </Badge>
                            </div>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(groupedPermissions).indexOf(category) < Object.keys(groupedPermissions).length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
                
                {filteredPermissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No permissions found matching your search.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={assignPermissionsMutation.isPending}
          >
            {assignPermissionsMutation.isPending ? 'Updating...' : 'Update Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
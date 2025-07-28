'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'

interface Permission {
  id: number
  name: string
  slug: string
  description?: string
  module_id?: number
  created_at: string
  updated_at: string
}

interface Module {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  route?: string
  is_active: boolean
  parent_id?: number
  order?: number
  created_at: string
  updated_at: string
}

interface ManagePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: Module
  onSuccess: () => void
}

export function ManagePermissionsDialog({
  open,
  onOpenChange,
  module,
  onSuccess,
}: ManagePermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Get all permissions
  const { data: permissions } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get('/api/auth/permissions')
      return response.data.data || response.data
    },
    enabled: open,
  })

  // Get current module permissions
  const { data: modulePermissions } = useQuery<Permission[]>({
    queryKey: ['module-permissions', module.id],
    queryFn: async () => {
      const response = await api.get(`/api/auth/modules/${module.id}/permissions`)
      return response.data.data || response.data
    },
    enabled: open,
  })

  useEffect(() => {
    if (modulePermissions && Array.isArray(modulePermissions)) {
      setSelectedPermissions(modulePermissions.map(p => p.id))
    }
  }, [modulePermissions])

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissionIds: number[]) => {
      const response = await api.put(`/api/auth/modules/${module.id}/permissions`, {
        permission_ids: permissionIds
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Module permissions updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions')
    },
  })

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
    if (permissions && Array.isArray(permissions)) {
      setSelectedPermissions(permissions.map(p => p.id))
    }
  }

  const handleDeselectAll = () => {
    setSelectedPermissions([])
  }

  const handleSubmit = () => {
    updatePermissionsMutation.mutate(selectedPermissions)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Module Permissions</DialogTitle>
          <DialogDescription>
            Select permissions for the module: <strong>{module.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
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
          
          <ScrollArea className="h-[400px] border rounded-md p-4">
            {permissions && Array.isArray(permissions) && permissions.length > 0 ? (
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => 
                        handlePermissionToggle(permission.id, checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </Label>
                      {permission.description && (
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-mono">
                        {permission.slug}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No permissions available
              </div>
            )}
          </ScrollArea>
          
          <div className="text-sm text-muted-foreground">
            Selected: {selectedPermissions.length} permission(s)
          </div>
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
            type="button"
            onClick={handleSubmit}
            disabled={updatePermissionsMutation.isPending}
          >
            {updatePermissionsMutation.isPending ? 'Updating...' : 'Update Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
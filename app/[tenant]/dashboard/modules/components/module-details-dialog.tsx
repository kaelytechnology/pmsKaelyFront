'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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
  parent?: Module
  children?: Module[]
}

interface User {
  id: number
  name: string
  email: string
}

interface ModuleDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: Module
}

export function ModuleDetailsDialog({
  open,
  onOpenChange,
  module,
}: ModuleDetailsDialogProps) {
  // Get module permissions
  const { data: modulePermissions } = useQuery<Permission[]>({
    queryKey: ['module-permissions', module.id],
    queryFn: async () => {
      const response = await api.get(`/api/auth/modules/${module.id}/permissions`)
      return response.data.data || response.data
    },
    enabled: open,
  })

  // Get module children
  const { data: moduleChildren } = useQuery<Module[]>({
    queryKey: ['module-children', module.id],
    queryFn: async () => {
      const response = await api.get(`/api/auth/modules?parent_id=${module.id}`)
      return response.data.data || response.data
    },
    enabled: open,
  })

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: es
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {module.icon && (
              <span className="text-lg">{module.icon}</span>
            )}
            {module.name}
            <Badge variant={module.is_active ? 'default' : 'secondary'}>
              {module.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Module details and configuration
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">ID:</span>
                  <p>{module.id}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Slug:</span>
                  <p className="font-mono">{module.slug}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Route:</span>
                  <p className="font-mono">{module.route || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Order:</span>
                  <p>{module.order || 'Not specified'}</p>
                </div>
              </div>
              {module.description && (
                <div>
                  <span className="font-medium text-muted-foreground">Description:</span>
                  <p className="mt-1">{module.description}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Parent Module */}
            {module.parent && (
              <>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Parent Module</h3>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    {module.parent.icon && (
                      <span>{module.parent.icon}</span>
                    )}
                    <div>
                      <p className="font-medium">{module.parent.name}</p>
                      <p className="text-sm text-muted-foreground">{module.parent.slug}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Child Modules */}
            {moduleChildren && Array.isArray(moduleChildren) && moduleChildren.length > 0 && (
              <>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Child Modules ({moduleChildren.length})</h3>
                  <div className="space-y-2">
                    {moduleChildren.map((child) => (
                      <div key={child.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        {child.icon && (
                          <span>{child.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{child.name}</p>
                          <p className="text-sm text-muted-foreground">{child.slug}</p>
                        </div>
                        <Badge variant={child.is_active ? 'default' : 'secondary'} size="sm">
                          {child.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Permissions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Permissions ({modulePermissions?.length || 0})
              </h3>
              {modulePermissions && Array.isArray(modulePermissions) && modulePermissions.length > 0 ? (
                <div className="space-y-2">
                  {modulePermissions.map((permission) => (
                    <div key={permission.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{permission.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{permission.slug}</p>
                        </div>
                      </div>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No permissions assigned to this module
                </p>
              )}
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Timestamps</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Created:</span>
                  <p>{formatDate(module.created_at)}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Updated:</span>
                  <p>{formatDate(module.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Package,
  Eye,
  Settings,
} from 'lucide-react'
import { CreateModuleDialog } from './components/create-module-dialog'
import { EditModuleDialog } from './components/edit-module-dialog'
import { ViewModuleDialog } from './components/view-module-dialog'

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
  permissions_count?: number
}

interface ModulesResponse {
  data: Module[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

interface PageProps {
  params: {
    tenant: string
  }
}

export default function ModulesPage({ params }: PageProps) {
  const { tenant } = params
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: modulesResponse, isLoading } = useQuery<ModulesResponse>({
    queryKey: ['modules', tenant],
    queryFn: async () => {
      const response = await api.get(`/api/auth/modules`)
      return response.data
    },
  })

  const modules = modulesResponse?.data || []

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const response = await api.delete(`/api/auth/modules/${moduleId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', tenant] })
      toast.success('Module deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete module')
    },
  })

  const toggleModuleStatusMutation = useMutation({
    mutationFn: async ({ moduleId, isActive }: { moduleId: number; isActive: boolean }) => {
      const response = await api.put(`/api/auth/modules/${moduleId}`, {
        is_active: isActive
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', tenant] })
      toast.success('Module status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update module status')
    },
  })

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    module.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteModule = (moduleId: number, moduleName: string) => {
    if (confirm(`Are you sure you want to delete the "${moduleName}" module?`)) {
      deleteModuleMutation.mutate(moduleId)
    }
  }

  const handleEditModule = (module: Module) => {
    setSelectedModule(module)
    setIsEditDialogOpen(true)
  }

  const handleViewModule = (module: Module) => {
    setSelectedModule(module)
    setIsViewDialogOpen(true)
  }

  const handleToggleStatus = (module: Module) => {
    toggleModuleStatusMutation.mutate({
      moduleId: module.id,
      isActive: !module.is_active
    })
  }

  const getModuleIcon = (iconName?: string) => {
    if (!iconName) return <Package className="h-4 w-4 text-primary" />
    // You can extend this to handle different icon types
    return <Package className="h-4 w-4 text-primary" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">
            Manage system modules and their configurations
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
          <CardDescription>
            Manage system modules and their hierarchical structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No modules found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getModuleIcon(module.icon)}
                          <div>
                            <div className="font-medium">{module.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {module.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {module.parent ? (
                          <Badge variant="outline">{module.parent.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Root</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {module.route ? (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {module.route}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={module.is_active ? "default" : "secondary"}>
                          {module.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {module.order || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(module.updated_at).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => handleViewModule(module)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditModule(module)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Module
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(module)}>
                              <Settings className="mr-2 h-4 w-4" />
                              {module.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteModule(module.id, module.name)}
                              disabled={deleteModuleMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Module
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateModuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['modules', tenant] })
          setIsCreateDialogOpen(false)
        }}
      />

      {selectedModule && (
        <EditModuleDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          module={selectedModule}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['modules', tenant] })
            setIsEditDialogOpen(false)
            setSelectedModule(null)
          }}
        />
      )}

      {selectedModule && (
        <ViewModuleDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          module={selectedModule}
        />
      )}
    </div>
  )
}
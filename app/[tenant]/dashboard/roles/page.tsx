'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { api } from '@/lib/axios'
import { formatDateTime } from '@/lib/utils'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Users, Eye, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { CreateRoleDialog } from './components/create-role-dialog'
import { EditRoleDialog } from './components/edit-role-dialog'
import { ManagePermissionsDialog } from './components/manage-permissions-dialog'

interface RoleCategory {
  id: number
  name: string
  description?: string
}

interface Role {
  id: number
  name: string
  code?: string
  description?: string
  status: number
  created_at: string
  updated_at: string
  permissions: Permission[]
  permissions_count: number
}

interface RolesResponse {
  data: Role[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
}

interface Permission {
  id: number
  name: string
  slug: string
  description?: string
}

interface User {
  id: number
  name: string
  email: string
}

interface PageProps {
  params: {
    tenant: string
  }
}

export default function RolesPage({ params }: PageProps) {
  const { tenant } = params
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: rolesResponse, isLoading } = useQuery<RolesResponse>({
    queryKey: ['roles', tenant],
    queryFn: async () => {
      const response = await api.get(`/api/auth/roles`)
      return response.data
    },
  })

  const roles = rolesResponse?.data || []

  const { data: permissions } = useQuery<Permission[]>({
    queryKey: ['permissions', tenant],
    queryFn: async () => {
      const response = await api.get(`/api/auth/permissions`)
      return response.data.data || response.data
    },
  })

  const { data: roleCategories } = useQuery<RoleCategory[]>({
    queryKey: ['role-categories', tenant],
    queryFn: async () => {
      const response = await api.get(`/api/auth/role-categories`)
      return response.data.data
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: number) => {
      const response = await api.delete(`/api/auth/roles/${roleId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenant] })
      toast.success('Role deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete role')
    },
  })

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDeleteRole = (roleId: number, roleName: string) => {
    if (confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      deleteRoleMutation.mutate(roleId)
    }
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setIsEditDialogOpen(true)
  }

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role)
    setIsPermissionsDialogOpen(true)
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'staff':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Manage user roles and their permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
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

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>
            Manage user roles and their permissions
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
                  <TableHead>Role</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No roles found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {role.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.status === 1 ? "default" : "secondary"}>
                          {role.status === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 2).map((permission) => (
                            <Badge
                              key={permission.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission.name}
                            </Badge>
                          ))}
                          {role.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>{role.permissions_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(role.updated_at)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditRole(role)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Manage Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              View Users
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteRole(role.id, role.name)}
                              disabled={deleteRoleMutation.isPending || (role.userCount || 0) > 0}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
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
      <CreateRoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        roleCategories={roleCategories || []}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['roles', tenant] })
          setIsCreateDialogOpen(false)
        }}
      />

      {selectedRole && (
        <EditRoleDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          role={selectedRole}
          roleCategories={roleCategories || []}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['roles', tenant] })
            setIsEditDialogOpen(false)
            setSelectedRole(null)
          }}
        />
      )}

      {selectedRole && (
        <ManagePermissionsDialog
          open={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
          role={selectedRole}
          permissions={permissions || []}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['roles', tenant] })
            setIsPermissionsDialogOpen(false)
            setSelectedRole(null)
          }}
        />
      )}
    </div>
  )
}
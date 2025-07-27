'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { api } from '@/lib/axios'
import { formatDateTime } from '@/lib/utils'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: {
    tenant: string
  }
}

export default function RolesPage({ params }: PageProps) {
  const { tenant } = params
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: roles, isLoading } = useQuery<Role[]>({
    queryKey: ['roles', tenant],
    queryFn: async () => {
      // Mock data for demo - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return [
        {
          id: '1',
          name: 'Admin',
          description: 'Full system access with all permissions',
          permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'roles.manage', 'permissions.manage'],
          userCount: 2,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Management access with limited administrative permissions',
          permissions: ['users.read', 'users.update', 'reports.read', 'bookings.manage'],
          userCount: 5,
          createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'Staff',
          description: 'Basic staff access for daily operations',
          permissions: ['bookings.read', 'bookings.update', 'guests.read'],
          userCount: 12,
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '4',
          name: 'Guest',
          description: 'Limited access for guest users',
          permissions: ['profile.read', 'profile.update'],
          userCount: 0,
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
      ]
    },
  })

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', tenant] })
      toast.success('Role deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete role')
    },
  })

  const filteredRoles = roles?.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      deleteRoleMutation.mutate(roleId)
    }
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Roles</CardTitle>
          <CardDescription>
            Find roles by name or description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No roles found</p>
          </div>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(role.name)}`}>
                    {role.name}
                  </span>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Users:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      Updated {formatDateTime(role.updatedAt)}
                    </span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
                          disabled={deleteRoleMutation.isPending || role.userCount > 0}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
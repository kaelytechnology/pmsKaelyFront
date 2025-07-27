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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Key, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  rolesCount: number
  createdAt: string
  updatedAt: string
}

interface PageProps {
  params: {
    tenant: string
  }
}

export default function PermissionsPage({ params }: PageProps) {
  const { tenant } = params
  const [searchTerm, setSearchTerm] = useState('')
  const [filterResource, setFilterResource] = useState('all')
  const queryClient = useQueryClient()

  const { data: permissions, isLoading } = useQuery<Permission[]>({
    queryKey: ['permissions', tenant],
    queryFn: async () => {
      // Mock data for demo - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return [
        {
          id: '1',
          name: 'users.create',
          description: 'Create new users in the system',
          resource: 'users',
          action: 'create',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          name: 'users.read',
          description: 'View user information and profiles',
          resource: 'users',
          action: 'read',
          rolesCount: 3,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'users.update',
          description: 'Modify existing user information',
          resource: 'users',
          action: 'update',
          rolesCount: 2,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: '4',
          name: 'users.delete',
          description: 'Remove users from the system',
          resource: 'users',
          action: 'delete',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: '5',
          name: 'roles.manage',
          description: 'Create, modify, and delete user roles',
          resource: 'roles',
          action: 'manage',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '6',
          name: 'permissions.manage',
          description: 'Manage system permissions and access control',
          resource: 'permissions',
          action: 'manage',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        },
        {
          id: '7',
          name: 'bookings.read',
          description: 'View booking information and reservations',
          resource: 'bookings',
          action: 'read',
          rolesCount: 2,
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },
        {
          id: '8',
          name: 'bookings.manage',
          description: 'Create, modify, and cancel bookings',
          resource: 'bookings',
          action: 'manage',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        },
        {
          id: '9',
          name: 'reports.read',
          description: 'Access system reports and analytics',
          resource: 'reports',
          action: 'read',
          rolesCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        },
      ]
    },
  })

  const deletePermissionMutation = useMutation({
    mutationFn: async (permissionId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', tenant] })
      toast.success('Permission deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete permission')
    },
  })

  const resources = Array.from(new Set(permissions?.map(p => p.resource) || []))
  
  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.resource.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesResource = filterResource === 'all' || permission.resource === filterResource
    
    return matchesSearch && matchesResource
  }) || []

  const handleDeletePermission = (permissionId: string, permissionName: string) => {
    if (confirm(`Are you sure you want to delete the "${permissionName}" permission?`)) {
      deletePermissionMutation.mutate(permissionId)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'manage':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getResourceColor = (resource: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    ]
    const index = resource.length % colors.length
    return colors[index]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Manage system permissions and access control
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Permission
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find permissions by name, description, or resource
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Resources</option>
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Permissions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Permissions ({filteredPermissions.length})</CardTitle>
          <CardDescription>
            Complete list of system permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : filteredPermissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No permissions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{permission.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {permission.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getResourceColor(permission.resource)}`}>
                        {permission.resource}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getActionColor(permission.action)}`}>
                        {permission.action}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>{permission.rolesCount} role{permission.rolesCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDateTime(permission.updatedAt)}
                    </p>
                  </div>
                  
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
                        Edit Permission
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        View Roles
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeletePermission(permission.id, permission.name)}
                        disabled={deletePermissionMutation.isPending || permission.rolesCount > 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Permission
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
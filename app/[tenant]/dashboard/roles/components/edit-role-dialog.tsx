'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'

interface RoleCategory {
  id: number
  name: string
  description?: string
}

interface Permission {
  id: number
  name: string
  slug: string
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

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
  roleCategories: RoleCategory[]
  onSuccess: () => void
}

interface UpdateRoleData {
  name: string
  slug: string
  description?: string
  role_category_id?: number
  status: boolean
}

export function EditRoleDialog({
  open,
  onOpenChange,
  role,
  roleCategories,
  onSuccess,
}: EditRoleDialogProps) {
  const [formData, setFormData] = useState<UpdateRoleData>({
    name: '',
    slug: '',
    description: '',
    role_category_id: undefined,
    status: true,
  })

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        slug: role.slug,
        description: role.description || '',
        role_category_id: role.role_category_id,
        status: role.status,
      })
    }
  }, [role])

  const updateRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put(`/api/auth/roles/${role.id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Role updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role')
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Name and slug are required')
      return
    }
    updateRoleMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update the role information and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter role name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="role-slug"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.role_category_id?.toString()}
                onValueChange={(value) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    role_category_id: value ? parseInt(value) : undefined 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {roleCategories && Array.isArray(roleCategories) && roleCategories.length > 0 ? (
                    roleCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, status: checked }))
                }
              />
              <Label htmlFor="status">Active</Label>
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
              type="submit"
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
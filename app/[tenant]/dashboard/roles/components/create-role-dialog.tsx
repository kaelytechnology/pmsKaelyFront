'use client'

import { useState } from 'react'
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

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleCategories: RoleCategory[]
  onSuccess: () => void
}

interface CreateRoleData {
  name: string
  slug: string
  description?: string
  role_category_id?: number
  status: boolean
}

export function CreateRoleDialog({
  open,
  onOpenChange,
  roleCategories,
  onSuccess,
}: CreateRoleDialogProps) {
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    slug: '',
    description: '',
    role_category_id: undefined,
    status: true,
  })

  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/auth/roles', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Role created successfully')
      onSuccess()
      resetForm()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      role_category_id: undefined,
      status: true,
    })
  }

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
    createRoleMutation.mutate(formData)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role with specific permissions and settings.
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
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRoleMutation.isPending}
            >
              {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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

interface EditModuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: Module
  onSuccess: () => void
}

interface UpdateModuleData {
  name: string
  slug: string
  description?: string
  icon?: string
  route?: string
  is_active: boolean
  parent_id?: number
  order?: number
}

export function EditModuleDialog({
  open,
  onOpenChange,
  module,
  onSuccess,
}: EditModuleDialogProps) {
  const [formData, setFormData] = useState<UpdateModuleData>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    route: '',
    is_active: true,
    parent_id: undefined,
    order: undefined,
  })

  // Get parent modules for selection (excluding current module and its children)
  const { data: parentModules } = useQuery<Module[]>({
    queryKey: ['modules-for-parent', module.id],
    queryFn: async () => {
      const response = await api.get(`/api/auth/modules`)
      const modules = response.data.data || response.data
      // Filter out current module and its children to prevent circular references
      return modules.filter((m: Module) => 
        m.id !== module.id && m.parent_id !== module.id
      )
    },
    enabled: open,
  })

  useEffect(() => {
    if (module) {
      setFormData({
        name: module.name,
        slug: module.slug,
        description: module.description || '',
        icon: module.icon || '',
        route: module.route || '',
        is_active: module.is_active,
        parent_id: module.parent_id,
        order: module.order,
      })
    }
  }, [module])

  const updateModuleMutation = useMutation({
    mutationFn: async (data: UpdateModuleData) => {
      const response = await api.put(`/api/auth/modules/${module.id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Module updated successfully')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update module')
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Module name is required')
      return
    }
    
    if (!formData.slug.trim()) {
      toast.error('Module slug is required')
      return
    }

    const submitData = {
      ...formData,
      parent_id: formData.parent_id || undefined,
      order: formData.order || undefined,
    }

    updateModuleMutation.mutate(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogDescription>
            Update the module details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter module name"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="module-slug"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter module description"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="Icon name or class"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              value={formData.route}
              onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
              placeholder="/dashboard/module-route"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="parent">Parent Module</Label>
            <Select
              value={formData.parent_id?.toString() || "none"}
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  parent_id: value === "none" ? undefined : parseInt(value) 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent module (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent (Root module)</SelectItem>
                {parentModules && Array.isArray(parentModules) && parentModules.length > 0 ? (
                  parentModules.map((parentModule) => (
                    <SelectItem key={parentModule.id} value={parentModule.id.toString()}>
                      {parentModule.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-modules" disabled>
                    No modules available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                order: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Display order (optional)"
              min="0"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_active: checked }))
              }
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </form>
        
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
            onClick={handleSubmit}
            disabled={updateModuleMutation.isPending}
          >
            {updateModuleMutation.isPending ? 'Updating...' : 'Update Module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
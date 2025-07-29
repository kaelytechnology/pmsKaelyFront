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
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'

interface EditRoomRateRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  roomRateRule: {
    id: number
    code: string
    class: string
    room_type_name: string
    min_nights: number
    max_guests: number
    included_dinners?: number
    rule_text?: string
    is_active: boolean
  } | null
}

interface EditRoomRateRuleData {
  code: string
  class: string
  room_type_name: string
  min_nights: number
  max_guests: number
  included_dinners?: number
  rule_text?: string
  is_active: boolean
}

export function EditRoomRateRuleDialog({
  open,
  onOpenChange,
  onSuccess,
  roomRateRule,
}: EditRoomRateRuleDialogProps) {
  const [formData, setFormData] = useState<EditRoomRateRuleData>({
    code: '',
    class: '',
    room_type_name: '',
    min_nights: 1,
    max_guests: 1,
    included_dinners: undefined,
    rule_text: '',
    is_active: true,
  })

  useEffect(() => {
    if (roomRateRule) {
      setFormData({
        code: roomRateRule.code,
        class: roomRateRule.class,
        room_type_name: roomRateRule.room_type_name,
        min_nights: roomRateRule.min_nights,
        max_guests: roomRateRule.max_guests,
        included_dinners: roomRateRule.included_dinners,
        rule_text: roomRateRule.rule_text || '',
        is_active: roomRateRule.is_active,
      })
    }
  }, [roomRateRule])

  const editRoomRateRuleMutation = useMutation({
    mutationFn: async (data: EditRoomRateRuleData) => {
      if (!roomRateRule) throw new Error('No room rate rule selected')
      const response = await api.put(`/api/pms/room-rate-rules/${roomRateRule.id}`, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Room rate rule updated successfully')
      onSuccess()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update room rate rule')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.code.trim()) {
      toast.error('Code is required')
      return
    }
    
    if (!formData.class.trim()) {
      toast.error('Class is required')
      return
    }
    
    if (!formData.room_type_name.trim()) {
      toast.error('Room type name is required')
      return
    }
    
    if (formData.min_nights < 1) {
      toast.error('Minimum nights must be at least 1')
      return
    }
    
    if (formData.max_guests < 1) {
      toast.error('Maximum guests must be at least 1')
      return
    }

    const submitData = {
      ...formData,
      included_dinners: formData.included_dinners || undefined,
    }

    editRoomRateRuleMutation.mutate(submitData)
  }

  if (!roomRateRule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Room Rate Rule</DialogTitle>
          <DialogDescription>
            Update the room rate rule information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter rule code"
                maxLength={50}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="class">Class *</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                placeholder="Enter rule class"
                maxLength={100}
                required
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="room_type_name">Room Type Name *</Label>
            <Input
              id="room_type_name"
              value={formData.room_type_name}
              onChange={(e) => setFormData(prev => ({ ...prev, room_type_name: e.target.value }))}
              placeholder="Enter room type name"
              maxLength={100}
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="min_nights">Minimum Nights *</Label>
              <Input
                id="min_nights"
                type="number"
                value={formData.min_nights}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  min_nights: parseInt(e.target.value) || 1 
                }))}
                placeholder="1"
                min="1"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="max_guests">Maximum Guests *</Label>
              <Input
                id="max_guests"
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  max_guests: parseInt(e.target.value) || 1 
                }))}
                placeholder="1"
                min="1"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="included_dinners">Included Dinners</Label>
              <Input
                id="included_dinners"
                type="number"
                value={formData.included_dinners || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  included_dinners: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="rule_text">Rule Text</Label>
            <Textarea
              id="rule_text"
              value={formData.rule_text}
              onChange={(e) => setFormData(prev => ({ ...prev, rule_text: e.target.value }))}
              placeholder="Enter rule description or additional text"
              rows={4}
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
            disabled={editRoomRateRuleMutation.isPending}
          >
            {editRoomRateRuleMutation.isPending ? 'Updating...' : 'Update Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
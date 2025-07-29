'use client'

import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'

interface DeleteRoomRateRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  roomRateRule: {
    id: number
    code: string
    class: string
    room_type_name: string
  } | null
}

export function DeleteRoomRateRuleDialog({
  open,
  onOpenChange,
  onSuccess,
  roomRateRule,
}: DeleteRoomRateRuleDialogProps) {
  const deleteRoomRateRuleMutation = useMutation({
    mutationFn: async () => {
      if (!roomRateRule) throw new Error('No room rate rule selected')
      const response = await api.delete(`/api/pms/room-rate-rules/${roomRateRule.id}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Room rate rule deleted successfully')
      onSuccess()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete room rate rule')
    },
  })

  const handleDelete = () => {
    deleteRoomRateRuleMutation.mutate()
  }

  if (!roomRateRule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Room Rate Rule
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the room rate rule.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Room Rate Rule to Delete:</h4>
            <div className="space-y-1 text-sm text-red-700">
              <p><strong>Code:</strong> {roomRateRule.code}</p>
              <p><strong>Class:</strong> {roomRateRule.class}</p>
              <p><strong>Room Type:</strong> {roomRateRule.room_type_name}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this room rate rule? This action cannot be undone.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteRoomRateRuleMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRoomRateRuleMutation.isPending}
          >
            {deleteRoomRateRuleMutation.isPending ? 'Deleting...' : 'Delete Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
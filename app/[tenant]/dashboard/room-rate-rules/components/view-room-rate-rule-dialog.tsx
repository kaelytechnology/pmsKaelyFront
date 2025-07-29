'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ViewRoomRateRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
    user_add?: {
      id: number
      name: string
    }
    user_edit?: {
      id: number
      name: string
    }
    created_at: string
    updated_at: string
  } | null
}

export function ViewRoomRateRuleDialog({
  open,
  onOpenChange,
  roomRateRule,
}: ViewRoomRateRuleDialogProps) {
  if (!roomRateRule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Room Rate Rule Details</DialogTitle>
          <DialogDescription>
            View detailed information about the room rate rule.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Code</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{roomRateRule.code}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Class</label>
                <p className="text-sm">{roomRateRule.class}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Room Type Name</label>
              <p className="text-sm">{roomRateRule.room_type_name}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Minimum Nights</label>
                <p className="text-sm">{roomRateRule.min_nights}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Maximum Guests</label>
                <p className="text-sm">{roomRateRule.max_guests}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Included Dinners</label>
                <p className="text-sm">{roomRateRule.included_dinners ?? 'N/A'}</p>
              </div>
            </div>
            
            {roomRateRule.rule_text && (
              <div>
                <label className="text-sm font-medium text-gray-500">Rule Text</label>
                <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">
                  {roomRateRule.rule_text}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={roomRateRule.is_active ? 'default' : 'secondary'}>
                  {roomRateRule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {roomRateRule.user_add && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <p className="text-sm">{roomRateRule.user_add.name}</p>
                </div>
              )}
              
              {roomRateRule.user_edit && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Modified By</label>
                  <p className="text-sm">{roomRateRule.user_edit.name}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timestamps</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-sm">
                  {new Date(roomRateRule.created_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(roomRateRule.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm">
                  {new Date(roomRateRule.updated_at).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(roomRateRule.updated_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
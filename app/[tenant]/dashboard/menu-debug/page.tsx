'use client'

import { MenuDebug } from '@/components/menu-debug'

export default function MenuDebugPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menu Debug</h1>
        <p className="text-muted-foreground">
          Debug information for the dynamic menu system
        </p>
      </div>
      
      <MenuDebug />
    </div>
  )
}
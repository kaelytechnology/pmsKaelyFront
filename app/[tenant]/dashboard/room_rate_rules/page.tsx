'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoomRateRulesRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Get current path and replace room_rate_rules with room-rate-rules
    const currentPath = window.location.pathname
    const newPath = currentPath.replace('/room_rate_rules', '/room-rate-rules')
    router.replace(newPath)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
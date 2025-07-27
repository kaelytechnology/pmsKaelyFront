'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'

export function useAuthInit() {
  const [isHydrated, setIsHydrated] = useState(false)
  const { isInitialized, initialize, isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    // Initialize auth store on client side
    if (!isInitialized) {
      initialize()
    }
    setIsHydrated(true)
  }, [isInitialized, initialize])

  // Return loading state until hydration is complete and auth is initialized
  return {
    isLoading: !isHydrated || !isInitialized,
    isAuthenticated: isHydrated && isInitialized ? isAuthenticated : false,
    token: isHydrated && isInitialized ? token : null,
  }
}
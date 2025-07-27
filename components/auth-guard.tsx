'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthInit } from '@/hooks/use-auth-init'
import { Skeleton } from '@/components/ui/skeleton'

interface AuthGuardProps {
  children: React.ReactNode
  tenant: string
  fallback?: React.ReactNode
}

export function AuthGuard({ children, tenant, fallback }: AuthGuardProps) {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuthInit()

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading && !isAuthenticated) {
      router.replace(`/${tenant}/login`)
    }
  }, [isLoading, isAuthenticated, tenant, router])

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="flex h-screen">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow border-r bg-card p-4 space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
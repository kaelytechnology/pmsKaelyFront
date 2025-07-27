'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useTenantTheme } from '@/hooks/use-tenant-theme'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthGuard } from '@/components/auth-guard'

interface DashboardLayoutProps {
  children: React.ReactNode
  params: {
    tenant: string
  }
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { tenant } = params
  const { user, fetchUser } = useAuthStore()
  const { setTenant } = useTenantStore()
  const tenantConfig = useTenantTheme()

  useEffect(() => {
    // Set current tenant
    setTenant(tenant)
  }, [tenant, setTenant])

  useEffect(() => {
    // Fetch user data if not available
    if (!user) {
      fetchUser()
    }
  }, [user, fetchUser])

  return (
    <AuthGuard tenant={tenant}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar tenant={tenant} />
        
        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden md:ml-64">
          {/* Mobile Header with Theme Toggle */}
          <div className="hidden md:flex items-center justify-end border-b bg-card px-6 py-3">
            <ThemeToggle />
          </div>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
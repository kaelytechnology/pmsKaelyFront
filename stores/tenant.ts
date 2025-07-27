import { create } from 'zustand'
import { getTenantFromHostname } from '@/lib/utils'
import { TENANT_CONFIGS, getTenantConfig as getConfig, type TenantConfig } from '@/config/tenants'

interface TenantState {
  currentTenant: string
  config: TenantConfig | null
  isLoading: boolean
  setTenant: (tenant: string) => void
  loadTenantConfig: () => Promise<void>
  getTenantConfig: (tenant: string) => TenantConfig
}

export const useTenantStore = create<TenantState>((set, get) => ({
  currentTenant: 'ixtapa',
  config: null,
  isLoading: false,

  setTenant: (tenant: string) => {
    const config = get().getTenantConfig(tenant)
    set({ currentTenant: tenant, config })
  },

  loadTenantConfig: async () => {
    set({ isLoading: true })
    
    try {
      // Get tenant from hostname
      const tenant = getTenantFromHostname()
      const config = get().getTenantConfig(tenant)
      
      set({
        currentTenant: tenant,
        config,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load tenant config:', error)
      // Fallback to default
      const config = get().getTenantConfig('ixtapa')
      set({
        currentTenant: 'ixtapa',
        config,
        isLoading: false,
      })
    }
  },

  getTenantConfig: (tenant: string): TenantConfig => {
    return getConfig(tenant)
  },
}))

// Initialize tenant on store creation
if (typeof window !== 'undefined') {
  useTenantStore.getState().loadTenantConfig()
}
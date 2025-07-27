import axios from 'axios'
import { getTenantFromHostname } from './utils'
import { getTenantConfig, TENANT_CONFIGS } from '@/config/tenants'

const getApiBase = (): string => {
  // SSR fallback
  if (typeof window === 'undefined') {
    return TENANT_CONFIGS.ixtapa.apiUrl
  }
  
  const tenant = getTenantFromHostname()
  const config = getTenantConfig(tenant)
  
  // Debug logging
  console.log('🔍 API URL Debug:', {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    tenant,
    apiUrl: config.apiUrl,
    frontendDomains: config.frontendDomains
  })
  
  return config.apiUrl
}

export const api = axios.create({
  baseURL: getApiBase(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth-token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-user')
        
        // Get current tenant from URL for proper redirection
        const pathname = window.location.pathname
        const tenantMatch = pathname.match(/^\/([^/]+)/)
        const tenant = tenantMatch ? tenantMatch[1] : 'ixtapa'
        
        // Only redirect if not already on login page
        if (!pathname.includes('/login')) {
          window.location.href = `/${tenant}/login`
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
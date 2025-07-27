import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTenantFromHostname(): string {
  if (typeof window === 'undefined') return 'ixtapa'
  
  const hostname = window.location.hostname
  const pathname = window.location.pathname
  
  // If we're on localhost, extract tenant from URL path
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      const validTenants = ['ixtapa', 'manzanillo', 'huatulco']
      const tenantFromPath = pathSegments[0]
      if (validTenants.includes(tenantFromPath)) {
        console.log('🏠 Detected tenant from localhost path:', tenantFromPath)
        return tenantFromPath
      }
    }
    return 'ixtapa'
  }
  
  // For production domains, extract from hostname
  const slug = hostname.split('.')[0]
  const validTenants = ['ixtapa', 'manzanillo', 'huatulco']
  const tenant = validTenants.includes(slug) ? slug : 'ixtapa'
  
  console.log('🌐 Detected tenant from hostname:', { hostname, slug, tenant })
  return tenant
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
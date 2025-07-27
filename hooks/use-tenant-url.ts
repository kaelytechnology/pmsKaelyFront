'use client'

import { useEffect, useState } from 'react'

export function useTenantUrl(tenant: string) {
  const [isDirectDomain, setIsDirectDomain] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host
      
      // Check if we're on a direct tenant domain
      const directDomains = {
        'huatulco.com': 'huatulco',
        // Add other direct domains here if needed
      }
      
      const directDomain = Object.keys(directDomains).find(domain => 
        host === domain || host.startsWith(`${domain}:`)
      )
      
      setIsDirectDomain(!!directDomain && directDomains[directDomain as keyof typeof directDomains] === tenant)
    }
  }, [tenant])

  const createUrl = (path: string) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    if (isDirectDomain) {
      // For direct domains, use clean URLs without tenant slug
      return `/${cleanPath}`
    } else {
      // For localhost and subdomain access, include tenant slug
      return `/${tenant}/${cleanPath}`
    }
  }

  return { isDirectDomain, createUrl }
}
'use client'

import { useEffect } from 'react'
import { useTenantStore } from '@/stores/tenant'

export function useTenantTheme() {
  const { config } = useTenantStore()

  useEffect(() => {
    if (!config || typeof document === 'undefined') return

    // Apply tenant-specific CSS custom properties
    const root = document.documentElement
    
    // Convert hex color to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      let s = 0
      const l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      }
    }

    const hsl = hexToHsl(config.primaryColor)
    
    // Set CSS custom properties for the primary color
    root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`)
    root.style.setProperty('--primary-foreground', `${hsl.h} ${hsl.s}% ${hsl.l > 50 ? 10 : 90}%`)
    
    // Set a data attribute for the current tenant
    root.setAttribute('data-tenant', config.slug)
    
    // Update document title
    document.title = config.name
    
    return () => {
      // Cleanup: reset to default values
      root.style.removeProperty('--primary')
      root.style.removeProperty('--primary-foreground')
      root.removeAttribute('data-tenant')
    }
  }, [config])

  return config
}
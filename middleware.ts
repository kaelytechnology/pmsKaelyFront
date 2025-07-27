import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const url = req.nextUrl.clone()
  
  // Extract tenant slug from hostname
  let tenant = 'ixtapa' // default
  let isDirectTenantDomain = false
  
  // Special case for huatulco.com - direct domain access
  if (host === 'huatulco.com' || host.startsWith('huatulco.com:')) {
    tenant = 'huatulco'
    isDirectTenantDomain = true
  } else {
    // Extract from subdomain (e.g., ixtapa.example.com -> ixtapa)
    const slug = host.split('.')[0]
    const validTenants = ['ixtapa', 'manzanillo', 'huatulco']
    
    // Use slug if valid, otherwise keep default
    if (validTenants.includes(slug)) {
      tenant = slug
      // Check if it's a direct tenant domain (not localhost)
      isDirectTenantDomain = !host.includes('localhost')
    }
  }
  
  // For direct tenant domains, rewrite without adding tenant to URL
  if (isDirectTenantDomain) {
    // Don't rewrite if already has tenant in path
    if (url.pathname.startsWith(`/${tenant}`)) {
      return NextResponse.next()
    }
    
    // Rewrite to include tenant internally but keep clean URLs
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/${tenant}${url.pathname}`
    
    return NextResponse.rewrite(rewriteUrl)
  }
  
  // For localhost and other domains, use the original behavior
  // Don't rewrite if already has tenant in path
  if (url.pathname.startsWith(`/${tenant}`)) {
    return NextResponse.next()
  }
  
  // Rewrite URL to include tenant
  url.pathname = `/${tenant}${url.pathname}`
  
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
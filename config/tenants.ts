export interface TenantConfig {
  slug: string
  name: string
  apiUrl: string
  frontendDomains: string[]
  primaryColor: string
  logo?: string
  features: string[]
}

/**
 * Configuración centralizada de tenants
 * 
 * Para agregar un nuevo tenant:
 * 1. Agregar la configuración aquí
 * 2. Actualizar el middleware.ts para incluir el nuevo slug
 * 3. Configurar el DNS para apuntar al dominio correcto
 * 
 * Estructura recomendada de dominios:
 * - Frontend: {tenant}.kaelytechnology.com
 * - API: api{tenant}.kaelytechnology.com (nota: manzanillo usa 'z')
 */
export const TENANT_CONFIGS: Record<string, TenantConfig> = {
  ixtapa: {
    slug: 'ixtapa',
    name: 'Kaely Suite Hotel Ixtapa',
    apiUrl: 'https://apiixtapa.kaelytechnology.com',
    frontendDomains: [
      'ixtapa.kaelytechnology.com',
      'localhost:3000/ixtapa',
      'localhost:3001/ixtapa'
    ],
    primaryColor: '#3B82F6',
    features: ['users', 'roles', 'permissions', 'bookings'],
  },
  manzanillo: {
    slug: 'manzanillo',
    name: 'Kaely Suite Hotel Manzanillo',
    apiUrl: 'https://apimazanillo.kaelytechnology.com', // Nota: usa 'z'
    frontendDomains: [
      'manzanillo.kaelytechnology.com',
      'localhost:3000/manzanillo',
      'localhost:3001/manzanillo'
    ],
    primaryColor: '#10B981',
    features: ['users', 'roles', 'permissions', 'bookings', 'analytics'],
  },
  huatulco: {
    slug: 'huatulco',
    name: 'Kaely Suite Hotel Huatulco',
    apiUrl: 'https://apihuatulco.kaelytechnology.com',
    frontendDomains: [
      'huatulco.kaelytechnology.com',
      'huatulco.com',
      'localhost:3000/huatulco',
      'localhost:3001/huatulco'
    ],
    primaryColor: '#F59E0B',
    features: ['users', 'roles', 'permissions', 'bookings', 'reports'],
  },
}

/**
 * Obtiene la configuración de un tenant
 */
export const getTenantConfig = (tenant: string): TenantConfig => {
  return TENANT_CONFIGS[tenant] || TENANT_CONFIGS.ixtapa
}

/**
 * Obtiene todos los slugs de tenants válidos
 */
export const getValidTenants = (): string[] => {
  return Object.keys(TENANT_CONFIGS)
}

/**
 * Detecta el tenant basado en el hostname y pathname
 */
export const detectTenantFromUrl = (hostname: string, pathname: string): string => {
  // Para localhost, extraer del path
  if (hostname === 'localhost' || hostname.startsWith('localhost:') || hostname === '127.0.0.1') {
    const pathSegments = pathname.split('/').filter(Boolean)
    if (pathSegments.length > 0) {
      const tenantFromPath = pathSegments[0]
      if (getValidTenants().includes(tenantFromPath)) {
        return tenantFromPath
      }
    }
    return 'ixtapa' // fallback para localhost
  }
  
  // Para dominios de producción, extraer del hostname
  const slug = hostname.split('.')[0]
  return getValidTenants().includes(slug) ? slug : 'ixtapa'
}

/**
 * Ejemplo de cómo agregar un nuevo tenant:
 * 
 * 1. Agregar en TENANT_CONFIGS:
 * 
 * acapulco: {
 *   slug: 'acapulco',
 *   name: 'Kaely Suite Hotel Acapulco',
 *   apiUrl: 'https://apiacapulco.kaelytechnology.com',
 *   frontendDomains: [
 *     'acapulco.kaelytechnology.com',
 *     'localhost:3000/acapulco'
 *   ],
 *   primaryColor: '#8B5CF6',
 *   features: ['users', 'roles', 'permissions', 'bookings'],
 * },
 * 
 * 2. Actualizar middleware.ts:
 * - Agregar 'acapulco' al array de validTenants
 * 
 * 3. Configurar DNS:
 * - acapulco.kaelytechnology.com -> Frontend
 * - apiacapulco.kaelytechnology.com -> Backend API
 */
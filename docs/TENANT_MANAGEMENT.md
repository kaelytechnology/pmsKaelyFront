# Gestión de Tenants - Kaely Suite Hotel

## Arquitectura de Tenants

Este proyecto utiliza una arquitectura multi-tenant donde cada hotel (Ixtapa, Manzanillo, Huatulco) tiene su propia configuración y dominio.

### Estructura de Dominios

**Recomendación:** El dominio frontend debe coincidir con el API backend para evitar problemas de configuración.

- **Frontend:** `{tenant}.kaelytechnology.com`
- **Backend API:** `api{tenant}.kaelytechnology.com`

### Tenants Actuales

| Tenant | Frontend | Backend API |
|--------|----------|-------------|
| Ixtapa | `ixtapa.kaelytechnology.com` | `https://apiixtapa.kaelytechnology.com` |
| Manzanillo | `manzanillo.kaelytechnology.com` | `https://apimazanillo.kaelytechnology.com` |
| Huatulco | `huatulco.kaelytechnology.com` | `https://apihuatulco.kaelytechnology.com` |

## Cómo Agregar un Nuevo Tenant

### 1. Configuración del Tenant

Editar `config/tenants.ts` y agregar la nueva configuración:

```typescript
export const TENANT_CONFIGS: Record<string, TenantConfig> = {
  // ... tenants existentes
  
  acapulco: {
    slug: 'acapulco',
    name: 'Kaely Suite Hotel Acapulco',
    apiUrl: 'https://apiacapulco.kaelytechnology.com',
    frontendDomains: [
      'acapulco.kaelytechnology.com',
      'localhost:3000/acapulco',
      'localhost:3001/acapulco'
    ],
    primaryColor: '#8B5CF6',
    features: ['users', 'roles', 'permissions', 'bookings'],
  },
}
```

### 2. Actualizar Middleware (si existe)

Si hay un archivo `middleware.ts`, agregar el nuevo tenant a la lista de tenants válidos:

```typescript
const validTenants = ['ixtapa', 'manzanillo', 'huatulco', 'acapulco']
```

### 3. Configuración de DNS

**Frontend:**
- Configurar `acapulco.kaelytechnology.com` para apuntar al servidor frontend

**Backend:**
- Configurar `apiacapulco.kaelytechnology.com` para apuntar al servidor API

### 4. Configuración del Backend

Asegurarse de que el backend API esté configurado para responder en el nuevo dominio.

## Desarrollo Local

### URLs de Desarrollo

- **Ixtapa:** `http://localhost:3000/ixtapa`
- **Manzanillo:** `http://localhost:3000/manzanillo`
- **Huatulco:** `http://localhost:3000/huatulco`

### Testing

Para probar un nuevo tenant localmente:

1. Agregar la configuración en `config/tenants.ts`
2. Navegar a `http://localhost:3000/{nuevo-tenant}`
3. Verificar que la API se conecte correctamente

## Archivos Importantes

### Configuración Centralizada
- `config/tenants.ts` - Configuración principal de todos los tenants
- `stores/tenant.ts` - Store de Zustand para manejo de estado
- `lib/axios.ts` - Configuración de Axios con detección automática de tenant

### Utilidades
- `lib/utils.ts` - Funciones para detectar tenant desde hostname/pathname

## Beneficios de esta Arquitectura

1. **Centralizada:** Toda la configuración está en un solo lugar
2. **Escalable:** Fácil agregar nuevos tenants
3. **Consistente:** Misma estructura para todos los tenants
4. **Mantenible:** Cambios en un lugar se reflejan en toda la aplicación
5. **Flexible:** Cada tenant puede tener configuraciones específicas

## Troubleshooting

### Problema: API URL incorrecta

**Síntoma:** Errores 404 en las llamadas API

**Solución:**
1. Verificar que el `apiUrl` en `config/tenants.ts` sea correcto
2. Verificar que el backend esté corriendo en esa URL
3. Revisar los logs del navegador para ver qué URL se está generando

### Problema: Tenant no detectado

**Síntoma:** Siempre carga el tenant por defecto (ixtapa)

**Solución:**
1. Verificar que el slug del tenant esté en `TENANT_CONFIGS`
2. Verificar que la función `detectTenantFromUrl` esté funcionando correctamente
3. Para localhost, asegurarse de usar la URL con el path correcto: `/tenant-name`

## Consideraciones de Seguridad

- Nunca exponer configuraciones sensibles en el frontend
- Validar siempre el tenant en el backend
- Usar HTTPS en producción
- Configurar CORS correctamente para cada dominio
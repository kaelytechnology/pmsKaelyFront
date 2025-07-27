# Configuración Multi-Tenant

## Dominios Configurados

La aplicación ahora soporta múltiples tenants con sus respectivos dominios y APIs:

### 1. Ixtapa
- **Dominio local**: `ixtapa.com` (127.0.0.1)
- **API**: `https://apiixtapa.kaelytechnology.com`
- **Color primario**: Azul (#3B82F6)
- **Características**: users, roles, permissions, bookings

### 2. Manzanillo
- **Dominio local**: `manzanillo.com` (127.0.0.1)
- **API**: `https://apimazanillo.kaelytechnology.com`
- **Color primario**: Verde (#10B981)
- **Características**: users, roles, permissions, bookings, analytics

### 3. Huatulco
- **Dominio local**: `huatulco.com` (127.0.0.1)
- **API**: `https://apihuatulco.kaelytechnology.com`
- **Color primario**: Amarillo (#F59E0B)
- **Características**: users, roles, permissions, bookings, reports

## Configuración del archivo hosts

Asegúrate de tener estas entradas en tu archivo hosts:

```
127.0.0.1 ixtapa.com
127.0.0.1 manzanillo.com
127.0.0.1 huatulco.com
```

## Cómo probar

1. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Accede a cada dominio**:
   - http://ixtapa.com:3000
   - http://manzanillo.com:3000
   - http://huatulco.com:3000

3. **Verifica la configuración**:
   - Cada dominio debería mostrar el nombre del hotel correspondiente
   - Los colores primarios deberían ser diferentes
   - Las llamadas a la API deberían ir al endpoint correcto

## Archivos modificados

- `lib/axios.ts`: Configuración dinámica de la URL base del API
- `middleware.ts`: Manejo de rutas multi-tenant
- `stores/tenant.ts`: Configuración de cada tenant
- `lib/utils.ts`: Función para extraer tenant del hostname

## Credenciales de prueba

Para todos los tenants:
- **Email**: `admin@apiixtapa.kaelytechnology.com`
- **Password**: `password123`

## Notas importantes

- El tenant por defecto es 'ixtapa' si no se puede determinar desde el hostname
- En SSR, siempre se usa el API de Ixtapa como fallback
- Los tokens de autenticación se almacenan por tenant
- El middleware redirige automáticamente las rutas según el tenant
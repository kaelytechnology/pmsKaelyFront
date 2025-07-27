'use client'

import { useMenu, useMenuPermissions } from '@/hooks/use-menu'
import { useAuthStore } from '@/stores/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

/**
 * Componente de debug para mostrar información del menú dinámico
 * Útil para desarrollo y troubleshooting
 */
export function MenuDebug() {
  const { data: menuItems, isLoading, error, isError } = useMenu()
  const { filterMenuByPermissions } = useMenuPermissions()
  const { user, token, isAuthenticated } = useAuthStore()

  const filteredMenu = menuItems ? filterMenuByPermissions(menuItems) : []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isError ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : isLoading ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Menu Debug Information
          </CardTitle>
          <CardDescription>
            Debug information for dynamic menu system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div>
            <h4 className="font-medium mb-2">Authentication Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Authenticated: <Badge variant={isAuthenticated ? 'default' : 'destructive'}>{isAuthenticated ? 'Yes' : 'No'}</Badge></div>
              <div>Has Token: <Badge variant={token ? 'default' : 'destructive'}>{token ? 'Yes' : 'No'}</Badge></div>
              <div>User: <span className="font-mono">{user?.name || 'None'}</span></div>
              <div>Roles: <span className="font-mono">{user?.roles?.join(', ') || 'None'}</span></div>
            </div>
            {user && (
              <div className="mt-4">
                <h5 className="font-medium mb-2">User Details</h5>
                <div className="space-y-2 text-sm">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Roles:</strong> {user.roles?.join(', ') || 'None'}</p>
                  <p><strong>Permissions:</strong> {user.permissions?.length || 0}</p>
                  {user.permissions && user.permissions.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Permission List:</strong></p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.permissions.map((permission, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu Loading State */}
          <div>
            <h4 className="font-medium mb-2">Menu State</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>Loading: <Badge variant={isLoading ? 'secondary' : 'outline'}>{isLoading ? 'Yes' : 'No'}</Badge></div>
              <div>Error: <Badge variant={isError ? 'destructive' : 'outline'}>{isError ? 'Yes' : 'No'}</Badge></div>
              <div>Items: <span className="font-mono">{menuItems?.length || 0}</span></div>
            </div>
          </div>

          {/* Error Details */}
          {error && (
            <div>
              <h4 className="font-medium mb-2 text-red-600">Error Details</h4>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <pre className="whitespace-pre-wrap text-red-800">
                  {error instanceof Error ? error.message : String(error)}
                </pre>
              </div>
            </div>
          )}

          {/* Raw Menu Data */}
          {isLoading ? (
            <div>
              <h4 className="font-medium mb-2">Menu Items</h4>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ) : menuItems && menuItems.length > 0 ? (
            <div>
              <h4 className="font-medium mb-2">Raw Menu Data ({menuItems.length} items)</h4>
              <div className="bg-gray-50 border rounded p-3 text-xs font-mono max-h-40 overflow-auto">
                <pre>{JSON.stringify(menuItems, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-medium mb-2">Menu Items</h4>
              <p className="text-sm text-muted-foreground">No menu items available</p>
            </div>
          )}

          {/* Filtered Menu */}
          {filteredMenu.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Filtered Menu ({filteredMenu.length} items)</h4>
              <div className="space-y-2">
                {filteredMenu.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.href}</span>
                    </div>
                    <div className="flex gap-1">
                      {item.icon && <Badge variant="outline" className="text-xs">{item.icon}</Badge>}
                      {item.order !== undefined && <Badge variant="secondary" className="text-xs">#{item.order}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Permissions */}
          {user?.permissions && user.permissions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">User Permissions ({user.permissions.length})</h4>
              <div className="flex flex-wrap gap-1">
                {user.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
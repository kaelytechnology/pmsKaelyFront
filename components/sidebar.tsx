'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTenantStore } from '@/stores/tenant'
import { useMenu, useMenuPermissions, getIconComponent, getDefaultMenu, MenuItem } from '@/hooks/use-menu'
import {
  Settings,
  LogOut,
  Menu,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuthStore } from '@/stores/auth'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  tenant: string
}

// Componente recursivo para elementos del menú
interface MenuItemComponentProps {
  item: MenuItem
  tenant: string
  pathname: string
  level?: number
}

function MenuItemComponent({ item, tenant, pathname, level = 0 }: MenuItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = item.children && item.children.length > 0
  const href = item.href
  const isActive = pathname === href
  const IconComponent = getIconComponent(item.icon)
  const paddingLeft = level * 12 + 12 // Indentación por nivel

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={handleClick}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <div className="flex items-center space-x-3">
            <IconComponent className="h-4 w-4" />
            <span>{item.name}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <Link
          href={href}
          className={cn(
            'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <IconComponent className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      )}
      
      {/* Renderizar children si están expandidos */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <MenuItemComponent
              key={child.id || child.name}
              item={child}
              tenant={tenant}
              pathname={pathname}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// El menú ahora se obtiene dinámicamente desde el hook useMenu

export function Sidebar({ tenant }: SidebarProps) {
  const pathname = usePathname()
  const { config } = useTenantStore()
  const { user, logout } = useAuthStore()
  const { data: menuItems, isLoading: isMenuLoading, error: menuError } = useMenu()
  const { filterMenuByPermissions } = useMenuPermissions()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  // Estado persistente del menú que siempre tiene un valor
  const [persistentMenu, setPersistentMenu] = useState<MenuItem[]>(() => {
    // En el servidor, usar menú por defecto
    if (typeof window === 'undefined') {
      return getDefaultMenu()
    }
    
    // Limpiar cache para forzar recarga del menú actualizado
    try {
      localStorage.removeItem('cached-menu')
      sessionStorage.removeItem('session-menu')
      console.log('🧹 Cache del menú limpiado')
    } catch (error) {
      console.warn('Error limpiando cache del menú:', error)
    }
    
    // Usar siempre el menú por defecto actualizado
    console.log('🔄 Usando menú por defecto actualizado')
    return getDefaultMenu()
  })
  
  // Actualizar menú persistente cuando React Query tenga datos
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setPersistentMenu(menuItems)
      console.log('✅ Menú actualizado desde API:', menuItems.length)
    }
  }, [menuItems])
  
  // Guardar en storage cuando el menú cambie
  useEffect(() => {
    if (persistentMenu.length > 0 && typeof window !== 'undefined') {
      try {
        const menuData = {
          menu: persistentMenu,
          timestamp: Date.now(),
          expiresAt: Date.now() + (30 * 60 * 1000)
        }
        const menuString = JSON.stringify(menuData)
        localStorage.setItem('cached-menu', menuString)
        sessionStorage.setItem('session-menu', menuString)
        console.log('💾 Menú guardado en storage')
      } catch (error) {
        console.warn('Error guardando menú:', error)
      }
    }
  }, [persistentMenu])
  
  // Obtener menú filtrado por permisos con lógica más permisiva
  const navigation = React.useMemo(() => {
    // Si no hay usuario cargado aún, mostrar menú completo
    if (!user) {
      return persistentMenu
    }
    
    // Si hay usuario, filtrar por permisos
    return filterMenuByPermissions(persistentMenu)
  }, [persistentMenu, user, filterMenuByPermissions])

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={`/${tenant}/dashboard`} className="flex items-center space-x-2">
          <div 
            className="h-8 w-8 rounded" 
            style={{ backgroundColor: config?.primaryColor || '#3B82F6' }}
          />
          <span className="font-bold">
            {config?.name || 'Kaely Suite Hotel'}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4">
        {/* Ya no necesitamos mostrar loader porque persistentMenu siempre tiene datos */}
        
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          // Usar href directamente sin agregar tenant
          const href = item.href || '#'
          const isActive = pathname === href
          const IconComponent = getIconComponent(item.icon)
          const itemId = item.id || item.name
          const isExpanded = expandedItems[itemId] || false
          
          return (
            <div key={itemId}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(itemId)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )}
              
              {hasChildren && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children!.map((child) => {
                    // Construir childHref correctamente
                    let childHref = child.href || '#'
                    if (childHref.startsWith('/dashboard')) {
                      childHref = `/${tenant}${childHref}`
                    } else if (childHref.startsWith('/')) {
                      childHref = `/${tenant}/dashboard${childHref}`
                    } else {
                      childHref = `/${tenant}/dashboard/${childHref}`
                    }
                    const childIsActive = pathname === childHref
                    const ChildIconComponent = getIconComponent(child.icon)
                    
                    return (
                      <Link
                        key={child.id || child.name}
                        href={childHref}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          childIsActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <ChildIconComponent className="h-4 w-4" />
                        <span>{child.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b bg-card px-4 py-3">
          <Link href={`/${tenant}/dashboard`} className="flex items-center space-x-2">
            <div 
              className="h-6 w-6 rounded" 
              style={{ backgroundColor: config?.primaryColor || '#3B82F6' }}
            />
            <span className="font-bold text-sm">
              {config?.name || 'Kaely Suite Hotel'}
            </span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  )
}
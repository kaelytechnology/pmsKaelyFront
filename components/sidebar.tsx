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
import { useState } from 'react'
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
  const href = `/${tenant}${item.href}`
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
  
  // Obtener menú filtrado por permisos o usar menú por defecto
  const navigation = menuItems 
    ? filterMenuByPermissions(menuItems)
    : getDefaultMenu()

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
        {isMenuLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading menu...</span>
          </div>
        ) : menuError ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            <p>Using default menu</p>
            <p className="text-xs text-red-500 mt-1">Menu API unavailable</p>
          </div>
        ) : null}
        
        {navigation.map((item) => {
          const hasChildren = item.children && item.children.length > 0
          const href = `/${tenant}${item.href}`
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
                    const childHref = `/${tenant}${child.href}`
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
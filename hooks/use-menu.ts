'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/stores/auth'
import {
  Home,
  Users,
  Shield,
  Key,
  Settings,
  Calendar,
  BarChart3,
  Building,
  CreditCard,
  FileText,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Bookmark,
  Archive,
  Trash2,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Inbox,
  Folder,
  File,
  FileImage,
  FileVideo,
  Database,
  Server,
  Globe,
  Wifi,
  Battery,
  Camera,
  Video,
  Mic,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  HardDrive,
  Cpu,
  Printer,
  Mouse,
  Keyboard,
  Headphones,
  Speaker,
  Zap,
  Power,
  Play,
  Pause,
  type LucideIcon
} from 'lucide-react'

export interface MenuItem {
  id?: string | number
  name: string
  slug?: string
  route: string
  href?: string // Para compatibilidad
  icon?: string
  children?: MenuItem[]
  permissions?: string[]
  order?: number
  isActive?: boolean
  isVisible?: boolean
}

export interface MenuUser {
  id: number
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface MenuResponse {
  data: MenuItem[]
  user: MenuUser
}

// Mapeo de iconos de string a componentes de Lucide
const iconMap: Record<string, LucideIcon> = {
  home: Home,
  dashboard: Home,
  users: Users,
  user: Users,
  roles: Shield,
  role: Shield,
  permissions: Key,
  permission: Key,
  settings: Settings,
  setting: Settings,
  calendar: Calendar,
  analytics: BarChart3,
  reports: BarChart3,
  chart: BarChart3,
  building: Building,
  hotel: Building,
  room: Building,
  rooms: Building,
  payment: CreditCard,
  payments: CreditCard,
  billing: CreditCard,
  invoice: FileText,
  invoices: FileText,
  document: FileText,
  documents: FileText,
  mail: Mail,
  email: Mail,
  phone: Phone,
  contact: Phone,
  location: MapPin,
  address: MapPin,
  time: Clock,
  clock: Clock,
  schedule: Clock,
  star: Star,
  rating: Star,
  favorite: Star,
  bookmark: Bookmark,
  bookmarks: Bookmark,
  archive: Archive,
  trash: Trash2,
  delete: Trash2,
  edit: Edit,
  update: Edit,
  add: Plus,
  create: Plus,
  new: Plus,
  search: Search,
  find: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  share: Share,
  copy: Copy,
  view: Eye,
  show: Eye,
  hide: EyeOff,
  lock: Lock,
  unlock: Unlock,
  security: Lock,
  notification: Bell,
  notifications: Bell,
  alert: Bell,
  alerts: Bell,
  heart: Heart,
  like: Heart,
  thumbsup: ThumbsUp,
  thumbsdown: ThumbsDown,
  message: MessageSquare,
  messages: MessageSquare,
  chat: MessageSquare,
  send: Send,
  inbox: Inbox,
  folder: Folder,
  folders: Folder,
  file: File,
  files: File,
  image: FileImage,
  images: FileImage,
  video: FileVideo,
  videos: FileVideo,
  database: Database,
  server: Server,
  globe: Globe,
  world: Globe,
  internet: Globe,
  wifi: Wifi,
  battery: Battery,
  camera: Camera,
  mic: Mic,
  microphone: Mic,
  monitor: Monitor,
  screen: Monitor,
  smartphone: Smartphone,
  mobile: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  computer: Laptop,
  harddrive: HardDrive,
  storage: HardDrive,
  cpu: Cpu,
  processor: Cpu,
  printer: Printer,
  print: Printer,
  mouse: Mouse,
  keyboard: Keyboard,
  headphones: Headphones,
  speaker: Speaker,
  speakers: Speaker,
  power: Power,
  energy: Zap,
  play: Play,
  pause: Pause,
}

/**
 * Convierte iconos de FontAwesome a nombres de Lucide
 */
const convertFontAwesomeToLucide = (faIcon?: string): string => {
  if (!faIcon) return 'home'
  
  // Mapeo de iconos FontAwesome a Lucide
  const faToLucideMap: Record<string, string> = {
    'fas fa-shield-alt': 'shield',
    'fas fa-shield': 'shield',
    'fas fa-users': 'users',
    'fas fa-user': 'users',
    'fas fa-user-tag': 'shield', // roles
    'fas fa-key': 'key',
    'fas fa-home': 'home',
    'fas fa-dashboard': 'home',
    'fas fa-tachometer-alt': 'home',
    'fas fa-cog': 'settings',
    'fas fa-cogs': 'settings',
    'fas fa-settings': 'settings',
    'fas fa-calendar': 'calendar',
    'fas fa-chart-bar': 'chart',
    'fas fa-building': 'building',
    'fas fa-credit-card': 'payment',
    'fas fa-file-text': 'document',
    'fas fa-envelope': 'mail',
    'fas fa-phone': 'phone',
    'fas fa-map-marker': 'location',
    'fas fa-clock': 'time',
    'fas fa-star': 'star',
    'fas fa-bookmark': 'bookmark',
    'fas fa-archive': 'archive',
    'fas fa-trash': 'trash',
    'fas fa-edit': 'edit',
    'fas fa-plus': 'add',
    'fas fa-search': 'search',
    'fas fa-filter': 'filter',
    'fas fa-download': 'download',
    'fas fa-upload': 'upload',
    'fas fa-share': 'share',
    'fas fa-copy': 'copy',
    'fas fa-eye': 'view',
    'fas fa-eye-slash': 'hide',
    'fas fa-lock': 'lock',
    'fas fa-unlock': 'unlock',
    'fas fa-bell': 'notification',
    'fas fa-heart': 'heart',
    'fas fa-thumbs-up': 'thumbsup',
    'fas fa-thumbs-down': 'thumbsdown',
    'fas fa-comment': 'message',
    'fas fa-paper-plane': 'send',
    'fas fa-inbox': 'inbox',
    'fas fa-folder': 'folder',
    'fas fa-file': 'file',
    'fas fa-image': 'image',
    'fas fa-video': 'video',
    'fas fa-database': 'database',
    'fas fa-server': 'server',
    'fas fa-globe': 'globe',
    'fas fa-wifi': 'wifi',
    'fas fa-battery-full': 'battery',
    'fas fa-camera': 'camera',
    'fas fa-microphone': 'mic',
    'fas fa-desktop': 'monitor',
    'fas fa-mobile': 'smartphone',
    'fas fa-tablet': 'tablet',
    'fas fa-laptop': 'laptop',
    'fas fa-hdd': 'harddrive',
    'fas fa-microchip': 'cpu',
    'fas fa-print': 'printer',
    'fas fa-mouse': 'mouse',
    'fas fa-keyboard': 'keyboard',
    'fas fa-headphones': 'headphones',
    'fas fa-volume-up': 'speaker',
    'fas fa-power-off': 'power',
    'fas fa-bolt': 'energy',
    'fas fa-play': 'play',
    'fas fa-pause': 'pause',
  }
  
  return faToLucideMap[faIcon] || 'home'
}

/**
 * Obtiene el componente de icono basado en el nombre del string
 */
export const getIconComponent = (iconName?: string): LucideIcon => {
  if (!iconName) return Home
  
  const normalizedName = iconName.toLowerCase().replace(/[^a-z0-9]/g, '')
  return iconMap[normalizedName] || Home
}

/**
 * Funciones para persistencia del menú en localStorage y sessionStorage
 */
const MENU_STORAGE_KEY = 'cached-menu'
const SESSION_MENU_KEY = 'session-menu'
const MENU_CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

// Función para guardar menú en localStorage y sessionStorage
const saveMenuToStorage = (menu: MenuItem[]) => {
  if (typeof window === 'undefined') return
  
  try {
    const menuData = {
      menu,
      timestamp: Date.now(),
      expiresAt: Date.now() + MENU_CACHE_DURATION
    }
    const menuString = JSON.stringify(menuData)
    localStorage.setItem(MENU_STORAGE_KEY, menuString)
    sessionStorage.setItem(SESSION_MENU_KEY, menuString)
    console.log('💾 Menu saved to localStorage and sessionStorage')
  } catch (error) {
    console.warn('Failed to save menu to storage:', error)
  }
}

// Función para obtener menú desde localStorage o sessionStorage
const getMenuFromStorage = (): MenuItem[] | null => {
  if (typeof window === 'undefined') return null
  
  try {
    // Intentar primero sessionStorage (más rápido)
    let stored = sessionStorage.getItem(SESSION_MENU_KEY)
    if (!stored) {
      // Fallback a localStorage
      stored = localStorage.getItem(MENU_STORAGE_KEY)
    }
    
    if (!stored) return null
    
    const menuData = JSON.parse(stored)
    
    // Verificar si el cache ha expirado
    if (Date.now() > menuData.expiresAt) {
      localStorage.removeItem(MENU_STORAGE_KEY)
      sessionStorage.removeItem(SESSION_MENU_KEY)
      console.log('🗑️ Expired menu cache removed')
      return null
    }
    
    console.log('📦 Menu loaded from storage cache')
    return menuData.menu
  } catch (error) {
    console.warn('Failed to load menu from storage:', error)
    localStorage.removeItem(MENU_STORAGE_KEY)
    sessionStorage.removeItem(SESSION_MENU_KEY)
    return null
  }
}

/**
 * Hook para obtener el menú dinámico desde el API con persistencia local
 */
export const useMenu = () => {
  const { token, isAuthenticated, updateUserFromMenu, isInitialized } = useAuthStore()
  
  // Obtener datos iniciales desde localStorage para mostrar inmediatamente
  const getInitialData = (): MenuItem[] | undefined => {
    if (typeof window === 'undefined') {
      console.log('🚫 Server side - no initial data')
      return undefined
    }
    
    const cachedMenu = getMenuFromStorage()
    if (cachedMenu) {
      console.log('📦 Loading initial menu from cache:', cachedMenu.length, 'items')
      return cachedMenu
    }
    
    // Si no hay cache y no está autenticado, usar menú por defecto
    const authToken = localStorage.getItem('auth-token')
    if (!authToken) {
      console.log('🔄 Loading initial default menu (no auth token)')
      return getDefaultMenu()
    }
    
    console.log('⚠️ No initial data available')
    return undefined
  }
  
  const initialData = getInitialData()
  console.log('🔧 useMenu hook initialized with initialData:', !!initialData, initialData?.length || 0)
  
  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    initialData,
    queryFn: async () => {
      console.log('🚀 queryFn called - fetching menu from API')
      // Verificar token desde localStorage como fallback
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null)
      
      if (!authToken) {
        // Si no está autenticado, intentar cargar desde cache o usar menú por defecto
        const cachedMenu = getMenuFromStorage()
        if (cachedMenu) {
          console.log('📦 Using cached menu (not authenticated)')
          return cachedMenu
        }
        console.log('🔄 Using default menu (not authenticated)')
        return getDefaultMenu()
      }
      
      try {
        console.log('🔍 Fetching menu from API:', {
          endpoint: '/api/auth/menu',
          baseURL: api.defaults.baseURL,
          hasToken: !!authToken
        })
        
        const response = await api.get<MenuResponse>('/api/auth/menu')
        
        console.log('✅ Menu response:', response.data)
        
        if (response.data && response.data.data) {
          // Actualizar información del usuario con los datos del menú
          if (response.data.user) {
            updateUserFromMenu(response.data.user)
          }
          
          // Función recursiva para procesar menús con children
          const processMenuItems = (items: MenuItem[]): MenuItem[] => {
            return items
              .map(item => {
                // Normalizar la ruta para asegurar que tenga el prefijo correcto
                let normalizedHref = item.route || item.href || '#'
                
                // Si la ruta no empieza con '/' o es solo '#', mantenerla como está
                if (normalizedHref === '#' || normalizedHref.startsWith('http')) {
                  // Mantener rutas externas o placeholder
                } else if (normalizedHref.startsWith('/')) {
                  // Si empieza con '/', verificar si necesita prefijo /dashboard
                  if (!normalizedHref.startsWith('/dashboard') && normalizedHref !== '/') {
                    // Agregar prefijo /dashboard para rutas como /users, /roles, etc.
                    normalizedHref = `/dashboard${normalizedHref}`
                  }
                } else {
                  // Si no empieza con '/', agregar /dashboard/
                  normalizedHref = `/dashboard/${normalizedHref}`
                }
                
                return {
                  ...item,
                  href: normalizedHref,
                  icon: convertFontAwesomeToLucide(item.icon) || 'home', // Convertir iconos
                  isVisible: item.isVisible !== false, // Por defecto visible
                  children: item.children ? processMenuItems(item.children) : undefined
                }
              })
              .filter(item => item.isVisible) // Filtrar elementos no visibles
              .sort((a, b) => (a.order || 0) - (b.order || 0)) // Ordenar por order
          }
          
          const processedMenu = processMenuItems(response.data.data)
          
          // Guardar en localStorage para futuras cargas
          saveMenuToStorage(processedMenu)
          
          return processedMenu
        } else {
          throw new Error('Invalid menu response format')
        }
      } catch (error: any) {
        console.error('❌ Menu fetch error:', error)
        
        // Intentar cargar desde cache antes de usar menú por defecto
        const cachedMenu = getMenuFromStorage()
        if (cachedMenu) {
          console.log('📦 Using cached menu (API error)')
          return cachedMenu
        }
        
        // Si hay error y no hay cache, devolver menú por defecto
        console.log('🔄 Falling back to default menu')
        return getDefaultMenu()
      }
    },
    enabled: true, // Siempre habilitado para permitir cache
    staleTime: 0, // Siempre considerar datos como obsoletos para desarrollo
    cacheTime: 0, // No mantener cache para desarrollo
    retry: 2,
    retryDelay: 1000,
    // Configuración para mostrar datos cached mientras se actualiza
    refetchOnMount: true,
    refetchOnWindowFocus: true, // Refetch cuando la ventana gana foco
  })
}

/**
 * Menú por defecto en caso de error o falta de autenticación
 */
export const getDefaultMenu = (): MenuItem[] => {
  return [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'home',
      order: 1,
      isVisible: true,
    },
    {
      id: 'users',
      name: 'Users',
      href: '/dashboard/users',
      icon: 'users',
      order: 2,
      isVisible: true,
    },
    {
      id: 'roles',
      name: 'Roles',
      href: '/dashboard/roles',
      icon: 'roles',
      order: 3,
      isVisible: true,
    },
    {
      id: 'permissions',
      name: 'Permissions',
      href: '/dashboard/permissions',
      icon: 'permissions',
      order: 4,
      isVisible: true,
    },
  ]
}

/**
 * Hook para verificar si el usuario tiene permisos para un elemento del menú
 */
export const useMenuPermissions = () => {
  const { user } = useAuthStore()
  
  const hasPermission = (menuItem: MenuItem): boolean => {
    // Si no hay permisos requeridos, permitir acceso
    if (!menuItem.permissions || menuItem.permissions.length === 0) {
      return true
    }
    
    // Si no hay usuario, permitir acceso (será manejado por AuthGuard)
    if (!user) {
      return true
    }
    
    // Si el usuario no tiene permisos definidos, permitir acceso
    if (!user.permissions || user.permissions.length === 0) {
      return true
    }
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return menuItem.permissions.some(permission => 
      user.permissions.includes(permission)
    )
  }
  
  const filterMenuByPermissions = (menu: MenuItem[]): MenuItem[] => {
    return menu
      .filter(item => hasPermission(item))
      .map(item => ({
        ...item,
        children: item.children ? filterMenuByPermissions(item.children) : undefined
      }))
  }
  
  return {
    hasPermission,
    filterMenuByPermissions
  }
}
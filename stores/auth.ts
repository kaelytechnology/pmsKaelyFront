import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/axios'
import toast from 'react-hot-toast'

export interface User {
  id: string | number
  email: string
  name: string
  roles: string[]
  permissions: string[]
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  refreshToken: () => Promise<boolean>
  fetchUser: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  updateUserFromMenu: (menuUser: { id: number; name: string; email: string; roles: string[]; permissions: string[] }) => void
  initialize: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      name: string
      email: string
      is_active: boolean
    }
    token: string
    token_type: string
  }
}

export const useAuthStore = create<AuthState>()(persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          console.log('🚀 Starting login attempt:', {
            email,
            baseURL: api.defaults.baseURL,
            endpoint: '/api/auth/login',
            fullURL: `${api.defaults.baseURL}/api/auth/login`
          })
          
          const response = await api.post<LoginResponse>('/api/auth/login', {
            email,
            password,
          })

          console.log('✅ Login response:', response.data)
          
          if (response.data.success) {
            const { user: apiUser, token } = response.data.data
            
            // Transform API user to our User interface
            const user: User = {
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name,
              roles: ['admin'], // Default role, will be updated from menu API
              permissions: [], // Default permissions, will be updated from menu API
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
            
            // Store token in localStorage for axios interceptor
            localStorage.setItem('auth-token', token)
            
            toast.success(response.data.message || 'Login successful!')
            return true
          } else {
            set({ isLoading: false })
            toast.error(response.data.message || 'Login failed')
            return false
          }
        } catch (error: any) {
          console.error('Login error:', error)
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return false
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        try {
          const response = await api.post<LoginResponse>('/api/auth/register', data)
          
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          localStorage.setItem('auth-token', token)
          
          toast.success('Registration successful!')
          return true
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-user')
        
        // Call logout endpoint
        api.post('/api/auth/logout').catch(() => {})
        
        toast.success('Logged out successfully')
      },

      refreshToken: async () => {
        try {
          const response = await api.post<LoginResponse>('/api/auth/refresh')
          const { user, token } = response.data
          
          set({
            user,
            token,
            isAuthenticated: true,
          })
          
          localStorage.setItem('auth-token', token)
          return true
        } catch (error) {
          get().logout()
          return false
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get<User>('/api/auth/me')
          set({ user: response.data })
        } catch (error) {
          get().logout()
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true })
        localStorage.setItem('auth-token', token)
      },

      updateUserFromMenu: (menuUser) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser: User = {
            ...currentUser,
            id: menuUser.id,
            name: menuUser.name,
            email: menuUser.email,
            roles: menuUser.roles,
            permissions: menuUser.permissions,
            updatedAt: new Date().toISOString(),
          }
          set({ user: updatedUser })
        }
      },

      initialize: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth-token')
          if (token) {
            set({ token, isAuthenticated: true, isInitialized: true })
          } else {
            set({ isInitialized: true })
          }
        } else {
          set({ isInitialized: true })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
)
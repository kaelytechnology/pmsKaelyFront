'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { api } from '@/lib/axios'
import { Users, Shield, Key, Activity, TrendingUp, Calendar } from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalRoles: number
  totalPermissions: number
  activeUsers: number
  recentLogins: number
  systemHealth: 'good' | 'warning' | 'error'
}

interface PageProps {
  params: {
    tenant: string
  }
}

export default function DashboardPage({ params }: PageProps) {
  const { tenant } = params
  const { user } = useAuthStore()
  const { config } = useTenantStore()

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', tenant],
    queryFn: async () => {
      // Mock data for demo - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        totalUsers: Math.floor(Math.random() * 100) + 50,
        totalRoles: Math.floor(Math.random() * 10) + 5,
        totalPermissions: Math.floor(Math.random() * 20) + 15,
        activeUsers: Math.floor(Math.random() * 50) + 25,
        recentLogins: Math.floor(Math.random() * 30) + 10,
        systemHealth: 'good' as const,
      }
    },
  })

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'Registered users in the system',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      description: 'Users active in the last 30 days',
      icon: Activity,
      color: 'text-green-600',
    },
    {
      title: 'Total Roles',
      value: stats?.totalRoles || 0,
      description: 'Configured user roles',
      icon: Shield,
      color: 'text-purple-600',
    },
    {
      title: 'Permissions',
      value: stats?.totalPermissions || 0,
      description: 'Available system permissions',
      icon: Key,
      color: 'text-orange-600',
    },
    {
      title: 'Recent Logins',
      value: stats?.recentLogins || 0,
      description: 'Logins in the last 24 hours',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      title: 'System Health',
      value: stats?.systemHealth === 'good' ? '✓' : '⚠',
      description: 'Overall system status',
      icon: Calendar,
      color: stats?.systemHealth === 'good' ? 'text-green-600' : 'text-yellow-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at {config?.name || 'your hotel'} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activities and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>New user registered</span>
                  <span className="text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Role permissions updated</span>
                  <span className="text-muted-foreground">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>System backup completed</span>
                  <span className="text-muted-foreground">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>New feature deployed</span>
                  <span className="text-muted-foreground">3 hours ago</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent">
                <Users className="h-4 w-4" />
                <span className="text-sm">Add New User</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Manage Roles</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent">
                <Key className="h-4 w-4" />
                <span className="text-sm">Update Permissions</span>
              </button>
              <button className="flex items-center space-x-2 rounded-lg border p-3 text-left hover:bg-accent">
                <Activity className="h-4 w-4" />
                <span className="text-sm">View Reports</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
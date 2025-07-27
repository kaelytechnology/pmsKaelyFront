'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTenantTheme } from '@/hooks/use-tenant-theme'
import { useTenantUrl } from '@/hooks/use-tenant-url'
import { Hotel, Users, Shield, BarChart3 } from 'lucide-react'

interface PageProps {
  params: {
    tenant: string
  }
}

const tenantConfigs = {
  ixtapa: {
    name: 'Kaely Suite Hotel Ixtapa',
    description: 'Experience luxury hospitality management in beautiful Ixtapa',
    color: 'from-blue-600 to-blue-800',
  },
  manzanillo: {
    name: 'Kaely Suite Hotel Manzanillo',
    description: 'Discover premium hotel management solutions in Manzanillo',
    color: 'from-emerald-600 to-emerald-800',
  },
  huatulco: {
    name: 'Kaely Suite Hotel Huatulco',
    description: 'Elevate your hospitality experience in stunning Huatulco',
    color: 'from-amber-600 to-amber-800',
  },
}

const features = [
  {
    icon: Users,
    title: 'User Management',
    description: 'Comprehensive user and staff management system',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description: 'Secure role and permission management',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Detailed insights and performance analytics',
  },
  {
    icon: Hotel,
    title: 'Hotel Operations',
    description: 'Complete hotel management and operations',
  },
]

export default function LandingPage({ params }: PageProps) {
  const { tenant } = params
  const tenantConfig = useTenantTheme()
  const { createUrl } = useTenantUrl(tenant)
  const config = tenantConfigs[tenant as keyof typeof tenantConfigs] || tenantConfigs.ixtapa

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div 
              className="h-8 w-8 rounded" 
              style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}
            />
            <span className="font-bold">{tenantConfig?.name || config.name}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href={createUrl('login')}>
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {tenantConfig?.name || config.name}
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            {tenantConfig ? `Experience luxury hospitality management in beautiful ${tenantConfig.slug.charAt(0).toUpperCase() + tenantConfig.slug.slice(1)}` : config.description}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href={createUrl('login')}>
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href={createUrl('dashboard')}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage your hotel operations efficiently
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of hotels already using our platform
          </p>
          <Link href={createUrl('login')}>
            <Button size="lg">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {tenantConfig?.name || config.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
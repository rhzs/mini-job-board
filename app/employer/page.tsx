"use client"

import React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { EmployerDashboard } from '@/components/employer/employer-dashboard'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function EmployerLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function EmployerPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Show loading if auth is still loading
  if (authLoading) {
    return <EmployerLoading />
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return <EmployerLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <EmployerDashboard />
      </main>
      <Footer />
    </div>
  )
} 
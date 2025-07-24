"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { EmployerDashboard } from '@/components/employer/employer-dashboard'

// Loading skeleton component
function EmployerJobsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
              <div className="flex space-x-4">
                <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          </div>
          
          {/* Filters skeleton */}
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted rounded w-24 animate-pulse"></div>
            ))}
          </div>
          
          {/* Table skeleton */}
          <div className="border rounded-lg p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function EmployerJobsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Show loading while auth is loading or user check is happening
  if (!mounted || authLoading || !user) {
    return <EmployerJobsLoading />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <EmployerDashboard />
      </main>
      <Footer />
    </div>
  )
} 
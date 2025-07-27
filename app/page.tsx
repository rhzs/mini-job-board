"use client"

import React, { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import HeaderWrapper from "@/components/header-wrapper"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import { JobSearchPage } from "@/components/jobs/job-search-page"
import { PersonalizedRecommendations } from "@/components/jobs/personalized-recommendations"
import { SupabaseDevPanel } from "@/components/dev/supabase-dev-panel"
import { MyJobsDashboard } from "@/components/my-jobs/my-jobs-dashboard"
import { EmployerDashboard } from "@/components/employer/employer-dashboard"
import { SignInModal } from '@/components/auth/signin-modal'
import { SignUpModal } from '@/components/auth/signup-modal'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'

import { useAuth } from '@/lib/auth-context'
import { useIsCompanyMode } from '@/lib/tenant-context'

// Loading component for suspense
function PageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PageContent() {
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const currentPage = searchParams.get('page')
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const hasQueryParam = searchParams.has('q')
  const { isCompanyMode, isLoading: tenantLoading } = useIsCompanyMode()

  // Redirect to home if trying to access My Jobs without authentication
  useEffect(() => {
    if (!authLoading && !user && currentPage === 'my-jobs') {
      router.push('/')
    }
  }, [user, authLoading, currentPage, router])

  // Show loading if auth or tenant data is still loading
  if (authLoading || tenantLoading) {
    return <PageLoading />
  }

  // Show My Jobs dashboard when page=my-jobs (only if user is authenticated)
  if (currentPage === 'my-jobs') {
    if (!user) {
      // This will trigger the redirect effect above, show loading meanwhile
      return <PageLoading />
    }
    
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <main className="flex-1">
          <MyJobsDashboard />
        </main>
        <Footer />
      </div>
    )
  }

  // Show employer dashboard if user is in company mode and on homepage (no query/location)
  if (user && isCompanyMode && !hasQueryParam && !location && !currentPage) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <main className="flex-1">
          <EmployerDashboard />
        </main>
        <Footer />
      </div>
    )
  }

  // Show job search if there's a query parameter OR location OR if user is logged in (for homepage in personal mode)
  if (hasQueryParam || location || (user && !isCompanyMode)) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderWrapper />
        <main className="flex-1">
          <JobSearchPage 
            initialQuery={query} 
            initialLocation={location || 'Singapore'} 
          />
          {/* Show personalized recommendations for logged-in users on homepage (no search query) */}
          {user && !hasQueryParam && !location && !isCompanyMode && (
            <PersonalizedRecommendations />
          )}
        </main>
        <Footer />
      </div>
    )
  }

  // Homepage for anonymous users
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<PageLoading />}>
        <PageContent />
      </Suspense>
      
      {/* Auth Modals */}
      <SignInModal />
      <SignUpModal />
      <OnboardingModal />
      
      {/* Development Tools - Only show in development */}
      {process.env.NODE_ENV === 'development' && <SupabaseDevPanel />}
    </>
  )
} 
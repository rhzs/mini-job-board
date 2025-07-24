"use client"

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from "@/components/header"
import Footer from "@/components/footer"
import HeroSection from "@/components/hero-section"
import { JobSearchPage } from "@/components/jobs/job-search-page"
import { PersonalizedRecommendations } from "@/components/jobs/personalized-recommendations"
import { MyJobsDashboard } from "@/components/my-jobs/my-jobs-dashboard"
import { SignInModal } from '@/components/auth/signin-modal'
import { SignUpModal } from '@/components/auth/signup-modal'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { SupabaseStatus } from '@/components/auth/supabase-status'
import { useAuth } from '@/lib/auth-context'

// Loading component for suspense
function PageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
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
  const currentPage = searchParams.get('page')
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''

  // Show loading if auth is still loading
  if (authLoading) {
    return <PageLoading />
  }

  // Show My Jobs dashboard when page=my-jobs
  if (currentPage === 'my-jobs') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <MyJobsDashboard />
        </main>
        <Footer />
      </div>
    )
  }

  // Show job search if there's a query OR if user is logged in (for homepage)
  if (query || location || user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex-1">
          <JobSearchPage 
            initialQuery={query} 
            initialLocation={location || 'Singapore'} 
          />
          {/* Show personalized recommendations for logged-in users on homepage (no search query) */}
          {user && !query && !location && (
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
      <Header />
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

      {/* Dev Helper */}
      <SupabaseStatus />
    </>
  )
} 
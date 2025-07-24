"use client"

import React from 'react'

import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import Footer from '@/components/footer'
import { SignInModal } from '@/components/auth/signin-modal'
import { SignUpModal } from '@/components/auth/signup-modal'
import { SupabaseStatus } from '@/components/auth/supabase-status'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { PersonalizedRecommendations } from '@/components/jobs/personalized-recommendations'
import { JobSearchPage } from '@/components/jobs/job-search-page'
import { MyJobsDashboard } from '@/components/my-jobs/my-jobs-dashboard'
import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  // Check if user is authenticated or if search params exist (job search mode)
  const showJobSearch = user || searchParams.get('q') || searchParams.get('search')
  const showMyJobs = searchParams.get('page') === 'my-jobs'

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        {showMyJobs ? (
          <MyJobsDashboard />
        ) : showJobSearch ? (
          <JobSearchPage 
            initialQuery={searchParams.get('q') || searchParams.get('search') || ''}
            initialLocation={searchParams.get('location') || 'Singapore'}
          />
        ) : (
          <>
            <HeroSection />
            <PersonalizedRecommendations />
          </>
        )}
      </div>
      <Footer />

      {/* Auth Modals */}
      <SignInModal />
      <SignUpModal />
      <OnboardingModal />

      {/* Dev Helper */}
      <SupabaseStatus />
    </main>
  )
} 
"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { UserPreferences } from '@/lib/database.types'
import { fetchRecommendedJobs, convertJobPostingToJob } from '@/lib/supabase-jobs'
import { getJobRecommendations, JobMatchScore } from '@/lib/job-matching'
import { JobCard } from './job-card'
import { JobMatchBadge } from './job-match-badge'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function PersonalizedRecommendations() {
  const { user, openOnboarding } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [recommendations, setRecommendations] = useState<JobMatchScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserPreferences()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserPreferences = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error)
        setLoading(false)
        return
      }

      if (data) {
        setPreferences(data)
        
        // Fetch recommended jobs from Supabase
        const recommendedJobs = await fetchRecommendedJobs(user.id, 6)
        
        if (recommendedJobs.length > 0) {
          // Convert to Job format and get match scores
          const convertedJobs = recommendedJobs.map(convertJobPostingToJob)
          const jobRecommendations = getJobRecommendations(convertedJobs, data, 6)
          setRecommendations(jobRecommendations)
        } else {
          setRecommendations([])
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAll = () => {
    if (preferences?.job_titles && preferences.job_titles.length > 0) {
      const query = preferences.job_titles[0] // Use first job title as search query
      router.push(`/?q=${encodeURIComponent(query)}`)
    } else {
      router.push('/')
    }
  }

  const handleUpdatePreferences = () => {
    openOnboarding()
  }

  if (!user) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sparkles className="h-12 w-12 text-indeed-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Get Personalized Job Recommendations
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Sign up to receive job recommendations tailored to your skills, experience, and preferences.
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-indeed-blue hover:bg-indeed-blue-dark"
            >
              Browse All Jobs
            </Button>
          </div>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!preferences || !preferences.onboarding_completed) {
    return (
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Settings className="h-12 w-12 text-indeed-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Complete Your Profile for Better Recommendations
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Tell us about your job preferences to get personalized recommendations.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleUpdatePreferences}
                className="bg-indeed-blue hover:bg-indeed-blue-dark"
              >
                Complete Profile
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
              >
                Browse All Jobs
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-indeed-blue" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Recommended for You
              </h2>
              <p className="text-muted-foreground">
                Based on your preferences and location
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUpdatePreferences}
            >
              <Settings className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
            <Button 
              onClick={handleViewAll}
              className="bg-indeed-blue hover:bg-indeed-blue-dark"
            >
              View All Jobs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation) => (
              <div key={recommendation.job.id} className="relative">
                <JobCard
                  job={recommendation.job}
                  isSelected={false}
                  onClick={() => router.push(`/job/${recommendation.job.id}`)}
                />
                {/* Match Badge Overlay */}
                <div className="absolute top-3 right-3">
                  <JobMatchBadge matchScore={recommendation} compact />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No recommendations yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're working on finding the perfect jobs for you. Check back soon or browse all available positions.
            </p>
            <Button 
              onClick={handleViewAll}
              className="bg-indeed-blue hover:bg-indeed-blue-dark"
            >
              Browse All Jobs
            </Button>
          </div>
        )}

        {/* Preferences Summary */}
        {preferences && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Your Preferences:</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {preferences.job_titles && preferences.job_titles.length > 0 && (
                <span className="bg-background px-3 py-1 rounded-full border">
                  {preferences.job_titles.slice(0, 2).join(', ')}
                  {preferences.job_titles.length > 2 && ` +${preferences.job_titles.length - 2} more`}
                </span>
              )}
              {preferences.city && (
                <span className="bg-background px-3 py-1 rounded-full border">
                  📍 {preferences.city}
                </span>
              )}
              {preferences.remote_work && (
                <span className="bg-background px-3 py-1 rounded-full border">
                  🏠 Remote work
                </span>
              )}
              {preferences.minimum_pay && (
                <span className="bg-background px-3 py-1 rounded-full border">
                  💰 ${preferences.minimum_pay}+ per {preferences.pay_period}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 
"use client"

import React, { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { Job } from '@/lib/database.types'
import { fetchJobById, convertJobPostingToJob, incrementJobViewCount } from '@/lib/supabase-jobs'
import { JobDetail } from '@/components/jobs/job-detail'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface JobPageProps {
  params: {
    id: string
  }
}

// Loading skeleton for job detail page
function JobDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-muted rounded w-1/2 mb-3"></div>
        <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-5 bg-muted rounded w-1/4 mb-6"></div>
        <div className="flex gap-3 mb-8">
          <div className="h-10 w-24 bg-muted rounded"></div>
          <div className="h-10 w-20 bg-muted rounded"></div>
          <div className="h-10 w-10 bg-muted rounded"></div>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-6 mb-6">
        <div className="h-6 bg-muted rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/6"></div>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-6 mb-6">
        <div className="h-6 bg-muted rounded w-1/4 mb-3"></div>
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function JobPage({ params }: JobPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [job, setJob] = useState<Job | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const jobPosting = await fetchJobById(params.id)
      
      if (jobPosting) {
        // Convert JobPosting to Job format for compatibility
        const convertedJob = convertJobPostingToJob(jobPosting)
        setJob(convertedJob)
        
        // Increment view count
        await incrementJobViewCount(params.id)
      } else {
        setError('Job not found')
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      setError('Failed to load job')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state first
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <JobDetailSkeleton />
        </main>
        <Footer />
      </div>
    )
  }

  // Then check if job exists after loading is complete
  if (error || !job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <JobDetail job={job} />
      </main>
      <Footer />
    </div>
  )
} 
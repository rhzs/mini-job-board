"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { JobApplication, ApplicationFormData } from '@/lib/database.types'
import { Job } from '@/lib/mock-data'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface JobApplicationsContextType {
  applications: JobApplication[]
  loading: boolean
  applyToJob: (job: Job, applicationData: ApplicationFormData) => Promise<{ success: boolean; error?: string }>
  updateApplicationStatus: (applicationId: string, status: JobApplication['status']) => Promise<void>
  withdrawApplication: (applicationId: string) => Promise<void>
  getApplicationByJobId: (jobId: string) => JobApplication | undefined
  hasAppliedToJob: (jobId: string) => boolean
  refetchApplications: () => Promise<void>
}

const JobApplicationsContext = createContext<JobApplicationsContextType | undefined>(undefined)

export function JobApplicationsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true) // Start with loading true

  // Fetch user applications when user changes
  useEffect(() => {
    // Don't update loading state if auth is still loading
    if (authLoading) {
      setLoading(true)
      return
    }

    if (user) {
      fetchApplications()
    } else {
      setApplications([])
      setLoading(false)
    }
  }, [user, authLoading])

  const fetchApplications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_date', { ascending: false })

      if (error) {
        console.error('Error fetching applications:', error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyToJob = async (job: Job, applicationData: ApplicationFormData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to apply' }
    }

    // Check if already applied
    const existingApplication = applications.find(app => app.job_id === job.id)
    if (existingApplication) {
      return { success: false, error: 'You have already applied to this job' }
    }

    try {
      const applicationRecord: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        job_id: job.id,
        status: 'applied',
        applied_date: new Date().toISOString(),
        cover_letter: applicationData.cover_letter,
        resume_url: applicationData.resume_url,
        job_title: job.title,
        company_name: job.company,
        job_location: job.location,
        job_salary: job.salary ? `$${job.salary.min} - $${job.salary.max} ${job.salary.period}` : undefined,
        job_type: job.jobType,
        last_updated: new Date().toISOString(),
        notes: applicationData.why_interested
      }

      const { data, error } = await supabase
        .from('job_applications')
        .insert([applicationRecord])
        .select()
        .single()

      if (error) {
        console.error('Error applying to job:', error)
        return { success: false, error: 'Failed to submit application' }
      }

      // Add to local state
      setApplications(prev => [data, ...prev])
      return { success: true }
    } catch (error) {
      console.error('Error applying to job:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ 
          status, 
          last_updated: new Date().toISOString() 
        })
        .eq('id', applicationId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating application status:', error)
        return
      }

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status, last_updated: new Date().toISOString() }
            : app
        )
      )
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const withdrawApplication = async (applicationId: string) => {
    await updateApplicationStatus(applicationId, 'withdrawn')
  }

  const getApplicationByJobId = (jobId: string): JobApplication | undefined => {
    return applications.find(app => app.job_id === jobId)
  }

  const hasAppliedToJob = (jobId: string): boolean => {
    return applications.some(app => app.job_id === jobId)
  }

  const refetchApplications = async () => {
    await fetchApplications()
  }

  const value: JobApplicationsContextType = {
    applications,
    loading,
    applyToJob,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationByJobId,
    hasAppliedToJob,
    refetchApplications
  }

  return (
    <JobApplicationsContext.Provider value={value}>
      {children}
    </JobApplicationsContext.Provider>
  )
}

export function useJobApplications() {
  const context = useContext(JobApplicationsContext)
  if (context === undefined) {
    throw new Error('useJobApplications must be used within a JobApplicationsProvider')
  }
  return context
}

export function useApplyToJob(jobId: string) {
  const { applyToJob, hasAppliedToJob, getApplicationByJobId, loading } = useJobApplications()
  
  const hasApplied = hasAppliedToJob(jobId)
  const application = getApplicationByJobId(jobId)
  
  return {
    applyToJob,
    hasApplied,
    application,
    loading
  }
} 
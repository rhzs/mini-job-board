"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { JobPosting, JobPostingFormData } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useTenant } from '@/lib/tenant-context'

interface JobPostingsContextType {
  jobPostings: JobPosting[]
  loading: boolean
  createJobPosting: (jobData: JobPostingFormData) => Promise<{ success: boolean; error?: string; data?: JobPosting }>
  updateJobPosting: (jobId: string, updates: Partial<JobPosting>) => Promise<{ success: boolean; error?: string }>
  deleteJobPosting: (jobId: string) => Promise<{ success: boolean; error?: string }>
  updateJobStatus: (jobId: string, status: JobPosting['status']) => Promise<{ success: boolean; error?: string }>
  refetchJobPostings: () => Promise<void>
}

const JobPostingsContext = createContext<JobPostingsContextType | undefined>(undefined)

export function JobPostingsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const { currentCompany, isLoading: tenantLoading } = useTenant()
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch job postings when user or current company changes
  useEffect(() => {
    // Don't update loading state if auth or tenant is still loading
    if (authLoading || tenantLoading) {
      setLoading(true)
      return
    }

    if (user) {
      fetchJobPostings()
    } else {
      setJobPostings([])
      setLoading(false)
    }
  }, [user, authLoading, currentCompany, tenantLoading])

  const fetchJobPostings = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      // If user is in company mode, filter by company_id
      // Otherwise, filter by employer_id (personal mode - show only their own jobs)
      if (currentCompany?.company_id) {
        query = query.eq('company_id', currentCompany.company_id)
      } else {
        query = query.eq('employer_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching job postings:', error)
        return
      }

      setJobPostings(data || [])
    } catch (error) {
      console.error('Error fetching job postings:', error)
    } finally {
      setLoading(false)
    }
  }

  const createJobPosting = async (jobData: JobPostingFormData): Promise<{ success: boolean; error?: string; data?: JobPosting }> => {
    if (!user) {
      return { success: false, error: 'You must be logged in to create a job posting' }
    }

    try {
      // Determine the company_id to use:
      // If in company mode, use the current company
      // Otherwise, use the company_id from the form data
      const companyId = currentCompany?.company_id || jobData.company_id

      // Fetch company name from companies table using company_id
      let companyName = 'Unknown Company'
      if (companyId) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single()
        
        if (!companyError && companyData) {
          companyName = companyData.name
        }
      }

      const jobPosting: Omit<JobPosting, 'id' | 'created_at' | 'updated_at'> = {
        employer_id: user.id,
        title: jobData.title,
        description: jobData.description,
        company_id: companyId,
        company_name: companyName,
        location: jobData.location,
        job_type: jobData.job_type,
        remote_allowed: jobData.remote_allowed,
        salary_min: jobData.salary_min,
        salary_max: jobData.salary_max,
        salary_period: jobData.salary_period,
        salary_currency: jobData.salary_currency || 'SGD',
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        experience_level: jobData.experience_level,
        status: 'pending',
        is_featured: false,
        is_sponsored: false,
        easy_apply: jobData.easy_apply,
        external_apply_url: jobData.external_apply_url,
        application_deadline: jobData.application_deadline,
        contact_email: jobData.contact_email,
        company_website: jobData.company_website,
        view_count: 0,
        application_count: 0,
        posted_date: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('job_postings')
        .insert([jobPosting])
        .select()
        .single()

      if (error) {
        console.error('Error creating job posting:', error)
        return { success: false, error: 'Failed to create job posting' }
      }

      // Add to local state
      setJobPostings(prev => [data, ...prev])
      return { success: true, data }
    } catch (error) {
      console.error('Error creating job posting:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateJobPosting = async (jobId: string, updates: Partial<JobPosting>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'You must be logged in' }

    try {
      let query = supabase
        .from('job_postings')
        .update({ 
          ...updates,
          last_updated: new Date().toISOString() 
        })
        .eq('id', jobId)

      // Apply the same access control as fetching:
      // In company mode, allow updating any job from the company
      // In personal mode, only allow updating user's own jobs
      if (currentCompany?.company_id) {
        query = query.eq('company_id', currentCompany.company_id)
      } else {
        query = query.eq('employer_id', user.id)
      }

      const { error } = await query

      if (error) {
        console.error('Error updating job posting:', error)
        return { success: false, error: 'Failed to update job posting' }
      }

      // Update local state
      setJobPostings(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, ...updates, last_updated: new Date().toISOString() }
            : job
        )
      )

      return { success: true }
    } catch (error) {
      console.error('Error updating job posting:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const deleteJobPosting = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'You must be logged in' }

    try {
      let query = supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      // Apply the same access control as fetching:
      // In company mode, allow deleting any job from the company
      // In personal mode, only allow deleting user's own jobs
      if (currentCompany?.company_id) {
        query = query.eq('company_id', currentCompany.company_id)
      } else {
        query = query.eq('employer_id', user.id)
      }

      const { error } = await query

      if (error) {
        console.error('Error deleting job posting:', error)
        return { success: false, error: 'Failed to delete job posting' }
      }

      // Remove from local state
      setJobPostings(prev => prev.filter(job => job.id !== jobId))
      return { success: true }
    } catch (error) {
      console.error('Error deleting job posting:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updateJobStatus = async (jobId: string, status: JobPosting['status']): Promise<{ success: boolean; error?: string }> => {
    return updateJobPosting(jobId, { status })
  }

  const refetchJobPostings = async () => {
    await fetchJobPostings()
  }

  const value: JobPostingsContextType = {
    jobPostings,
    loading,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    updateJobStatus,
    refetchJobPostings
  }

  return (
    <JobPostingsContext.Provider value={value}>
      {children}
    </JobPostingsContext.Provider>
  )
}

export function useJobPostings() {
  const context = useContext(JobPostingsContext)
  if (context === undefined) {
    throw new Error('useJobPostings must be used within a JobPostingsProvider')
  }
  return context
} 
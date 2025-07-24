"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Job } from '@/lib/mock-data'

interface SavedJobsContextType {
  savedJobs: string[]
  saveJob: (jobId: string) => Promise<void>
  unsaveJob: (jobId: string) => Promise<void>
  isJobSaved: (jobId: string) => boolean
  loading: boolean
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined)

export function SavedJobsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSavedJobs()
    } else {
      setSavedJobs([])
      setLoading(false)
    }
  }, [user])

  const fetchSavedJobs = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id)

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching saved jobs:', error)
        return
      }

      if (data) {
        setSavedJobs(data.map(item => item.job_id))
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveJob = async (jobId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .insert([{
          user_id: user.id,
          job_id: jobId,
          created_at: new Date().toISOString()
        }])

      if (error) {
        console.error('Error saving job:', error)
        return
      }

      setSavedJobs(prev => [...prev, jobId])
    } catch (error) {
      console.error('Error saving job:', error)
    }
  }

  const unsaveJob = async (jobId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)

      if (error) {
        console.error('Error unsaving job:', error)
        return
      }

      setSavedJobs(prev => prev.filter(id => id !== jobId))
    } catch (error) {
      console.error('Error unsaving job:', error)
    }
  }

  const isJobSaved = (jobId: string) => {
    return savedJobs.includes(jobId)
  }

  const value = {
    savedJobs,
    saveJob,
    unsaveJob,
    isJobSaved,
    loading
  }

  return (
    <SavedJobsContext.Provider value={value}>
      {children}
    </SavedJobsContext.Provider>
  )
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext)
  if (context === undefined) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider')
  }
  return context
}

// Hook for easier use in components
export function useSaveJobButton(jobId: string) {
  const { saveJob, unsaveJob, isJobSaved, loading } = useSavedJobs()
  const saved = isJobSaved(jobId)

  const toggleSave = async () => {
    if (saved) {
      await unsaveJob(jobId)
    } else {
      await saveJob(jobId)
    }
  }

  return {
    saved,
    toggleSave,
    loading
  }
} 
"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { JobCard } from './job-card'
import { JobDetail } from './job-detail'
import { JobFilters } from './job-filters'
import { NoResults } from './no-results'
import { JobMatchBadge } from './job-match-badge'
import { type Job } from '@/lib/mock-data'
import { JobPosting } from '@/lib/database.types'
import { fetchJobs, convertJobPostingToJob, type JobFilters as SupabaseJobFilters } from '@/lib/supabase-jobs'
import { Search, MapPin, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { UserPreferences } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { rankJobsByMatch, JobMatchScore } from '@/lib/job-matching'

interface JobSearchPageProps {
  initialQuery?: string
  initialLocation?: string
}

export interface JobFilters {
  salary?: { min: number; max: number }
  remote?: boolean
  jobType?: string[]
  company?: string
  location?: string
  datePosted?: string
}

export function JobSearchPage({ initialQuery = '', initialLocation = 'Singapore' }: JobSearchPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [filters, setFilters] = useState<JobFilters>({})
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // Parse filters from URL on mount
  useEffect(() => {
    const urlFilters: JobFilters = {}
    
    // Parse salary filter
    const minSalary = searchParams.get('minSalary')
    const maxSalary = searchParams.get('maxSalary')
    if (minSalary && maxSalary) {
      urlFilters.salary = { min: parseInt(minSalary), max: parseInt(maxSalary) }
    }
    
    // Parse remote filter
    const remote = searchParams.get('remote')
    if (remote) {
      urlFilters.remote = remote === 'true'
    }
    
    // Parse job type filter
    const jobType = searchParams.get('jobType')
    if (jobType) {
      urlFilters.jobType = jobType.split(',')
    }
    
    // Parse date posted filter
    const datePosted = searchParams.get('datePosted')
    if (datePosted) {
      urlFilters.datePosted = datePosted
    }
    
    // Parse sort by
    const sortParam = searchParams.get('sort')
    if (sortParam === 'date' || sortParam === 'relevance') {
      setSortBy(sortParam)
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters)
    }
  }, [searchParams])

  // Update URL when search parameters change
  const updateURL = (newQuery: string, newLocation: string, newFilters: JobFilters, newSort: string) => {
    const params = new URLSearchParams()
    
    if (newQuery.trim()) params.set('q', newQuery.trim())
    if (newLocation.trim() && newLocation !== 'Singapore') params.set('location', newLocation.trim())
    
    // Add filter params
    if (newFilters.salary) {
      params.set('minSalary', newFilters.salary.min.toString())
      params.set('maxSalary', newFilters.salary.max.toString())
    }
    if (newFilters.remote !== undefined) {
      params.set('remote', newFilters.remote.toString())
    }
    if (newFilters.jobType && newFilters.jobType.length > 0) {
      params.set('jobType', newFilters.jobType.join(','))
    }
    if (newFilters.datePosted) {
      params.set('datePosted', newFilters.datePosted)
    }
    if (newSort !== 'relevance') {
      params.set('sort', newSort)
    }
    
    const queryString = params.toString()
    const newUrl = queryString ? `/?${queryString}` : '/'
    router.replace(newUrl, { scroll: false })
  }

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobsFromSupabase()
  }, [query, location, filters])

  const fetchJobsFromSupabase = async () => {
    setLoading(true)
    try {
      const supabaseFilters: SupabaseJobFilters = {
        query: query.trim() || undefined,
        location: location.trim() || undefined,
        remote: filters.remote,
        jobType: filters.jobType,
        salary: filters.salary,
        company: filters.company,
        datePosted: filters.datePosted
      }

      const result = await fetchJobs(supabaseFilters)
      
      if (result.error) {
        console.error('Error fetching jobs:', result.error)
        setJobs([])
      } else {
        // Convert JobPosting to Job format for compatibility
        const convertedJobs = result.jobs.map(convertJobPostingToJob)
        
        // Sort jobs with personalization
        if (sortBy === 'relevance' && preferences) {
          const rankedJobs = rankJobsByMatch(convertedJobs, preferences)
          setJobs(rankedJobs.map(match => match.job))
        } else if (sortBy === 'date') {
          const sortedJobs = [...convertedJobs].sort((a, b) => 
            new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          )
          setJobs(sortedJobs)
        } else {
          setJobs(convertedJobs)
        }

        // Set first job as selected if none selected
        if (!selectedJobId && convertedJobs.length > 0) {
          setSelectedJobId(convertedJobs[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  // Re-sort when sortBy or preferences change (without refetching)
  useEffect(() => {
    if (jobs.length > 0) {
      if (sortBy === 'relevance' && preferences) {
        const rankedJobs = rankJobsByMatch(jobs, preferences)
        setJobs(rankedJobs.map(match => match.job))
      } else if (sortBy === 'date') {
        const sortedJobs = [...jobs].sort((a, b) => 
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        )
        setJobs(sortedJobs)
      }
    }
  }, [sortBy, preferences])

  const handleSearch = () => {
    updateURL(query, location, filters, sortBy)
  }

  // Update URL when filters change
  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters)
    updateURL(query, location, newFilters, sortBy)
  }

  // Update URL when sort changes
  const handleSortChange = (newSort: 'relevance' | 'date') => {
    setSortBy(newSort)
    updateURL(query, location, filters, newSort)
  }

  // Fetch user preferences on component mount
  useEffect(() => {
    if (user) {
      fetchUserPreferences()
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
        return
      }

      if (data) {
        setPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const getJobMatchScores = useMemo(() => {
    if (!preferences) return null
    return rankJobsByMatch(jobs, preferences)
  }, [jobs, preferences])

  const selectedJob = selectedJobId ? jobs.find(job => job.id === selectedJobId) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Job title, keywords, or company"
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Country, Town, or MRT Station"
                className="pl-10 h-12"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="h-12 px-8 bg-indeed-blue hover:bg-indeed-blue-dark"
            >
              Find jobs
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <JobFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Job List */}
          <div className="w-1/3 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {query && (
                  <span className="font-medium text-foreground">{query} </span>
                )}
                jobs
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {jobs.length}+ jobs
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as 'relevance' | 'date')}
                  className="text-sm border border-input rounded px-2 py-1 bg-background"
                >
                  <option value="relevance">Sort by: {preferences ? 'best match' : 'relevance'}</option>
                  <option value="date">Sort by: date</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((job, index) => {
                  const matchScore = getJobMatchScores?.find(match => match.job.id === job.id)
                  return (
                    <div key={job.id} className="relative">
                      <JobCard
                        job={job}
                        isSelected={selectedJobId === job.id}
                        onClick={() => setSelectedJobId(job.id)}
                      />
                      {matchScore && matchScore.score > 0.5 && (
                        <div className="absolute top-3 right-3">
                          <JobMatchBadge matchScore={matchScore} compact />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <NoResults query={query} onClearFilters={() => setFilters({})} />
            )}
          </div>

          {/* Right Side - Job Details */}
          <div className="w-2/3 sticky top-4 h-[calc(100vh-1rem)] overflow-y-auto">
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="border border-border rounded-lg p-8 text-center h-full flex items-center justify-center">
                <p className="text-muted-foreground">Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extended Filters Panel */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-background border border-border rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Filters</h2>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                ✕
              </Button>
            </div>
            <JobFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  )
} 
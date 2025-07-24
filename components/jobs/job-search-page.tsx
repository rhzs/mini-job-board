"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { JobCard } from './job-card'
import { JobDetail } from './job-detail'
import { JobFilters } from './job-filters'
import { NoResults } from './no-results'
import { JobMatchBadge } from './job-match-badge'
import { mockJobs, type Job } from '@/lib/mock-data'
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
  const [query, setQuery] = useState(initialQuery)
  const [location, setLocation] = useState(initialLocation)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(mockJobs[0]?.id || null)
  const [filters, setFilters] = useState<JobFilters>({})
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)

  const filteredJobs = useMemo(() => {
    let jobs = [...mockJobs]

    // Filter by search query
    if (query.trim()) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(query.toLowerCase()) ||
        job.company.toLowerCase().includes(query.toLowerCase()) ||
        job.description.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Filter by location
    if (location.trim() && location.toLowerCase() !== 'singapore') {
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    // Apply filters
    if (filters.remote !== undefined) {
      jobs = jobs.filter(job => job.remote === filters.remote)
    }

    if (filters.salary) {
      jobs = jobs.filter(job => {
        if (!job.salary) return false
        const monthlySalary = job.salary.period === 'month' ? job.salary.min : 
                             job.salary.period === 'year' ? job.salary.min / 12 :
                             job.salary.period === 'hour' ? job.salary.min * 8 * 22 :
                             job.salary.min
        return monthlySalary >= filters.salary!.min && monthlySalary <= filters.salary!.max
      })
    }

    if (filters.jobType && filters.jobType.length > 0) {
      jobs = jobs.filter(job => 
        job.jobType.some(type => filters.jobType!.includes(type))
      )
    }

    // Sort jobs with personalization
    if (sortBy === 'relevance' && preferences) {
      const rankedJobs = rankJobsByMatch(jobs, preferences)
      return rankedJobs.map(match => match.job)
    } else if (sortBy === 'date') {
      jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    }

    return jobs
  }, [query, location, filters, sortBy, preferences])

  const handleSearch = () => {
    // Search is handled by the useMemo effect
    console.log('Searching for:', query, 'in', location)
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
    return rankJobsByMatch(filteredJobs, preferences)
  }, [filteredJobs, preferences])

  const selectedJob = selectedJobId ? filteredJobs.find(job => job.id === selectedJobId) : null

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
              onFiltersChange={setFilters}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar - Job List */}
          <div className="w-1/2 space-y-4">
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
                  {filteredJobs.length}+ jobs
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                  className="text-sm border border-input rounded px-2 py-1 bg-background"
                >
                  <option value="relevance">Sort by: {preferences ? 'best match' : 'relevance'}</option>
                  <option value="date">Sort by: date</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            {filteredJobs.length > 0 ? (
              <div className="space-y-3">
                {filteredJobs.map((job, index) => {
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
          <div className="w-1/2">
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="border border-border rounded-lg p-8 text-center">
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
              onFiltersChange={setFilters}
              compact={false}
            />
          </div>
        </div>
      )}
    </div>
  )
} 
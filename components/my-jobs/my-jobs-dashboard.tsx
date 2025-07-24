"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useJobApplications } from '@/components/jobs/job-applications'
import { useSavedJobs } from '@/components/jobs/saved-jobs'
import { useAuth } from '@/lib/auth-context'
import { JobApplication } from '@/lib/database.types'
import { mockJobs } from '@/lib/mock-data'
import { Heart, ExternalLink, Calendar, MoreVertical, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TabType = 'saved' | 'applied' | 'interviews' | 'archived'

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-border rounded-lg p-6 bg-background">
          <div className="animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-muted rounded"></div>
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function MyJobsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('saved')
  const { user, loading: authLoading } = useAuth()
  const { applications, updateApplicationStatus, loading: applicationsLoading } = useJobApplications()
  const { savedJobs, loading: savedJobsLoading } = useSavedJobs()
  const router = useRouter()

  // Show loading state if auth is loading OR if either data source is still loading
  const isLoading = authLoading || applicationsLoading || savedJobsLoading

  // Filter applications by status
  const appliedJobs = applications.filter(app => app.status === 'applied')
  const interviewJobs = applications.filter(app => app.status === 'interview')
  const archivedJobs = applications.filter(app => 
    app.status === 'rejected' || app.status === 'withdrawn' || app.status === 'archived'
  )

  // Get full job objects for saved jobs
  const fullSavedJobs = savedJobs
    .map(jobId => mockJobs.find(job => job.id === jobId))
    .filter(Boolean) // Remove any undefined values

  const tabs = [
    { id: 'saved' as TabType, label: 'Saved', count: fullSavedJobs.length },
    { id: 'applied' as TabType, label: 'Applied', count: appliedJobs.length },
    { id: 'interviews' as TabType, label: 'Interviews', count: interviewJobs.length },
    { id: 'archived' as TabType, label: 'Archived', count: archivedJobs.length }
  ]

  const getCurrentJobs = () => {
    switch (activeTab) {
      case 'saved':
        return fullSavedJobs.map(job => ({ type: 'saved' as const, data: job }))
      case 'applied':
        return appliedJobs.map(app => ({ type: 'application' as const, data: app }))
      case 'interviews':
        return interviewJobs.map(app => ({ type: 'application' as const, data: app }))
      case 'archived':
        return archivedJobs.map(app => ({ type: 'application' as const, data: app }))
      default:
        return []
    }
  }

  const currentJobs = getCurrentJobs()
  const hasJobs = currentJobs.length > 0

  const handleJobClick = (jobId: string) => {
    router.push(`/job/${jobId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My jobs</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indeed-blue text-indeed-blue'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold">
                    {isLoading ? '—' : tab.count}
                  </span>
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : hasJobs ? (
          <div className="space-y-4">
            {currentJobs.map((item, index) => (
              <JobItemCard
                key={index}
                item={item}
                onStatusUpdate={updateApplicationStatus}
                onJobClick={handleJobClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState activeTab={activeTab} />
        )}
      </div>
    </div>
  )
}

interface JobItemCardProps {
  item: { type: 'saved' | 'application'; data: any }
  onStatusUpdate: (applicationId: string, status: JobApplication['status']) => Promise<void>
  onJobClick: (jobId: string) => void
}

function JobItemCard({ item, onStatusUpdate, onJobClick }: JobItemCardProps) {
  if (item.type === 'saved') {
    const job = item.data
    return (
      <div 
        className="border border-border rounded-lg p-6 bg-background hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onJobClick(job.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1 hover:text-indeed-blue transition-colors">{job.title}</h3>
            <p className="text-muted-foreground mb-2">{job.company}</p>
            <p className="text-sm text-muted-foreground mb-3">{job.location}</p>
            {job.salary && (
              <p className="text-sm text-muted-foreground">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.period}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className="bg-indeed-blue hover:bg-indeed-blue-dark"
              onClick={(e) => {
                e.stopPropagation()
                // Handle apply logic here
              }}
            >
              Apply now
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                // Handle unsave logic here
              }}
            >
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const application = item.data as JobApplication
  return (
    <div 
      className="border border-border rounded-lg p-6 bg-background hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onJobClick(application.job_id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground hover:text-indeed-blue transition-colors">{application.job_title}</h3>
            {application.status === 'interview' && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Interview
              </span>
            )}
          </div>
          <p className="text-muted-foreground mb-2">{application.company_name}</p>
          <p className="text-sm text-muted-foreground mb-3">{application.job_location}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Applied {new Date(application.applied_date).toLocaleDateString()}</span>
            {application.job_salary && <span>{application.job_salary}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {application.status === 'applied' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onStatusUpdate(application.id, 'interview')
              }}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Mark Interview
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  activeTab: TabType
}

function EmptyState({ activeTab }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'saved':
        return {
          title: 'No jobs saved yet',
          description: 'Jobs you save appear here.',
          buttonText: 'Find jobs',
          action: () => window.location.href = '/?q='
        }
      case 'applied':
        return {
          title: 'No applications yet',
          description: 'Jobs you apply to appear here.',
          buttonText: 'Find jobs',
          action: () => window.location.href = '/?q='
        }
      case 'interviews':
        return {
          title: 'No interviews scheduled',
          description: 'Interview invitations and scheduled interviews appear here.',
          buttonText: 'View applications',
          action: () => setActiveTab('applied')
        }
      case 'archived':
        return {
          title: 'No archived jobs',
          description: 'Withdrawn applications and rejected jobs appear here.',
          buttonText: 'Find jobs',
          action: () => window.location.href = '/?q='
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <div className="text-center py-16">
      {/* Empty State Illustration */}
      <div className="relative mx-auto mb-8 w-64 h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/20 dark:to-orange-900/20 rounded-lg transform rotate-3"></div>
        <div className="absolute inset-4 bg-background border border-border rounded-lg">
          <div className="p-4">
            <div className="w-full h-8 bg-teal-600 rounded-t mb-4 relative">
              <div className="absolute top-2 left-3 flex gap-1">
                <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                <div className="w-2 h-2 bg-white/70 rounded-full"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-teal-600 rounded w-3/4"></div>
              <div className="h-2 bg-teal-600 rounded w-1/2"></div>
            </div>
            <div className="absolute top-16 right-4 w-6 h-8 bg-pink-500 transform -rotate-12"></div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">{content.title}</h2>
      <p className="text-muted-foreground mb-8">{content.description}</p>

      <Button
        className="bg-indeed-blue hover:bg-indeed-blue-dark"
        onClick={content.action}
      >
        {content.buttonText} →
      </Button>

      <div className="mt-16 space-y-4">
        <p className="text-muted-foreground">
          Having an issue with My jobs? <a href="#" className="text-indeed-blue hover:underline">Tell us more</a>
        </p>
        <p className="text-indeed-blue hover:underline cursor-pointer">
          Not seeing a job?
        </p>
      </div>
    </div>
  )
}

function setActiveTab(tab: TabType) {
  // This would be handled by the parent component in a real implementation
  console.log('Set active tab:', tab)
} 
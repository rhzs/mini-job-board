"use client"

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, Plus, MoreHorizontal, Star, ChevronDown, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { JobPostingModal } from './job-posting-modal'
import { useJobPostings } from './job-postings'
import { useAuth } from '@/lib/auth-context'
import { JobPosting } from '@/lib/database.types'

// Loading skeleton component
function JobPostingsLoading() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </TableHead>
            <TableHead className="w-80">Job title</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead>Sponsorship status</TableHead>
            <TableHead>Date posted</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Job status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell><div className="h-4 w-4 bg-muted rounded animate-pulse"></div></TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </TableCell>
              <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse"></div></TableCell>
              <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse"></div></TableCell>
              <TableCell><div className="h-4 w-4 bg-muted rounded animate-pulse"></div></TableCell>
              <TableCell><div className="h-8 bg-muted rounded w-20 animate-pulse"></div></TableCell>
              <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse"></div></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function EmployerDashboard() {
  const { jobPostings, loading, updateJobStatus, deleteJobPosting } = useJobPostings()
  const { user } = useAuth()
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [titleFilter, setTitleFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const router = useRouter()

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map(job => job.id))
    } else {
      setSelectedJobs([])
    }
  }

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs([...selectedJobs, jobId])
    } else {
      setSelectedJobs(selectedJobs.filter(id => id !== jobId))
    }
  }

  const filteredJobs = useMemo(() => {
    return jobPostings.filter(job => {
      if (statusFilter !== 'all' && job.status.toLowerCase() !== statusFilter) return false
      if (titleFilter !== 'all' && !job.title.toLowerCase().includes(titleFilter.toLowerCase())) return false
      if (locationFilter !== 'all' && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) return false
      return true
    })
  }, [jobPostings, statusFilter, titleFilter, locationFilter])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays === 1) {
      return '1 day ago'
    } else {
      return `${diffDays} days ago`
    }
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getJobTypeDisplay = (jobTypes: string[]) => {
    return jobTypes.join(', ')
  }

  const handleStatusChange = async (jobId: string, newStatus: JobPosting['status']) => {
    const result = await updateJobStatus(jobId, newStatus)
    if (!result.success) {
      console.error('Failed to update job status:', result.error)
      // You could add a toast notification here
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      const result = await deleteJobPosting(jobId)
      if (!result.success) {
        console.error('Failed to delete job:', result.error)
        // You could add a toast notification here
      }
    }
  }

  const handleEditJob = (jobId: string) => {
    const jobToEdit = jobPostings.find(job => job.id === jobId)
    if (jobToEdit) {
      setEditingJob(jobToEdit)
      setShowJobModal(true)
    }
  }

  const handleDuplicateJob = async (jobId: string) => {
    const jobToDuplicate = jobPostings.find(job => job.id === jobId)
    if (!jobToDuplicate || !user) {
      console.error('Job not found for duplication or user not authenticated')
      return
    }

    try {
      // Create a copy with modified title and reset status
      const { id, created_at, updated_at, ...jobData } = jobToDuplicate
      
      const duplicatedJobData = {
        ...jobData,
        title: `${jobToDuplicate.title} (Copy)`,
        status: 'draft' as const,
        posted_date: new Date().toISOString(),
        view_count: 0,
        is_sponsored: false,
        employer_id: user.id
      }

      const { error } = await import('@/lib/supabase').then(({ supabase }) => 
        supabase.from('job_postings').insert([duplicatedJobData])
      )

      if (error) {
        console.error('Error duplicating job:', error)
        alert('Failed to duplicate job. Please try again.')
      } else {
        // Refresh the page to show the new job
        window.location.reload()
      }
    } catch (error) {
      console.error('Error duplicating job:', error)
      alert('Failed to duplicate job. Please try again.')
    }
  }

  const handleViewJob = (jobId: string) => {
    // Navigate to public job view
    router.push(`/job/${jobId}`)
  }

  const handleViewApplications = (jobId: string) => {
    // Navigate to applications page for this job
    router.push(`/employer/jobs/${jobId}/applications`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Jobs</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              All jobs
            </Button>
            <Button variant="ghost" size="sm">
              Tags
            </Button>
          </div>
        </div>
        <Button 
          className="bg-indeed-blue hover:bg-indeed-blue-dark"
          onClick={() => setShowJobModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post a job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={titleFilter} onValueChange={setTitleFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Titles</SelectItem>
            <SelectItem value="engineer">Engineer</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="singapore">Singapore</SelectItem>
            <SelectItem value="jakarta">Jakarta</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="kuala lumpur">Kuala Lumpur</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Star className="h-4 w-4 mr-2" />
        </Button>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          {statusFilter !== 'all' || titleFilter !== 'all' || locationFilter !== 'all' ? '1 filter applied' : 'No filters'}
        </Button>

        <span className="text-sm text-muted-foreground ml-auto">
          {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <JobPostingsLoading />
      ) : filteredJobs.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No job postings found</h3>
          <p className="text-muted-foreground mb-4">
            {jobPostings.length === 0 
              ? "You haven't created any job postings yet. Create your first posting to get started." 
              : "No jobs match your current filters. Try adjusting your search criteria."
            }
          </p>
          <Button 
            className="bg-indeed-blue hover:bg-indeed-blue-dark"
            onClick={() => setShowJobModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Post a job
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-80">
                  Job title
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Sponsorship status</TableHead>
                <TableHead>
                  Date posted
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </TableHead>
                <TableHead>Views</TableHead>
                <TableHead>
                  Job status
                  <ChevronDown className="h-4 w-4 inline ml-1" />
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-indeed-blue cursor-pointer hover:underline">
                          {job.title}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{job.location}</div>
                      <div className="text-xs text-muted-foreground">{getJobTypeDisplay(job.job_type)}</div>
                      {job.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] text-white">!</span>
                          </div>
                          <span className="text-sm text-blue-600">
                            Job posting is pending approval
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{job.application_count}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{job.is_sponsored ? 'Sponsored' : 'Free post'}</div>
                      <Button variant="link" className="h-auto p-0 text-indeed-blue text-sm">
                        {job.is_sponsored ? 'Manage sponsorship' : 'Sponsor job'}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{formatDate(job.posted_date)}</div>
                      <div className="text-xs text-muted-foreground">{formatFullDate(job.posted_date)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{job.view_count}</div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={job.status} 
                      onValueChange={(value) => handleStatusChange(job.id, value as JobPosting['status'])}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditJob(job.id)}>
                          Edit job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateJob(job.id)}>
                          Duplicate job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewJob(job.id)}>
                          View job
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewApplications(job.id)}>
                          View applications
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          Delete job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <JobPostingModal 
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false)
          setEditingJob(null)
        }}
        existingJob={editingJob}
        mode={editingJob ? 'edit' : 'create'}
      />
    </div>
  )
} 
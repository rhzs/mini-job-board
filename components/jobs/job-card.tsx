"use client"

import React from 'react'
import { Job } from '@/lib/mock-data'
import { Heart, MapPin, Clock, Star, Zap, DollarSign, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSaveJobButton } from './saved-jobs'

interface JobCardProps {
  job: Job
  isSelected: boolean
  onClick: () => void
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const { saved, toggleSave, loading } = useSaveJobButton(job.id)
  
  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return null
    
    const { min, max, currency = 'S$', period = 'month' } = salary
    const periodText = period === 'hour' ? '/hr' : `/mo`
    
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()} ${periodText}`
  }

  const formatPostedDate = (date: string) => {
    const posted = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - posted.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div 
      className={`p-4 border border-border rounded-lg cursor-pointer transition-colors hover:bg-accent/5 ${
        isSelected ? 'border-indeed-blue bg-indeed-blue/5' : ''
      }`}
      onClick={onClick}
      data-testid="job-card"
    >
      {/* Job Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg leading-tight">
            {job.title}
          </h3>
          <p className="text-muted-foreground mt-1">
            {job.company}
          </p>
        </div>
        
        {/* Save/Heart Icon */}
        <div className="ml-4 flex items-center gap-2">
          {job.isUrgent && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Urgent
            </span>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
            {job.remote && <span className="text-green-600">• Remote</span>}
          </div>
        </div>
        
        {job.salary && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-600" data-testid="job-salary">
            <DollarSign className="h-4 w-4" />
            <span>{formatSalary(job.salary)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid="job-type">
            <Briefcase className="h-4 w-4" />
            <span>{job.jobType.join(', ')}</span>
          </div>
          {job.easyApply && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              Easy Apply
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span data-testid="job-posted-date">
            {formatPostedDate(job.postedDate)}
          </span>
          {job.responseRate && (
            <span>Response rate: {job.responseRate}%</span>
          )}
        </div>
      </div>

      {/* Job Description Preview */}
      <div className="mt-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </div>

      {/* Tags/Skills */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {job.requirements.slice(0, 3).map((requirement, index) => (
            <span 
              key={index} 
              className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded"
            >
              {requirement}
            </span>
          ))}
          {job.requirements.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{job.requirements.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )
} 
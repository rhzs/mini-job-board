"use client"

import React from 'react'
import { Job } from '@/lib/mock-data'
import { Heart, MapPin, Clock, Star, Zap } from 'lucide-react'
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
    if (!salary) return ''
    
    const { min, max, period, currency } = salary
    const formatPeriod = period === 'month' ? 'a month' : 
                        period === 'year' ? 'a year' : 
                        period === 'hour' ? 'an hour' : 
                        period === 'day' ? 'a day' : 'a week'
    
    if (min === max) {
      return `${currency}${min.toLocaleString()} ${formatPeriod}`
    }
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()} ${formatPeriod}`
  }

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return '1 week ago'
    return `${Math.floor(diffDays / 7)} weeks ago`
  }

  return (
    <div 
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-indeed-blue bg-blue-50 dark:bg-blue-950/20' : 'border-border bg-background'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {job.isUrgent && (
            <div className="flex items-center gap-1 text-xs text-pink-600 mb-1">
              <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs">
                Hiring multiple candidates
              </span>
            </div>
          )}
          <h3 className="font-medium text-foreground hover:text-indeed-blue transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-foreground">{job.company}</span>
            {job.companyRating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span className="text-xs text-muted-foreground">{job.companyRating}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {job.location}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              toggleSave()
            }}
            disabled={loading}
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="space-y-2">
        {job.salary && (
          <div className="text-sm font-medium text-foreground">
            {formatSalary(job.salary)}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {job.jobType.map((type, index) => (
            <span key={index} className="bg-muted px-2 py-1 rounded">
              {type}
            </span>
          ))}
          {job.remote && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              Remote
            </span>
          )}
        </div>

        {job.responseRate && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Zap className="h-3 w-3" />
            {job.responseRate}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatPostedDate(job.postedDate)}
          </div>
          
          {job.easyApply && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-indeed-blue">▶ Easily apply</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Preview */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </div>
    </div>
  )
} 
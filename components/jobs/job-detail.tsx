"use client"

import React from 'react'
import { Job } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Flag, MapPin, Star, Zap, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { useSaveJobButton } from './saved-jobs'

interface JobDetailProps {
  job: Job
}

export function JobDetail({ job }: JobDetailProps) {
  const { saved, toggleSave, loading } = useSaveJobButton(job.id)
  
  const formatSalary = (salary: Job['salary']) => {
    if (!salary) return 'Salary not specified'
    
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
    <div className="border border-border rounded-lg bg-background sticky top-24">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg text-foreground">{job.company}</span>
              {job.companyRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span className="text-sm text-muted-foreground">{job.companyRating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleSave}
              disabled={loading}
            >
              <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.jobType.map((type, index) => (
            <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
              {type}
            </span>
          ))}
          {job.remote && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Remote
            </span>
          )}
        </div>

        {job.responseRate && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
            <Zap className="h-4 w-4" />
            {job.responseRate}
          </div>
        )}

        {/* Apply Button */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-indeed-blue hover:bg-indeed-blue-dark h-12">
            Apply now
          </Button>
          <Button 
            variant="outline" 
            className="h-12"
            onClick={toggleSave}
            disabled={loading}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Job Details */}
      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Salary & Benefits */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pay
          </h3>
          <p className="text-muted-foreground mb-4">{formatSalary(job.salary)}</p>
          
          {job.benefits.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Benefits</h4>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Job Type */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job type
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.jobType.map((type, index) => (
              <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Job Description</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p>{job.description}</p>
          </div>
        </div>

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Requirements</h3>
            <ul className="space-y-2 text-muted-foreground">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indeed-blue mt-1">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Posted Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border">
          <Calendar className="h-4 w-4" />
          Posted {formatPostedDate(job.postedDate)}
        </div>
      </div>
    </div>
  )
} 
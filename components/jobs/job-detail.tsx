"use client"

import React, { useState } from 'react'
import { Job } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Heart, Share2, Flag, MapPin, Star, Zap, Briefcase, Calendar, DollarSign, CheckCircle, Clock, ExternalLink, User } from 'lucide-react'
import { useSaveJobButton } from './saved-jobs'
import { useApplyToJob } from './job-applications'
import { ApplyModal } from './apply-modal'

interface JobDetailProps {
  job: Job
}

export function JobDetail({ job }: JobDetailProps) {
  const { saved, toggleSave, loading } = useSaveJobButton(job.id)
  const { hasApplied, application } = useApplyToJob(job.id)
  const [showApplyModal, setShowApplyModal] = useState(false)
  
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
    <div className="bg-background">
      {/* Job Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {job.title}
        </h1>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg text-foreground underline cursor-pointer hover:text-indeed-blue">
            {job.company}
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-1 text-foreground mb-4">
          <MapPin className="h-4 w-4" />
          {job.location}
        </div>

        {/* Job Type Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {job.jobType.map((type, index) => (
            <span key={index} className="text-foreground">
              {type}
              {index < job.jobType.length - 1 && ', '}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-8">
          {hasApplied ? (
            <Button 
              disabled
              className="bg-gray-200 text-gray-600 cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Applied {application && new Date(application.applied_date).toLocaleDateString()}
            </Button>
          ) : (
            <Button 
              className="bg-indeed-blue hover:bg-indeed-blue-dark text-white px-6"
              onClick={() => setShowApplyModal(true)}
            >
              Apply now
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={toggleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {saved ? (
              <>
                <span className="w-4 h-4 bg-black text-white text-xs flex items-center justify-center">✓</span>
                Saved
              </>
            ) : (
              <>
                <span className="w-4 h-4 border border-gray-400"></span>
                Save
              </>
            )}
          </Button>
          
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Insights */}
      <div className="border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">Profile insights</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Here's how the job qualifications align with your{' '}
          <span className="underline cursor-pointer text-indeed-blue">profile</span>.
        </p>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Skills</span>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm" className="rounded-full">
              Teaching ▼
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              Preschool experience ▼
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-foreground mb-3">
              Do you have experience in <strong>Teaching</strong>?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Yes</Button>
              <Button variant="outline" size="sm">No</Button>
              <Button variant="link" size="sm" className="text-indeed-blue">Skip</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">Job details</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Here's how the job details align with your{' '}
          <span className="underline cursor-pointer text-indeed-blue">profile</span>.
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Job type</span>
            </div>
            <div className="flex gap-2">
              {job.jobType.map((type, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm" 
                  className={`rounded-full ${type === 'Permanent' ? 'bg-green-100 text-green-700 border-green-200' : ''}`}
                >
                  {type === 'Permanent' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {type} ▼
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Shift and schedule</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Day shift ▼
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Monday to Friday ▼
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Shift system ▼
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-3">Location</h2>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span className="text-foreground">{job.location}</span>
        </div>
      </div>

      {/* Job Description */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Full job description</h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-foreground leading-relaxed mb-4">
            {job.description}
          </p>
          
          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">Requirements:</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.requirements.map((req, index) => (
                  <li key={index} className="text-foreground">{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">Benefits:</h3>
              <ul className="list-disc list-inside space-y-1">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="text-foreground">{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {job.salary && (
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">Salary:</h3>
              <p className="text-foreground">{formatSalary(job.salary)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal 
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  )
} 
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
    <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Job Header - Sticky within container */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-border p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
          {job.title}
        </h1>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-semibold text-indeed-blue underline cursor-pointer hover:text-indeed-blue-dark">
            {job.company}
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatPostedDate(job.postedDate)}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium text-foreground">{formatSalary(job.salary)}</span>
            </div>
          )}
        </div>

        {/* Job Type Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {job.jobType.map((type, index) => (
            <span 
              key={index} 
              className="px-3 py-1 text-xs font-medium bg-white dark:bg-gray-800 border border-border rounded-full text-foreground"
            >
              {type}
            </span>
          ))}
          {job.remote && (
            <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 rounded-full">
              Remote
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {hasApplied ? (
            <Button 
              disabled
              className="bg-gray-200 text-gray-600 cursor-not-allowed hover:bg-gray-200"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Applied {application && new Date(application.applied_date).toLocaleDateString()}
            </Button>
          ) : (
            <Button 
              size="lg"
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
                <CheckCircle className="h-4 w-4 text-green-600" />
                Saved
              </>
            ) : (
              <>
                <Heart className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 space-y-6">
        {/* Profile Insights */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Profile insights
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Here's how the job qualifications align with your{' '}
            <span className="underline cursor-pointer text-indeed-blue">profile</span>.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Skills</span>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-4">
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Teaching
              </Button>
              <Button variant="outline" size="sm" className="rounded-full text-xs">
                Preschool experience
              </Button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-border">
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
        <div className="bg-white dark:bg-gray-800 border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Job details
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Here's how the job details align with your{' '}
            <span className="underline cursor-pointer text-indeed-blue">profile</span>.
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Job type</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {job.jobType.map((type, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className={`rounded-full text-xs ${type === 'Part-time' || type === 'Freelance' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' : ''}`}
                  >
                    {(type === 'Part-time' || type === 'Freelance') && <CheckCircle className="h-3 w-3 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Shift and schedule</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="rounded-full text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Day shift
                </Button>
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  Monday to Friday
                </Button>
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  Shift system
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white dark:bg-gray-800 border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Location
          </h2>
          <div className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location}</span>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white dark:bg-gray-800 border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Full job description</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-foreground leading-relaxed mb-4">
              {job.description}
            </p>
            
            {job.requirements && job.requirements.length > 0 && (() => {
              // Filter out requirements that are the same as the job description to avoid duplication
              const uniqueRequirements = job.requirements
                .filter(req => typeof req === 'string' && req.trim().length > 0)
                .filter(req => req.trim() !== job.description.trim());
              return uniqueRequirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Requirements:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    {uniqueRequirements.map((req, index) => (
                      <li key={index} className="text-foreground">{req}</li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {job.benefits && job.benefits.length > 0 && (() => {
              const validBenefits = job.benefits.filter(benefit => 
                typeof benefit === 'string' && benefit.trim().length > 0
              );
              return validBenefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Benefits:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-6">
                    {validBenefits.map((benefit, index) => (
                      <li key={index} className="text-foreground">{benefit}</li>
                    ))}
                  </ul>
                </div>
              )
            })()}

            {job.salary && (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Salary:
                </h3>
                <p className="text-foreground font-medium text-lg">{formatSalary(job.salary)}</p>
              </div>
            )}
          </div>
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
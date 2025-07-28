"use client"

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, ArrowLeft, Search, MapPin, X, Check, Plus } from 'lucide-react'
import { useJobPostings } from './job-postings'
import { useTenant } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'

interface JobPostingModalProps {
  isOpen: boolean
  onClose: () => void
  existingJob?: any
  mode?: 'create' | 'edit'
}

interface JobFormData {
  // Step 1
  useTemplate: boolean
  templateJobId?: string
  
  // Step 2 - Basics
  title: string
  location: string
  language: string
  country: string
  
  // Step 3 - Details  
  jobType: string
  hasStartDate: boolean
  startDate?: string
  
  // Step 4 - Pay
  showPayBy: string
  minPay: string
  maxPay: string
  payRate: string
  
  // Step 5 - Pre-screening
  dealBreakerQuestions: string[]
  screeningQuestions: string[]
  
  // Step 6 - Description
  description: string
  
  // Step 7 - Preferences
  applicationEmail: string
  requireCV: boolean
  allowCandidateContact: boolean
  hasDeadline: boolean
  deadline?: string
  expectedStartDate?: string
  hiringCount: number
  
  // Contact info
  contactName: string
  phoneNumber: string
  companyId: string
}

const initialFormData: JobFormData = {
  useTemplate: true,
  title: '',
  location: 'Jakarta',
  language: 'English',
  country: 'Indonesia',
  jobType: 'Full-time',
  hasStartDate: false,
  showPayBy: 'Range',
  minPay: '',
  maxPay: '',
  payRate: 'per month',
  dealBreakerQuestions: [],
  screeningQuestions: [],
  description: '',
  applicationEmail: '',
  requireCV: true,
  allowCandidateContact: true,
  hasDeadline: false,
  hiringCount: 0,
  contactName: '',
  phoneNumber: '',
      companyId: ''
}

export function JobPostingModal({ isOpen, onClose, existingJob, mode = 'create' }: JobPostingModalProps) {
  const { currentCompany } = useTenant()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(() => {
    // In edit mode, skip template selection and start from step 2
    if (mode === 'edit') {
      return 2
    }
    
    // Restore step from localStorage if available (only for create mode)
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('jobPostingStep')
      if (savedStep) {
        const step = parseInt(savedStep)
        if (step >= 1 && step <= 8) {
          return step
        }
      }
    }
    return 1
  })
  const [formData, setFormData] = useState<JobFormData>(() => {
    const initialFormData: JobFormData = {
      useTemplate: false,
      title: '',
      location: 'Jakarta',
      language: 'English',
      country: 'Indonesia',
      jobType: 'Full-time',
      hasStartDate: false,
      showPayBy: 'Range',
      minPay: '',
      maxPay: '',
      payRate: 'per month',
      dealBreakerQuestions: [],
      screeningQuestions: [],
      description: '',
      applicationEmail: '',
      requireCV: true,
      allowCandidateContact: true,
      hasDeadline: false,
      hiringCount: 0,
      contactName: '',
      phoneNumber: '',
      companyId: ''
    }

    // If editing existing job, populate with existing data
    if (mode === 'edit' && existingJob) {
      return {
        ...initialFormData,
        title: existingJob.title || '',
        location: existingJob.location || 'Jakarta',
        description: existingJob.description || '',
        applicationEmail: existingJob.contact_email || user?.email || '',
        companyId: existingJob.company_id || currentCompany?.company_id || ''
      }
    }

    // For create mode, set company_id if user is in company mode
    if (mode === 'create' && currentCompany?.company_id) {
      return {
        ...initialFormData,
        companyId: currentCompany.company_id
      }
    }

    return initialFormData
  })
  const { createJobPosting, updateJobPosting } = useJobPostings()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set company ID when currentCompany changes (for new jobs)
  useEffect(() => {
    if (mode === 'create' && currentCompany && !formData.companyId) {
      setFormData(prev => ({ ...prev, companyId: currentCompany.company_id }))
    }
  }, [currentCompany, mode, formData.companyId])

  // Reset form data when existingJob changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && existingJob) {
      setFormData({
        useTemplate: false,
        title: existingJob.title || '',
        location: existingJob.location || 'Jakarta',
        language: 'English',
        country: 'Indonesia',
        jobType: existingJob.job_type?.[0] || 'Full-time',
        hasStartDate: false,
        startDate: '',
        showPayBy: existingJob.salary_min && existingJob.salary_max ? 'Range' : 'Starting amount',
        minPay: existingJob.salary_min?.toString() || '',
        maxPay: existingJob.salary_max?.toString() || '',
        payRate: existingJob.salary_period ? `per ${existingJob.salary_period}` : 'per month',
        dealBreakerQuestions: [],
        screeningQuestions: [],
        description: existingJob.description || '',
        applicationEmail: existingJob.contact_email || '',
        requireCV: true,
        allowCandidateContact: true,
        hasDeadline: !!existingJob.application_deadline,
        deadline: existingJob.application_deadline || '',
        expectedStartDate: '',
        hiringCount: 1,
        contactName: '',
        phoneNumber: '',
        companyId: existingJob.company_id || currentCompany?.company_id || ''
      })
      setCurrentStep(2) // Start at basics step for edit mode
    }
  }, [existingJob, mode])

  const totalSteps = mode === 'edit' ? 7 : 8

  const getDisplayStep = () => {
    return mode === 'edit' ? currentStep - 1 : currentStep
  }

  const updateFormData = (updates: Partial<JobFormData>) => {
    const newData = { ...formData, ...updates }
    setFormData(newData)
    
    // Save to localStorage whenever form data changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('jobPostingDraft', JSON.stringify(newData))
    }
  }

  const handleNext = () => {
    const maxStep = mode === 'edit' ? 8 : totalSteps
    if (currentStep < maxStep) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      // Save current step to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobPostingStep', newStep.toString())
      }
    }
  }

  const handleBack = () => {
    const minStep = mode === 'edit' ? 2 : 1
    if (currentStep > minStep) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      // Save current step to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('jobPostingStep', newStep.toString())
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const jobData = {
        title: formData.title,
        location: formData.location,
        job_type: [formData.jobType],
        remote_allowed: false,
        salary_min: formData.minPay ? parseFloat(formData.minPay) : undefined,
        salary_max: formData.maxPay ? parseFloat(formData.maxPay) : undefined,
        salary_period: formData.payRate.replace('per ', '') as 'hour' | 'day' | 'week' | 'month' | 'year',
        salary_currency: 'IDR',
        description: formData.description,
        requirements: [] as any, // Fix: Empty array cast to match database schema
        benefits: [] as any,    // Fix: Empty array cast to match database schema
        experience_level: 'Mid' as 'Mid' | 'Entry' | 'Senior' | 'Lead' | 'Executive',
        easy_apply: true,
        application_deadline: formData.hasDeadline ? formData.deadline : undefined,
        company_id: formData.companyId,
        contact_email: formData.applicationEmail
      }

      if (mode === 'edit' && existingJob) {
        await updateJobPosting(existingJob.id, jobData)
      } else {
        await createJobPosting(jobData)
      }
      
      // Clear saved draft and reset form after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem('jobPostingDraft')
        localStorage.removeItem('jobPostingStep')
      }
      setFormData(initialFormData)
      setCurrentStep(1)
      onClose()
    } catch (error) {
      console.error(`Failed to ${mode} job posting:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasUnsavedData = () => {
    return formData.title.trim() !== '' || 
           formData.description.trim() !== '' || 
           formData.minPay !== '' || 
           formData.maxPay !== '' ||
           formData.applicationEmail.trim() !== ''
  }

  const handleClose = () => {
    // Don't reset form data when closing - preserve user's progress
    // Data is automatically saved to localStorage
    onClose()
  }

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jobPostingDraft')
      localStorage.removeItem('jobPostingStep')
    }
    setFormData(initialFormData)
    setCurrentStep(1)
  }

  const renderStep = () => {
    if (mode === 'edit') {
      // In edit mode, skip the template step (step 1)
      switch (currentStep) {
        case 2: return <AddBasicsStep formData={formData} updateFormData={updateFormData} />
        case 3: return <AddDetailsStep formData={formData} updateFormData={updateFormData} />
        case 4: return <AddPayStep formData={formData} updateFormData={updateFormData} />
        case 5: return <PreScreenStep formData={formData} updateFormData={updateFormData} />
        case 6: return <DescribeJobStep formData={formData} updateFormData={updateFormData} />
        case 7: return <SetPreferencesStep formData={formData} updateFormData={updateFormData} />
        case 8: return <ReviewStep formData={formData} updateFormData={updateFormData} />
        default: return null
      }
    } else {
      // Create mode - normal flow
      switch (currentStep) {
        case 1: return <CreateJobPostStep formData={formData} updateFormData={updateFormData} />
        case 2: return <AddBasicsStep formData={formData} updateFormData={updateFormData} />
        case 3: return <AddDetailsStep formData={formData} updateFormData={updateFormData} />
        case 4: return <AddPayStep formData={formData} updateFormData={updateFormData} />
        case 5: return <PreScreenStep formData={formData} updateFormData={updateFormData} />
        case 6: return <DescribeJobStep formData={formData} updateFormData={updateFormData} />
        case 7: return <SetPreferencesStep formData={formData} updateFormData={updateFormData} />
        case 8: return <ReviewStep formData={formData} updateFormData={updateFormData} />
        default: return null
      }
    }
  }

  const getStepTitle = () => {
    const createTitles = [
      'Create a job post',
      'Add job basics',
      'Add job details', 
      'Add pay and benefits',
      'Pre-screen applicants',
      'Describe the job',
      'Set preferences',
      'Review'
    ]
    
    const editTitles = [
      'Edit job post',
      'Edit job basics',
      'Edit job details', 
      'Edit pay and benefits',
      'Edit pre-screening',
      'Edit job description',
      'Edit preferences',
      'Review changes'
    ]
    
    const titles = mode === 'edit' ? editTitles : createTitles
    return titles[currentStep - 1]
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true // Can always proceed from template selection
      case 2: return formData.title.trim().length > 0 && formData.location.trim().length > 0
      case 3: return formData.jobType.length > 0
      case 4: return true // Pay is optional
      case 5: return true // Screening is optional
      case 6: return formData.description.trim().length > 0
      case 7: return formData.applicationEmail.trim().length > 0
      case 8: return true
      default: return false
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-foreground">{getStepTitle()}</h2>
              {hasUnsavedData() && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Draft saved
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-sm text-muted-foreground">Step {getDisplayStep()} of {totalSteps}</p>
              {hasUnsavedData() && (
                <Button 
                  variant="link" 
                  onClick={clearDraft}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear draft
                </Button>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-indeed-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${(getDisplayStep() / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          {currentStep > (mode === 'edit' ? 2 : 1) ? (
            <Button variant="outline" onClick={handleBack} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep === (mode === 'edit' ? 8 : totalSteps) ? (
            <Button 
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-indeed-blue hover:bg-indeed-blue-dark flex items-center"
            >
              {isSubmitting 
                ? (mode === 'edit' ? 'Updating...' : 'Submitting...') 
                : (mode === 'edit' ? 'Update Job' : 'Post Job')
              }
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-indeed-blue hover:bg-indeed-blue-dark flex items-center"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// Step 1: Create a job post
function CreateJobPostStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">How would you like to post your job? <span className="text-red-500">*</span></h3>
        
        <div className="space-y-3">
          <label className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              name="jobMethod"
              checked={formData.useTemplate}
              onChange={() => updateFormData({ useTemplate: true })}
              className="h-4 w-4 text-indeed-blue"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Use a previous job as a template</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Save time</span>
              </div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              name="jobMethod"
              checked={!formData.useTemplate}
              onChange={() => updateFormData({ useTemplate: false })}
              className="h-4 w-4 text-indeed-blue"
            />
            <span className="font-medium">Create a brand new post</span>
          </label>
        </div>
      </div>

      {formData.useTemplate && (
        <div className="border border-border rounded-lg p-4">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by job title"
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3 mb-4">
            <Button variant="outline" className="flex items-center">
              Status <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" className="flex items-center">
              Location <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <div className="flex-1" />
            <Button variant="outline" className="flex items-center">
              Sort by: Newest <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="mb-4 flex items-center text-sm text-muted-foreground">
            <div className="h-4 w-4 mr-2 bg-muted rounded" />
            1 result
          </div>

          <div className="border border-border rounded-lg p-4 bg-background">
            <h4 className="font-medium">Software Engineer</h4>
            <p className="text-sm text-muted-foreground">Jakarta • July 24th, 2025</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Step 2: Add job basics
function AddBasicsStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm">
        <span>The job post will be in</span>
        <span className="font-medium">{formData.language}</span>
        <span>in</span>
        <span className="font-medium">{formData.country}</span>
        <Button variant="link" className="h-auto p-0 text-indeed-blue">
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Job title <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          placeholder="Software Engineer"
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Where would you like to advertise this job? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-muted-foreground mb-2">Enter your location</p>
        <Input
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          placeholder="Jakarta"
          className="w-full"
        />
      </div>
    </div>
  )
}

// Step 3: Add job details
function AddDetailsStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  const jobTypes = [
    { id: 'Full-time', label: 'Full-time', selected: true },
    { id: 'Part-time', label: 'Part-time' },
    { id: 'Temporary', label: 'Temporary' },
    { id: 'Contract', label: 'Contract' },
    { id: 'Trial period contract', label: 'Trial period contract' },
    { id: 'Internship', label: 'Internship' },
    { id: 'Fresh graduate', label: 'Fresh graduate' },
    { id: 'Volunteer', label: 'Volunteer' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Job type <span className="text-red-500">*</span></h3>
        <div className="grid grid-cols-2 gap-3">
          {jobTypes.map((type) => (
            <Button
              key={type.id}
              variant={formData.jobType === type.id ? "default" : "outline"}
              className={`justify-start ${formData.jobType === type.id ? 'bg-indeed-blue text-white' : ''}`}
              onClick={() => updateFormData({ jobType: type.id })}
            >
              {formData.jobType === type.id && <Check className="h-4 w-4 mr-2" />}
              {type.id !== formData.jobType && <Plus className="h-4 w-4 mr-2" />}
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Is there a planned start date for this job?</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="startDate"
              checked={formData.hasStartDate}
              onChange={() => updateFormData({ hasStartDate: true })}
              className="h-4 w-4 text-indeed-blue"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="startDate"
              checked={!formData.hasStartDate}
              onChange={() => updateFormData({ hasStartDate: false })}
              className="h-4 w-4 text-indeed-blue"
            />
            <span>No</span>
          </label>
        </div>
      </div>
    </div>
  )
}

// Step 4: Add pay and benefits
function AddPayStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Add pay and benefits</h3>
      
      <div>
        <h4 className="text-lg font-medium mb-4">Pay</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Show pay by</label>
            <select 
              value={formData.showPayBy}
              onChange={(e) => updateFormData({ showPayBy: e.target.value })}
              className="w-full p-3 border border-border rounded-lg"
            >
              <option value="Range">Range</option>
              <option value="Starting amount">Starting amount</option>
              <option value="Maximum amount">Maximum amount</option>
              <option value="Exact amount">Exact amount</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Minimum</label>
            <Input
              value={formData.minPay}
              onChange={(e) => updateFormData({ minPay: e.target.value })}
              placeholder="IDR"
            />
          </div>
          
          <div className="flex items-end">
            <span className="mb-3 text-muted-foreground">to</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Maximum</label>
            <Input
              value={formData.maxPay}
              onChange={(e) => updateFormData({ maxPay: e.target.value })}
              placeholder="IDR"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Rate</label>
            <select 
              value={formData.payRate}
              onChange={(e) => updateFormData({ payRate: e.target.value })}
              className="w-full p-3 border border-border rounded-lg"
            >
              <option value="per hour">per hour</option>
              <option value="per day">per day</option>
              <option value="per week">per week</option>
              <option value="per month">per month</option>
              <option value="per year">per year</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 5: Pre-screen applicants  
function PreScreenStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Pre-screen applicants</h3>
      
      <div className="border border-border rounded-lg p-6 bg-purple-50 dark:bg-purple-950/20">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-purple-500 rounded"></div>
          </div>
          <div>
            <h4 className="font-medium text-lg mb-2">Have to have it? Make it a deal breaker.</h4>
            <p className="text-muted-foreground">
              We won't notify you of candidates who don't meet your <strong>deal breaker</strong> qualification questions. You can review them anytime on your candidate dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium">Screener Question:</h4>
            <p className="text-sm text-muted-foreground">Please list 2-3 dates and time ranges that you could do an interview.</p>
          </div>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Ask applicants to list some dates and times they could do an interview</p>
      </div>

      <div className="border border-border rounded-lg p-4">
        <Button variant="ghost" className="w-full flex items-center justify-between">
          <span className="font-medium">Browse more questions</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Ability to commute/relocate
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Education
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Experience
          </Button>
          <Button variant="outline" className="flex items-center text-muted-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Interview availability
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Language
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            License/Certification
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Location
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Willingness to travel
          </Button>
          <Button variant="outline" className="flex items-center text-indeed-blue">
            <Plus className="h-4 w-4 mr-2" />
            Create custom question
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step 6: Describe the job
function DescribeJobStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Describe the job</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Job description <span className="text-red-500">*</span>
        </label>
        <div className="border border-border rounded-lg">
          <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/50">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 font-bold">B</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 italic">I</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">⋮</Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">?</Button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Describe the role, responsibilities, and requirements..."
            className="w-full p-4 min-h-[300px] resize-none border-0 outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}

// Step 7: Set preferences
function SetPreferencesStep({ formData, updateFormData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold">Set preferences</h3>
      
      <div>
        <h4 className="text-lg font-medium mb-4">Communication preferences</h4>
        <div>
          <label className="block text-sm font-medium mb-2">
            Get application updates <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.applicationEmail}
            onChange={(e) => updateFormData({ applicationEmail: e.target.value })}
            placeholder="rheza.satria.ta@gmail.com"
            className="w-full mb-2"
          />
          <Button variant="link" className="h-auto p-0 text-indeed-blue text-sm">
            <Plus className="h-4 w-4 mr-1" />
            Add email
          </Button>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="h-4 w-4" />
            <span className="text-sm">Send an individual email each time someone applies.</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-4">Application preferences</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={formData.requireCV}
              onChange={(e) => updateFormData({ requireCV: e.target.checked })}
              className="h-4 w-4" 
            />
            <span className="text-sm font-medium">CV is required</span>
          </label>
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={formData.allowCandidateContact}
              onChange={(e) => updateFormData({ allowCandidateContact: e.target.checked })}
              className="h-4 w-4" 
            />
            <span className="text-sm font-medium">Let potential candidates contact you about this job by e-mail to the address provided</span>
          </label>
        </div>

        <div className="mt-6">
          <h5 className="font-medium mb-3">Is there an application deadline?</h5>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="deadline"
                checked={!formData.hasDeadline}
                onChange={() => updateFormData({ hasDeadline: false })}
                className="h-4 w-4"
              />
              <span className="text-sm">No</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="deadline"
                checked={formData.hasDeadline}
                onChange={() => updateFormData({ hasDeadline: true })}
                className="h-4 w-4"
              />
              <span className="text-sm">Yes</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-4">Recruitment details</h4>
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of people to hire in the next 30 days <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-2 max-w-xs">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => updateFormData({ hiringCount: Math.max(0, formData.hiringCount - 1) })}
            >
              -
            </Button>
            <Input
              type="number"
              value={formData.hiringCount}
              onChange={(e) => updateFormData({ hiringCount: parseInt(e.target.value) || 0 })}
              className="text-center"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => updateFormData({ hiringCount: formData.hiringCount + 1 })}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 8: Review
function ReviewStep({ formData }: { formData: JobFormData, updateFormData: (updates: Partial<JobFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Review</h3>
      
      <div>
        <h4 className="text-lg font-medium mb-4">Job details</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Job title</span>
            <span>{formData.title}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Company for this job</span>
                            <span>Company</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Location</span>
            <span>{formData.location}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Job type</span>
            <span>{formData.jobType}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Pay</span>
            <span>
              {formData.minPay && formData.maxPay 
                ? `IDR ${formData.minPay} - ${formData.maxPay} ${formData.payRate}`
                : 'Not specified'
              }
            </span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-4">Settings</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Application method</span>
            <span>Email</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Require CV</span>
            <span>{formData.requireCV ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-medium">Application updates</span>
            <span>{formData.applicationEmail}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        By selecting <strong>Confirm</strong>, you agree that this job post reflects your requirements, and agree it will be posted and applications will be processed following Indeed's Terms, Cookie and Privacy Policies.
      </div>
    </div>
  )
} 
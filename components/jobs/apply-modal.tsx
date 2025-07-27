"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Job } from '@/lib/database.types'
import { ApplicationFormData } from '@/lib/database.types'
import { useApplyToJob } from './job-applications'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ApplyModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export function ApplyModal({ job, isOpen, onClose }: ApplyModalProps) {
  const { applyToJob } = useApplyToJob(job?.id || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    cover_letter: '',
    resume_url: '',
    why_interested: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job) return

    setLoading(true)
    setError('')

    const result = await applyToJob(job, formData)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)
    } else {
      setError(result.error || 'Failed to submit application')
    }
    
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      cover_letter: '',
      resume_url: '',
      why_interested: ''
    })
    setSuccess(false)
    setError('')
  }

  const handleClose = () => {
    onClose()
    setTimeout(resetForm, 300) // Reset after modal animation
  }

  if (!job) return null

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
        <div className="text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Application Submitted!</h2>
          <p className="text-muted-foreground">
            Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            You can track your application status in My Jobs.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Apply to {job.company}</h2>
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-foreground">{job.title}</h3>
            <p className="text-sm text-muted-foreground">{job.location}</p>
            {job.salary && (
              <p className="text-sm text-muted-foreground">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.period}
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Resume/CV Link (Optional)
            </label>
            <Input
              type="url"
              value={formData.resume_url}
              onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
              placeholder="https://drive.google.com/file/... or LinkedIn profile"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link to your resume, portfolio, or LinkedIn profile
            </p>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.cover_letter}
              onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
              placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my interest in the [position title] role at [company name]..."
              className="w-full min-h-[120px] p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 50 characters. Tell the employer why you're a great fit.
            </p>
          </div>

          {/* Why Interested */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Why are you interested in this role? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.why_interested}
              onChange={(e) => setFormData(prev => ({ ...prev, why_interested: e.target.value }))}
              placeholder="What attracts you to this position and company? What specific skills or experiences make you a good fit?"
              className="w-full min-h-[80px] p-3 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y"
              required
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.cover_letter.length < 50 || !formData.why_interested.trim()}
              className="flex-1 bg-indeed-blue hover:bg-indeed-blue-dark"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            By submitting this application, you confirm that the information provided is accurate and complete.
            You can withdraw your application at any time from My Jobs.
          </p>
        </div>
      </div>
    </Modal>
  )
} 
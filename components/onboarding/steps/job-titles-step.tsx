"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPreferences } from '@/lib/database.types'
import { ArrowLeft, X } from 'lucide-react'

interface JobTitlesStepProps {
  preferences: Partial<UserPreferences>
  updatePreferences: (updates: Partial<UserPreferences>) => void
  onNext: () => void
  onBack: () => void
  canGoBack: boolean
}

const jobSuggestions = [
  'Intern', 'Internship', 'Admin Assistant', 'Service Crew',
  'Customer Service Officer', 'Sales Executive', 'Software Engineer',
  'Data Analyst', 'Marketing Manager', 'Project Manager',
  'Business Analyst', 'Full Stack Developer', 'Frontend Developer',
  'Backend Developer', 'DevOps Engineer', 'Product Manager',
  'UX Designer', 'UI Designer', 'Graphic Designer', 'Content Writer',
  'Digital Marketing Specialist', 'Accountant', 'Financial Analyst',
  'Human Resources', 'Operations Manager', 'Quality Assurance',
  'Principal Engineer', 'Senior Software Engineer', 'Lead Developer',
  'Engineering Manager', 'Technical Lead', 'Solution Architect'
]

export function JobTitlesStep({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack, 
  canGoBack 
}: JobTitlesStepProps) {
  const [jobTitles, setJobTitles] = useState<string[]>(preferences.job_titles || [])
  const [currentInput, setCurrentInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = jobSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(currentInput.toLowerCase()) &&
    !jobTitles.includes(suggestion)
  )

  const addJobTitle = (title: string) => {
    if (title.trim() && !jobTitles.includes(title.trim()) && jobTitles.length < 10) {
      const newTitles = [...jobTitles, title.trim()]
      setJobTitles(newTitles)
      setCurrentInput('')
      setShowSuggestions(false)
    }
  }

  const removeJobTitle = (titleToRemove: string) => {
    setJobTitles(jobTitles.filter(title => title !== titleToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (currentInput.trim()) {
        addJobTitle(currentInput.trim())
      }
    }
  }

  const handleContinue = () => {
    updatePreferences({
      job_titles: jobTitles
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        {canGoBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            What job are you looking for?
          </h1>
          <p className="text-muted-foreground mt-2">
            You can always change this later.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <div className="w-6 h-6 bg-indeed-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs">💡</span>
        </div>
        <p className="text-sm text-blue-800">
          This helps us get started in showing you the most relevant jobs.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Desired job titles
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add up to ten job titles
          </p>

          {/* Added job titles */}
          {jobTitles.length > 0 && (
            <div className="space-y-2 mb-4">
              {jobTitles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <span className="text-foreground">{title}</span>
                  <button
                    type="button"
                    onClick={() => removeJobTitle(title)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input for new job title */}
          {jobTitles.length < 10 && (
            <div className="relative">
              <Input
                type="text"
                value={currentInput}
                onChange={(e) => {
                  setCurrentInput(e.target.value)
                  setShowSuggestions(true)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="e.g. Software Engineer, Marketing Manager"
                className="h-12"
                onFocus={() => setShowSuggestions(true)}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && currentInput && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredSuggestions.slice(0, 8).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addJobTitle(suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add another button */}
          {jobTitles.length > 0 && jobTitles.length < 10 && (
            <button
              type="button"
              onClick={() => {
                // Focus on the input
                const input = document.querySelector('input[type="text"]') as HTMLInputElement
                input?.focus()
              }}
              className="text-indeed-blue hover:underline text-sm mt-2"
            >
              + Add another
            </button>
          )}
        </div>

        {/* Continue button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-8 bg-indeed-blue hover:bg-indeed-blue-dark"
            disabled={jobTitles.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
} 
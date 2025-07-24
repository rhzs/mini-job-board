"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { useAuth } from '@/lib/auth-context'
import { LoadingStep } from './steps/loading-step'
import { LocationStep } from './steps/location-step'
import { SalaryStep } from './steps/salary-step'
import { JobTitlesStep } from './steps/job-titles-step'
import { UserPreferences } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

export function OnboardingModal() {
  const { user, showOnboarding, closeOnboarding } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    remote_work: false,
    job_titles: [],
    onboarding_completed: false
  })

  const steps = [
    { component: LoadingStep, title: "Matching you with jobs" },
    { component: LocationStep, title: "Where are you located?" },
    { component: SalaryStep, title: "What's the minimum pay you're looking for?" },
    { component: JobTitlesStep, title: "What job are you looking for?" }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) { // Don't allow going back from loading step
      setCurrentStep(currentStep - 1)
    }
  }

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }

  const completeOnboarding = async () => {
    if (!user) return

    try {
      const finalPreferences = {
        ...preferences,
        user_id: user.id,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_preferences')
        .insert([finalPreferences])

      if (error) {
        console.error('Error saving preferences:', error)
      } else {
        console.log('Preferences saved successfully')
        closeOnboarding()
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const progress = currentStep === 0 ? 25 : ((currentStep) / (steps.length - 1)) * 100

  const CurrentStepComponent = steps[currentStep].component

  return (
    <Modal
      isOpen={showOnboarding}
      onClose={() => {}} // Prevent closing during onboarding
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        {currentStep > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indeed-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Step Content */}
        <CurrentStepComponent
          preferences={preferences}
          updatePreferences={updatePreferences}
          onNext={handleNext}
          onBack={handleBack}
          canGoBack={currentStep > 1}
          isLoading={currentStep === 0}
        />
      </div>
    </Modal>
  )
} 
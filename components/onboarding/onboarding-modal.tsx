"use client"

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
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
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)

  // Double-check onboarding status when modal shows
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (showOnboarding && user) {
        try {
          const { data } = await supabase
            .from('user_preferences')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single()
          
          if (data && data.onboarding_completed === true) {
            console.log('User has already completed onboarding, closing modal')
            closeOnboarding()
          }
        } catch (error) {
          // Ignore errors, let modal show
          console.log('Error checking onboarding status in modal, proceeding with onboarding')
        }
      }
    }

    checkOnboardingStatus()
  }, [showOnboarding, user, closeOnboarding])

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

  const savePartialPreferences = async () => {
    if (!user) return

    try {
      const partialPreferences = {
        ...preferences,
        user_id: user.id,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Check if preferences already exist
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingData) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(partialPreferences)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating preferences:', error)
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert([partialPreferences])

        if (error) {
          console.error('Error saving preferences:', error)
        }
      }
    } catch (error) {
      console.error('Error saving partial preferences:', error)
    }
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

      // Check if preferences already exist
      const { data: existingData } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingData) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(finalPreferences)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error updating preferences:', error)
        } else {
          console.log('Preferences updated successfully')
          closeOnboarding()
        }
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert([finalPreferences])

        if (error) {
          console.error('Error saving preferences:', error)
        } else {
          console.log('Preferences saved successfully')
          closeOnboarding()
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  const progress = currentStep === 0 ? 25 : ((currentStep) / (steps.length - 1)) * 100

  const CurrentStepComponent = steps[currentStep].component

  const handleClose = () => {
    // Allow closing but show confirmation for steps after loading
    if (currentStep > 0) {
      setShowCloseConfirmation(true)
    } else {
      closeOnboarding()
    }
  }

  const handleConfirmClose = () => {
    savePartialPreferences()
    closeOnboarding()
  }

  return (
    <>
      <Modal
        isOpen={showOnboarding}
        onClose={handleClose}
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

      {/* Close Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCloseConfirmation}
        onClose={() => setShowCloseConfirmation(false)}
        onConfirm={handleConfirmClose}
        title="Save your progress?"
        message="Your preferences will be saved and you can continue setting up your profile later from the homepage."
        confirmText="Save & Close"
        cancelText="Continue Setup"
        variant="default"
      />
    </>
  )
} 
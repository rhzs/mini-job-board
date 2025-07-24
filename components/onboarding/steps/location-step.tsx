"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPreferences } from '@/lib/database.types'
import { ArrowLeft } from 'lucide-react'

interface LocationStepProps {
  preferences: Partial<UserPreferences>
  updatePreferences: (updates: Partial<UserPreferences>) => void
  onNext: () => void
  onBack: () => void
  canGoBack: boolean
}

export function LocationStep({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack, 
  canGoBack 
}: LocationStepProps) {
  const [city, setCity] = useState(preferences.city || '')
  const [postcode, setPostcode] = useState(preferences.postcode || '')
  const [remoteWork, setRemoteWork] = useState(preferences.remote_work || false)

  const handleContinue = () => {
    updatePreferences({
      city: city || 'Singapore', // Default to Singapore
      country: 'Singapore',
      postcode,
      remote_work: remoteWork
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
            Let's make sure your preferences are up to date. Where are you located?
          </h1>
          <p className="text-muted-foreground mt-2">
            We use this to match you with jobs nearby.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
              City, Country
            </label>
            <div className="relative">
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Singapore"
                className="h-12"
              />
              {city && (
                <button
                  type="button"
                  onClick={() => setCity('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-foreground mb-2">
              Postcode
            </label>
            <Input
              id="postcode"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="123456"
              className="h-12"
            />
          </div>
        </div>

        {/* Remote work toggle */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setRemoteWork(!remoteWork)}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
              remoteWork 
                ? 'bg-indeed-blue border-indeed-blue text-white' 
                : 'border-gray-300'
            }`}
          >
            {remoteWork && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <label className="text-foreground cursor-pointer" onClick={() => setRemoteWork(!remoteWork)}>
            I'm interested in remote work
          </label>
        </div>

        {/* Continue button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-8 bg-indeed-blue hover:bg-indeed-blue-dark"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
} 
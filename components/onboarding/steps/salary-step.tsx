"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPreferences } from '@/lib/database.types'
import { ArrowLeft, ChevronDown } from 'lucide-react'

interface SalaryStepProps {
  preferences: Partial<UserPreferences>
  updatePreferences: (updates: Partial<UserPreferences>) => void
  onNext: () => void
  onBack: () => void
  canGoBack: boolean
}

const payPeriods = [
  { value: 'hour', label: 'per hour' },
  { value: 'day', label: 'per day' },
  { value: 'week', label: 'per week' },
  { value: 'month', label: 'per month' },
  { value: 'year', label: 'per year' }
] as const

export function SalaryStep({ 
  preferences, 
  updatePreferences, 
  onNext, 
  onBack, 
  canGoBack 
}: SalaryStepProps) {
  const [minimumPay, setMinimumPay] = useState(preferences.minimum_pay?.toString() || '')
  const [payPeriod, setPayPeriod] = useState<UserPreferences['pay_period']>(preferences.pay_period || 'month')
  const [showDropdown, setShowDropdown] = useState(false)

  const handleContinue = () => {
    updatePreferences({
      minimum_pay: minimumPay ? parseFloat(minimumPay) : undefined,
      pay_period: payPeriod
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
            What's the minimum pay you're looking for?
          </h1>
          <p className="text-muted-foreground mt-2">
            We use this to match you with jobs that pay around and above this amount.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <div className="w-6 h-6 bg-indeed-blue rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-800">
          Employers can't see this.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-foreground mb-2">
              Minimum base pay
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="salary"
                type="number"
                value={minimumPay}
                onChange={(e) => setMinimumPay(e.target.value)}
                placeholder="0"
                className="h-12 pl-8"
              />
            </div>
          </div>

          <div>
            <label htmlFor="period" className="block text-sm font-medium text-foreground mb-2">
              Pay period
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full h-12 px-3 py-2 bg-background border border-input rounded-md flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span className={payPeriod ? 'text-foreground' : 'text-muted-foreground'}>
                  {payPeriod ? payPeriods.find(p => p.value === payPeriod)?.label : 'Select'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10">
                  {payPeriods.map((period) => (
                    <button
                      key={period.value}
                      type="button"
                      onClick={() => {
                        setPayPeriod(period.value)
                        setShowDropdown(false)
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none"
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
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
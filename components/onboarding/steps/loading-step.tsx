"use client"

import React, { useEffect } from 'react'

interface LoadingStepProps {
  onNext: () => void
  isLoading: boolean
}

export function LoadingStep({ onNext, isLoading }: LoadingStepProps) {
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        onNext()
      }, 3000) // Show loading for 3 seconds

      return () => clearTimeout(timer)
    }
  }, [isLoading, onNext])

  return (
    <div className="text-center py-16">
      {/* Illustration */}
      <div className="mx-auto mb-8 w-64 h-64 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Background circles */}
          <div className="absolute w-32 h-32 bg-orange-200 rounded-full opacity-60 animate-pulse" />
          <div className="absolute w-24 h-24 bg-orange-300 rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.5s'}} />
          
          {/* People illustration */}
          <div className="relative z-10 flex items-end space-x-2">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-amber-400 rounded-full mb-1" />
              <div className="w-6 h-12 bg-green-600 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-full mb-1" />
              <div className="w-6 h-14 bg-teal-700 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-pink-400 rounded-full mb-1" />
              <div className="w-7 h-16 bg-blue-800 rounded-t-lg relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-blue-600 rounded" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-amber-500 rounded-full mb-1" />
              <div className="w-6 h-13 bg-yellow-700 rounded-t-lg" />
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full mb-1" />
              <div className="w-6 h-12 bg-green-700 rounded-t-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Matching you with jobs
      </h1>
      
      {/* Loading spinner */}
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indeed-blue" />
      </div>
    </div>
  )
} 
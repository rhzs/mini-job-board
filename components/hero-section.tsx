"use client"

import React from 'react'
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Hero Illustration */}
          <div className="relative mx-auto mb-8 w-full max-w-md">
            <div className="relative">
              {/* Background circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-pink-200 dark:bg-pink-900/30 opacity-60"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-pink-300 dark:bg-pink-800/40 opacity-40"></div>
              </div>
              
              {/* People illustration placeholders */}
              <div className="relative z-10 flex items-center justify-center h-80">
                <div className="flex items-end space-x-4">
                  {/* Person 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-200 dark:bg-amber-400 mb-2"></div>
                    <div className="w-12 h-20 rounded-t-lg bg-green-600 dark:bg-green-500"></div>
                  </div>
                  
                  {/* Person 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-200 dark:bg-yellow-400 mb-2"></div>
                    <div className="w-12 h-24 rounded-t-lg bg-teal-700 dark:bg-teal-600"></div>
                  </div>
                  
                  {/* Person 3 (center) */}
                  <div className="flex flex-col items-center">
                    <div className="w-18 h-18 rounded-full bg-pink-200 dark:bg-pink-400 mb-2"></div>
                    <div className="w-14 h-28 rounded-t-lg bg-blue-800 dark:bg-blue-700 relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-blue-600 dark:bg-blue-500 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Person 4 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-300 dark:bg-amber-500 mb-2"></div>
                    <div className="w-12 h-22 rounded-t-lg bg-yellow-700 dark:bg-yellow-600 relative">
                      <div className="absolute -top-4 -right-2 w-6 h-8 bg-yellow-600 dark:bg-yellow-500 rounded transform rotate-45"></div>
                    </div>
                  </div>
                  
                  {/* Person 5 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-400 mb-2"></div>
                    <div className="w-12 h-20 rounded-t-lg bg-green-700 dark:bg-green-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Find your next opportunity
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover jobs tailored to your preferences and start your journey to success.
            </p>
            <Button 
              size="lg" 
              className="bg-indeed-blue hover:bg-indeed-blue-dark px-8 py-3 text-lg text-primary-foreground"
              onClick={() => window.location.href = '/?q='}
            >
              Browse all jobs →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 
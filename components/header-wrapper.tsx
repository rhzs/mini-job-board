"use client"

import React, { Suspense } from 'react'
import Header from './header'

function HeaderSkeleton() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-indeed-blue">
              indeed
            </div>
          </div>
          
          {/* Navigation skeleton */}
          <nav className="hidden md:flex items-center space-x-8 h-16">
            <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          </nav>
          
          {/* Right side skeleton */}
          <div className="flex items-center space-x-6">
            <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function HeaderWrapper() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <Header />
    </Suspense>
  )
} 
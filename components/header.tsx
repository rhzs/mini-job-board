"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function Header() {
  const { user, openSignIn, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine current page state after hydration
  const currentPage = mounted ? searchParams.get('page') : null
  const searchQuery = mounted ? searchParams.get('q') : null
  
  const isMyJobs = currentPage === 'my-jobs'
  const isHome = pathname === '/' && !currentPage && !searchQuery

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <button 
                onClick={() => handleNavigation('/')}
                className="text-2xl font-bold text-indeed-blue hover:text-indeed-blue-dark transition-colors"
              >
                indeed
              </button>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => handleNavigation('/')}
                className={`text-foreground hover:text-indeed-blue pb-4 transition-colors ${
                  isHome ? 'border-b-2 border-indeed-blue text-indeed-blue' : 'border-b-2 border-transparent'
                }`}
              >
                Home
              </button>
              {user && (
                <button 
                  onClick={() => handleNavigation('/?page=my-jobs')}
                  className={`text-foreground hover:text-indeed-blue pb-4 transition-colors ${
                    isMyJobs ? 'border-b-2 border-indeed-blue text-indeed-blue' : 'border-b-2 border-transparent'
                  }`}
                >
                  My jobs
                </button>
              )}
              <a href="#" className="text-foreground hover:text-indeed-blue pb-4 transition-colors border-b-2 border-transparent">
                Company reviews
              </a>
              <a href="#" className="text-foreground hover:text-indeed-blue pb-4 transition-colors border-b-2 border-transparent">
                Salary guide
              </a>
            </nav>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <Button variant="link" className="text-indeed-blue" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="link" className="text-indeed-blue" onClick={openSignIn}>
                Sign in
              </Button>
            )}
            
            {/* Separator and Employers button - always visible */}
            <span className="text-muted-foreground">|</span>
            <Button 
              variant="link" 
              className="text-indeed-blue"
              onClick={() => handleNavigation('/employer')}
            >
              Employers / Post Job
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 
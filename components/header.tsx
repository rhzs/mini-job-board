"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import CompanySelector from "@/components/tenant/company-selector"
import { useIsCompanyMode, usePersonalMode } from "@/lib/tenant-context"

export default function Header() {
  const { user, openSignIn } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const isCompanyMode = useIsCompanyMode()
  const switchToPersonal = usePersonalMode()

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
          <div className="flex items-center space-x-10">
            <div className="flex-shrink-0">
              <button 
                onClick={() => handleNavigation('/')}
                className="text-2xl font-bold text-indeed-blue hover:text-indeed-blue-dark transition-colors"
              >
                indeed
              </button>
            </div>
            <nav className="hidden md:flex items-center space-x-8 h-16">
              {/* Company Mode Navigation */}
              {isCompanyMode ? (
                <>
                  <button 
                    onClick={() => handleNavigation('/')}
                    className={`relative flex items-center h-full px-1 text-sm font-medium transition-colors hover:text-indeed-blue ${
                      isHome ? 'text-indeed-blue' : 'text-foreground'
                    }`}
                  >
                    Dashboard
                    {isHome && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indeed-blue rounded-full"></div>
                    )}
                  </button>
                  <button 
                    onClick={switchToPersonal}
                    className="relative flex items-center h-full px-1 text-sm font-medium text-foreground transition-colors hover:text-indeed-blue"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Switch to Personal
                  </button>
                </>
              ) : (
                /* Personal Mode Navigation */
                <>
                  <button 
                    onClick={() => handleNavigation('/')}
                    className={`relative flex items-center h-full px-1 text-sm font-medium transition-colors hover:text-indeed-blue ${
                      isHome ? 'text-indeed-blue' : 'text-foreground'
                    }`}
                  >
                    Home
                    {isHome && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indeed-blue rounded-full"></div>
                    )}
                  </button>
                  {user && (
                    <button 
                      onClick={() => handleNavigation('/?page=my-jobs')}
                      className={`relative flex items-center h-full px-1 text-sm font-medium transition-colors hover:text-indeed-blue ${
                        isMyJobs ? 'text-indeed-blue' : 'text-foreground'
                      }`}
                    >
                      My jobs
                      {isMyJobs && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indeed-blue rounded-full"></div>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleNavigation('/companies')}
                    className={`relative flex items-center h-full px-1 text-sm font-medium transition-colors hover:text-indeed-blue ${
                      pathname === '/companies' ? 'text-indeed-blue' : 'text-foreground'
                    }`}
                  >
                    Company reviews
                    {pathname === '/companies' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indeed-blue rounded-full"></div>
                    )}
                  </button>
                  <a 
                    href="#" 
                    className="relative flex items-center h-full px-1 text-sm font-medium text-foreground transition-colors hover:text-indeed-blue"
                  >
                    Salary guide
                  </a>
                </>
              )}
            </nav>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            
            {/* Company Selector - only show for logged in users */}
            {user && (
              <CompanySelector
                onCreateCompany={() => setShowCreateModal(true)}
                onJoinCompany={() => setShowJoinModal(true)}
              />
            )}
            
            {/* Auth Section - Only show sign in for non-authenticated users */}
            {!user && (
              <Button 
                variant="link" 
                className="text-indeed-blue hover:text-indeed-blue-dark font-medium h-auto p-0"
                onClick={openSignIn}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* TODO: Add modals for company creation and joining */}
    </header>
  )
} 
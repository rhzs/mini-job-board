"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, MapPin, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Header() {
  const { user, openSignIn, signOut } = useAuth()

  return (
    <header className="bg-background border-b border-border">
      {/* Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-indeed-blue">indeed</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-foreground hover:text-indeed-blue border-b-2 border-indeed-blue pb-4">
                Home
              </a>
              <a href="#" className="text-foreground hover:text-indeed-blue pb-4">
                Company reviews
              </a>
              <a href="#" className="text-foreground hover:text-indeed-blue pb-4">
                Salary guide
              </a>
            </nav>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-indeed-blue" />
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
                <Button variant="link" className="text-indeed-blue" onClick={signOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="link" className="text-indeed-blue" onClick={openSignIn}>
                  Sign in
                </Button>
                <span className="text-muted-foreground">|</span>
              </>
            )}
            <Button variant="link" className="text-indeed-blue">
              Employers / Post
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <div className="pb-6">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                defaultValue="Singapore"
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button size="lg" className="h-12 px-8 bg-indeed-blue hover:bg-indeed-blue-dark">
              Find jobs
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export default function Header() {
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
            <Button variant="link" className="text-indeed-blue">
              Sign in
            </Button>
            <span className="text-muted-foreground">|</span>
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
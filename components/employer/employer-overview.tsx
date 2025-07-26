"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, 
  Users, 
  BarChart3, 
  Calendar, 
  Settings, 
  ArrowRight,
  Plus,
  MessageSquare,
  Eye,
  UserCheck,
  Mail,
  MoreHorizontal,
  Megaphone,
  PieChart
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useJobPostings } from './job-postings'
import { JobPostingModal } from './job-posting-modal'

export function EmployerOverview() {
  const router = useRouter()
  const { jobPostings, loading } = useJobPostings()
  const [showJobModal, setShowJobModal] = useState(false)

  const recentJob = jobPostings[0] // Most recent job for activity section

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Recent Activity Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your recent activity</h2>
          <Button 
            variant="link" 
            className="text-indeed-blue"
            onClick={() => handleNavigation('/employer/jobs')}
          >
            View all jobs <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        {loading ? (
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                <div className="space-y-1 mt-4">
                  <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : recentJob ? (
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 
                  className="font-medium text-indeed-blue cursor-pointer hover:underline"
                  onClick={() => handleNavigation(`/job/${recentJob.id}`)}
                >
                  {recentJob.title}
                </h3>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{recentJob.location}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{recentJob.application_count} active candidates</span>
                </div>
                <div className="flex items-center text-sm">
                  <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>0 awaiting review</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>0 unread messages</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <p className="text-muted-foreground">No recent job activity</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Jobs Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-600" />
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Post, edit and manage your jobs posted on Indeed as well as jobs on your company's careers site.
            </p>
            <div className="space-y-6">
              <Button 
                variant="link" 
                className="h-auto p-0 text-indeed-blue text-sm justify-start"
                onClick={() => setShowJobModal(true)}
              >
                Post a job <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              
              <div className="border-t border-border pt-4">
                <Button 
                  variant="link" 
                  className="h-auto p-0 text-indeed-blue text-sm justify-start"
                  onClick={() => handleNavigation('/employer/jobs')}
                >
                  View jobs posted by me <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Card - Coming Soon */}
        <Card className="col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground/70">Feature in development</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Megaphone className="h-5 w-5 mr-2 text-blue-600/50" />
              Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground/50 mb-4">
              Manage your sponsored jobs, advertisements and more.
            </p>
            <div className="space-y-2">
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                Create a new campaign <ArrowRight className="h-4 w-4 ml-1" />
              </div>
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                View campaign performance <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews Card - Coming Soon */}
        <Card className="col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground/70">Feature in development</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600/50" />
              Upcoming interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-medium mb-1 text-muted-foreground/50">Upcoming interviews</h4>
              <p className="text-sm text-muted-foreground/50">All jobs</p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground/50 mb-4">
              <Calendar className="h-4 w-4 mr-2" />
              No upcoming interviews
            </div>
            <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
              See all upcoming interviews <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </CardContent>
        </Card>

        {/* Candidates Card - Coming Soon */}
        <Card className="col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground/70">Feature in development</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600/50" />
              Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground/50 mb-4">
              Review candidates who have applied to your jobs and message applicants.
            </p>
            <div className="space-y-2">
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                Review recent candidates <ArrowRight className="h-4 w-4 ml-1" />
              </div>
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                View messages <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Card - Coming Soon */}
        <Card className="col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground/70">Feature in development</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-pink-600/50" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground/50 mb-4">
              Analyse performance across all the different Indeed products and services that you utilise.
            </p>
            <div className="space-y-2">
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                Go to Analytics overview <ArrowRight className="h-4 w-4 ml-1" />
              </div>
              <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
                Go to Hiring Insights <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Card - Coming Soon */}
        <Card className="col-span-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/90 to-background/95 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Coming Soon</p>
              <p className="text-xs text-muted-foreground/70">Feature in development</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-600/50" />
              Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground/50 mb-4">
              Access to helpful tools to better manage your team's experience on Indeed.
            </p>
            <div className="h-auto p-0 text-muted-foreground/50 text-sm flex items-center">
              View available tools <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <JobPostingModal 
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        mode="create"
      />
    </div>
  )
} 
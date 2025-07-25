"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Mail, Calendar, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { JobPosting } from '@/lib/database.types'

interface JobApplication {
  id: string
  job_id: string
  applicant_name: string
  applicant_email: string
  cover_letter?: string
  resume_url?: string
  status: 'pending' | 'reviewing' | 'interviewed' | 'rejected' | 'hired'
  applied_date: string
}

export default function JobApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user && params.id) {
      fetchJobAndApplications()
    }
  }, [user, authLoading, params.id])

  const fetchJobAndApplications = async () => {
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', params.id)
        .eq('employer_id', user?.id)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        router.push('/employer/jobs')
        return
      }

      setJob(jobData)

      // For now, we'll show mock applications since we don't have an applications table
      // In a real app, you'd fetch from a job_applications table
      const mockApplications: JobApplication[] = [
        {
          id: '1',
          job_id: params.id as string,
          applicant_name: 'John Doe',
          applicant_email: 'john.doe@email.com',
          cover_letter: 'I am excited to apply for this position...',
          status: 'pending',
          applied_date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '2',
          job_id: params.id as string,
          applicant_name: 'Jane Smith',
          applicant_email: 'jane.smith@email.com',
          cover_letter: 'With my experience in...',
          status: 'reviewing',
          applied_date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ]

      setApplications(mockApplications)
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/employer/jobs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewing': return 'bg-blue-100 text-blue-800'
      case 'interviewed': return 'bg-purple-100 text-purple-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'hired': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || !job) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/employer/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Applications for: {job.title}
          </h1>
          <p className="text-muted-foreground">
            {applications.length} applications received
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground">
                Applications will appear here once candidates apply for this job.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      {application.applicant_name}
                    </CardTitle>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {application.applicant_email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Applied {new Date(application.applied_date).toLocaleDateString()}
                    </div>
                    {application.cover_letter && (
                      <div>
                        <h4 className="font-medium mb-2">Cover Letter</h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm">Review Application</Button>
                      <Button variant="outline" size="sm">Contact Applicant</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
} 
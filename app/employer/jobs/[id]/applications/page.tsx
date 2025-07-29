"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Download,
  MessageSquare
} from 'lucide-react'
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

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
          cover_letter: 'I am excited to apply for this position. With over 5 years of experience in software development, I have worked extensively with JavaScript, React, and Node.js. My previous role at TechCorp involved leading a team of 4 developers to build scalable web applications. I am particularly interested in this role because of your company\'s commitment to innovation and the opportunity to work on cutting-edge projects.',
          resume_url: 'https://example.com/john-doe-resume.pdf',
          status: 'pending',
          applied_date: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: '2',
          job_id: params.id as string,
          applicant_name: 'Jane Smith',
          applicant_email: 'jane.smith@email.com',
          cover_letter: 'With my experience in full-stack development and passion for creating user-centric applications, I believe I would be a great fit for this role. I have 3 years of experience working with modern web technologies including React, TypeScript, and Python. In my current position, I have successfully delivered multiple projects on time and have received recognition for my problem-solving skills and attention to detail.',
          resume_url: 'https://example.com/jane-smith-resume.pdf',
          status: 'reviewing',
          applied_date: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        },
        {
          id: '3',
          job_id: params.id as string,
          applicant_name: 'Alex Johnson',
          applicant_email: 'alex.johnson@email.com',
          cover_letter: 'I am writing to express my interest in the software engineer position. As a recent computer science graduate with internship experience at two tech startups, I am eager to bring my fresh perspective and enthusiasm to your team. I have hands-on experience with React, Node.js, and database design.',
          status: 'interviewed',
          applied_date: new Date(Date.now() - 259200000).toISOString() // 3 days ago
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

  const toggleRowExpansion = (applicationId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(applicationId)) {
      newExpandedRows.delete(applicationId)
    } else {
      newExpandedRows.add(applicationId)
    }
    setExpandedRows(newExpandedRows)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'reviewing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'interviewed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
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
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">&nbsp;</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Applicant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Applied</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <React.Fragment key={application.id}>
                        {/* Main row */}
                        <tr 
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => toggleRowExpansion(application.id)}
                        >
                          <td className="p-4 w-8">
                            {expandedRows.has(application.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{application.applicant_name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{application.applicant_email}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(application.status)}>
                              {application.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(application.applied_date)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle review action
                                }}
                              >
                                Review
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (typeof window !== 'undefined') {
                  window.location.href = `mailto:${application.applicant_email}`
                }
                                }}
                              >
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded row content */}
                        {expandedRows.has(application.id) && (
                          <tr className="bg-muted/30">
                            <td colSpan={6} className="p-0">
                              <div className="p-6 border-t border-border">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Cover Letter */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Cover Letter
                                    </h4>
                                    {application.cover_letter ? (
                                      <div className="bg-background p-4 rounded-lg border text-sm">
                                        {application.cover_letter}
                                      </div>
                                    ) : (
                                      <p className="text-muted-foreground text-sm italic">
                                        No cover letter provided
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Application Details & Actions */}
                                  <div>
                                    <h4 className="font-semibold mb-3">Application Details</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Resume:</span>
                                        {application.resume_url ? (
                                          <Button size="sm" variant="outline" asChild>
                                            <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                                              <Download className="h-3 w-3 mr-1" />
                                              Download
                                            </a>
                                          </Button>
                                        ) : (
                                          <span className="text-sm text-muted-foreground italic">
                                            No resume provided
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Applied:</span>
                                        <span className="text-sm">
                                          {new Date(application.applied_date).toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      <div className="pt-4 border-t">
                                        <div className="flex gap-2">
                                          <Button size="sm">
                                            Update Status
                                          </Button>
                                          <Button size="sm" variant="outline">
                                            Schedule Interview
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `mailto:${application.applicant_email}`
                }
              }}
                                          >
                                            Send Email
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  )
} 
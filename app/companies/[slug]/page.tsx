"use client"

import React, { useState, useEffect, use } from 'react'
import { useParams, notFound } from 'next/navigation'
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, Users, Building2, ExternalLink } from 'lucide-react'
import { fetchCompanyBySlug, fetchCompanyQuestionsWithAnswers, fetchCompanyReviews, fetchCompanySalaries, fetchCompanyJobs } from '@/lib/supabase-companies'
import { Company, CompanyQuestion, CompanyAnswer, CompanyReview, CompanySalary } from '@/lib/database.types'
import { fetchJobs } from '@/lib/supabase-jobs'

interface CompanyPageProps {
  params: Promise<{ slug: string }>
}

type TabType = 'snapshot' | 'why-join' | 'reviews' | 'salaries' | 'jobs' | 'questions' | 'interviews'

export default function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = use(params)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('questions')
  const [questions, setQuestions] = useState<(CompanyQuestion & { answers: CompanyAnswer[] })[]>([])
  const [reviews, setReviews] = useState<CompanyReview[]>([])
  const [salaries, setSalaries] = useState<CompanySalary[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [questionFilter, setQuestionFilter] = useState<string>('')
  const [questionSearch, setQuestionSearch] = useState<string>('')

  useEffect(() => {
    fetchCompanyData()
  }, [slug])

  useEffect(() => {
    if (company && activeTab === 'questions') {
      fetchQuestionsData()
    } else if (company && activeTab === 'reviews') {
      fetchReviewsData()
    } else if (company && activeTab === 'salaries') {
      fetchSalariesData()
    } else if (company && activeTab === 'jobs') {
      fetchJobsData()
    }
  }, [company, activeTab])

  const fetchCompanyData = async () => {
    try {
      const companyData = await fetchCompanyBySlug(slug)
      if (!companyData) {
        notFound()
      }
      setCompany(companyData)
    } catch (error) {
      console.error('Error fetching company:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionsData = async () => {
    if (!company) return
    try {
      const questionsData = await fetchCompanyQuestionsWithAnswers(company.id)
      setQuestions(questionsData)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const fetchReviewsData = async () => {
    if (!company) return
    try {
      const reviewsData = await fetchCompanyReviews(company.id)
      setReviews(reviewsData)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchSalariesData = async () => {
    if (!company) return
    try {
      const salariesData = await fetchCompanySalaries(company.id)
      setSalaries(salariesData)
    } catch (error) {
      console.error('Error fetching salaries:', error)
    }
  }

  const fetchJobsData = async () => {
    if (!company) return
    try {
      const result = await fetchJobs({ company: company.name })
      if (!result.error) {
        setJobs(result.jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i <= fullStars ? 'fill-purple-600 text-purple-600' : 'text-gray-300'}`} 
        />
      )
    }
    return stars
  }

  const getCompanyLogo = (company: Company) => {
    if (company.logo_url) {
      return (
        <img 
          src={company.logo_url} 
          alt={`${company.name} logo`}
          className="h-16 w-16 object-contain rounded-lg"
        />
      )
    }
    
    return (
      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
        {company.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  const tabs = [
    { id: 'snapshot', label: 'Snapshot' },
    { id: 'why-join', label: 'Why Join Us' },
    { id: 'reviews', label: `${company?.total_reviews?.toLocaleString() || 0} Reviews` },
    { id: 'salaries', label: '2.7K Salaries' },
    { id: 'jobs', label: `${company?.total_jobs || 0} Jobs` },
    { id: 'questions', label: `${questions.length} Questions` },
    { id: 'interviews', label: 'Interviews' }
  ]

  const questionTypes = [
    { id: 'all', label: 'All Questions' },
    { id: 'interview', label: 'Interviews' },
    { id: 'work-life', label: 'Work from Home' },
    { id: 'culture', label: 'Dress Code' },
    { id: 'benefits', label: 'Promotion' },
    { id: 'general', label: 'Hiring Process' }
  ]

  const filteredQuestions = questions.filter(q => {
    const matchesFilter = questionFilter === '' || questionFilter === 'all' || q.question_type === questionFilter
    const matchesSearch = questionSearch === '' || q.question.toLowerCase().includes(questionSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Company Header */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              {getCompanyLogo(company)}
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{company.name}</h1>
                  {company.is_verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(company.average_rating || 0)}
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(company.average_rating || 0).toFixed(1)}
                  </span>
                  <Star className="h-4 w-4 text-purple-600 fill-purple-600" />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {company.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{company.size} employees</span>
                    </div>
                  )}
                  {company.industry && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{company.industry}</span>
                    </div>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                Follow
              </Button>
              <Button variant="outline">
                Write a review
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-6">
          <nav className="flex gap-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[60vh]">
          {activeTab === 'questions' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Questions and Answers about {company.name}
                </h2>
                <p className="text-muted-foreground">Updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Question Filters */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">See questions about</p>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setQuestionFilter(type.id === 'all' ? '' : type.id)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        (questionFilter === type.id || (questionFilter === '' && type.id === 'all'))
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse/Ask Questions */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 border border-border rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-foreground font-medium">
                    <Building2 className="h-5 w-5" />
                    Browse questions ({filteredQuestions.length})
                  </div>
                </div>
                <div className="flex-1 border border-border rounded-lg p-4 text-center bg-accent">
                  <div className="flex items-center justify-center gap-2 text-foreground font-medium">
                    <ExternalLink className="h-5 w-5" />
                    Ask a question
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <p className="text-sm font-medium text-foreground mb-3">
                  {filteredQuestions.length} questions about working at {company.name}
                </p>
                <input
                  type="text"
                  placeholder="search keywords"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full max-w-md px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="border-b border-border pb-6">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {question.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Asked {new Date(question.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    {question.answers.length > 0 ? (
                      <div className="space-y-3">
                        {question.answers.map((answer) => (
                          <div key={answer.id} className="bg-accent rounded-lg p-4">
                            <p className="text-foreground mb-2">{answer.answer}</p>
                            <p className="text-sm text-muted-foreground">
                              Answered {new Date(answer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        ))}
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm">Answer</Button>
                          {question.answers.length > 1 && (
                            <Button variant="link" size="sm" className="text-primary">
                              See {question.answers.length} answers
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm">Answer</Button>
                        <Button variant="link" size="sm" className="text-primary">
                          Be the first to answer!
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="mt-8 bg-card border border-border rounded-lg p-6">
                <h3 className="font-medium text-foreground mb-2">Can't find your question about {company.name}?</h3>
                <Button variant="outline" className="w-full">Ask a question</Button>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Employee Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="font-medium text-foreground">{review.rating}.0</span>
                    </div>
                    <h3 className="font-medium text-foreground mb-2">{review.title}</h3>
                    <p className="text-muted-foreground mb-3">{review.review_text}</p>
                    <div className="text-sm text-muted-foreground">
                      {review.job_title} • {review.employment_type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'salaries' && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Salaries at {company.name}</h2>
              <div className="space-y-4">
                {salaries.map((salary) => (
                  <div key={salary.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-foreground">{salary.job_title}</h3>
                        <p className="text-sm text-muted-foreground">{salary.job_level} • {salary.employment_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">S${salary.total_compensation.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total comp</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Open Jobs at {company.name}</h2>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-medium text-foreground mb-2">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{job.location}</p>
                    <p className="text-foreground line-clamp-2">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'snapshot' || activeTab === 'why-join' || activeTab === 'interviews') && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Coming Soon
              </h3>
              <p className="text-muted-foreground">
                This section is under development.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 
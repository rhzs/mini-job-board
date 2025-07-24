"use client"

import React from 'react'
import { notFound } from 'next/navigation'
import { mockJobs } from '@/lib/mock-data'
import { JobDetail } from '@/components/jobs/job-detail'
import Header from '@/components/header'
import Footer from '@/components/footer'

interface JobPageProps {
  params: {
    id: string
  }
}

export default function JobPage({ params }: JobPageProps) {
  const job = mockJobs.find(j => j.id === params.id)
  
  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <JobDetail job={job} />
      </main>
      <Footer />
    </div>
  )
} 
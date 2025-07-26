import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { TenantProvider } from '@/lib/tenant-context'
import { SavedJobsProvider } from '@/components/jobs/saved-jobs'
import { JobApplicationsProvider } from '@/components/jobs/job-applications'
import { JobPostingsProvider } from '@/components/employer/job-postings'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Indeed Clone',
  description: 'Job board application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
                  <AuthProvider>
          <TenantProvider>
            <SavedJobsProvider>
              <JobApplicationsProvider>
                <JobPostingsProvider>
                  {children}
                </JobPostingsProvider>
              </JobApplicationsProvider>
            </SavedJobsProvider>
          </TenantProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 
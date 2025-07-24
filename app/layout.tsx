import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import { SavedJobsProvider } from '@/components/jobs/saved-jobs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Indeed - Find jobs, employment & career opportunities',
  description: 'Search millions of jobs from thousands of job sites, job boards, newspaper classifieds and company websites on indeed.com',
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
            <SavedJobsProvider>
              {children}
            </SavedJobsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 
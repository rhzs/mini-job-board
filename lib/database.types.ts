export interface UserPreferences {
  id: string
  user_id: string
  
  // Location preferences
  city?: string
  country?: string
  postcode?: string
  remote_work?: boolean
  
  // Salary preferences
  minimum_pay?: number
  pay_period?: 'hour' | 'day' | 'week' | 'month' | 'year'
  
  // Job preferences
  job_titles?: string[]
  
  // Metadata
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingStep {
  step: number
  title: string
  completed: boolean
}

export interface JobTitleSuggestion {
  title: string
  category?: string
} 

export interface JobApplication {
  id: string
  user_id: string
  job_id: string
  
  // Application details
  status: 'applied' | 'interview' | 'rejected' | 'withdrawn' | 'archived'
  applied_date: string
  cover_letter?: string
  resume_url?: string
  
  // Job details (cached for performance)
  job_title: string
  company_name: string
  job_location: string
  job_salary?: string
  job_type: string[]
  
  // Tracking
  last_updated: string
  notes?: string
  
  created_at: string
  updated_at: string
}

export interface ApplicationFormData {
  cover_letter: string
  resume_url?: string
  why_interested: string
}

export interface JobPosting {
  id: string
  employer_id: string // user_id of the employer
  
  // Job details
  title: string
  description: string
  company_name: string
  location: string
  job_type: string[] // ['Full-time', 'Part-time', 'Contract', 'Freelance']
  remote_allowed: boolean
  
  // Salary information
  salary_min?: number
  salary_max?: number
  salary_period?: 'hour' | 'day' | 'week' | 'month' | 'year'
  salary_currency?: string
  
  // Requirements and benefits
  requirements?: string[]
  benefits?: string[]
  experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
  
  // Posting management
  status: 'draft' | 'pending' | 'active' | 'paused' | 'closed' | 'expired'
  is_featured?: boolean
  is_sponsored?: boolean
  featured_until?: string
  
  // Application settings
  easy_apply: boolean
  external_apply_url?: string
  application_deadline?: string
  
  // Contact information
  contact_email?: string
  company_website?: string
  
  // Analytics
  view_count: number
  application_count: number
  
  // Metadata
  posted_date: string
  last_updated: string
  created_at: string
  updated_at: string
}

export interface JobPostingFormData {
  title: string
  description: string
  company_name: string
  location: string
  job_type: string[]
  remote_allowed: boolean
  salary_min?: number
  salary_max?: number
  salary_period?: 'hour' | 'day' | 'week' | 'month' | 'year'
  salary_currency?: string
  requirements?: string[]
  benefits?: string[]
  experience_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
  easy_apply: boolean
  external_apply_url?: string
  application_deadline?: string
  contact_email?: string
  company_website?: string
} 
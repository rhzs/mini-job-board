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
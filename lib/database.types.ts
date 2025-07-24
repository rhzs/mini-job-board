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
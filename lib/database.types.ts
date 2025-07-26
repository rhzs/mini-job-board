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
  job_id: string // Foreign key to job_postings.id
  
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
  company_id?: string // reference to companies table (optional for backward compatibility)
  
  // Job details
  title: string
  description: string
  company_name: string // fallback field for company name
  location: string
  job_type: string[] // ['Full-time', 'Part-time', 'Contract', 'Freelance']
  remote_allowed: boolean
  
  // Company information (populated via join when available)
  company?: Company
  
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

export interface Company {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logo_url?: string
  industry?: string
  company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5001+'
  founded_year?: number
  headquarters?: string
  email?: string
  phone?: string
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  is_verified: boolean
  is_featured: boolean
  status: 'active' | 'inactive' | 'pending'
  total_reviews: number
  average_rating: number
  total_jobs: number
  created_at: string
  updated_at: string
}

export interface CompanyReview {
  id: string
  company_id: string
  user_id: string
  rating: number
  title?: string
  review_text?: string
  job_title?: string
  employment_type?: 'current' | 'former'
  work_location?: string
  employment_duration?: string
  work_life_balance?: number
  compensation_benefits?: number
  job_security?: number
  management?: number
  culture?: number
  pros?: string
  cons?: string
  advice_to_management?: string
  is_anonymous: boolean
  is_verified: boolean
  is_featured: boolean
  helpful_count: number
  status: 'published' | 'pending' | 'rejected' | 'hidden'
  created_at: string
  updated_at: string
}

export interface CompanySalary {
  id: string
  company_id: string
  user_id?: string
  job_title: string
  job_level?: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive'
  department?: string
  base_salary: number
  bonus: number
  stock_options: number
  total_compensation: number
  salary_currency: string
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'
  work_location?: string
  years_of_experience?: number
  years_at_company?: number
  benefits_value: number
  is_verified: boolean
  is_anonymous: boolean
  submission_date: string
  created_at: string
  updated_at: string
}

export interface CompanyQuestion {
  id: string
  company_id: string
  user_id: string
  question: string
  question_type: 'interview' | 'work-life' | 'benefits' | 'culture' | 'general'
  is_anonymous: boolean
  helpful_count: number
  answer_count: number
  status: 'published' | 'pending' | 'rejected' | 'hidden'
  created_at: string
  updated_at: string
}

export interface CompanyAnswer {
  id: string
  question_id: string
  user_id: string
  answer: string
  is_anonymous: boolean
  helpful_count: number
  is_verified: boolean
  status: 'published' | 'pending' | 'rejected' | 'hidden'
  created_at: string
  updated_at: string
}

export interface JobPostingFormData {
  title: string
  description: string
  company_id: string // Changed from company_name to company_id
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
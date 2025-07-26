export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          website: string | null
          location: string | null
          industry: string | null
          size: string | null
          founded_year: number | null
          created_at: string
          updated_at: string
          email_domain: string | null
          auto_approve_domain: boolean
          is_verified: boolean
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          location?: string | null
          industry?: string | null
          size?: string | null
          founded_year?: number | null
          created_at?: string
          updated_at?: string
          email_domain?: string | null
          auto_approve_domain?: boolean
          is_verified?: boolean
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          location?: string | null
          industry?: string | null
          size?: string | null
          founded_year?: number | null
          created_at?: string
          updated_at?: string
          email_domain?: string | null
          auto_approve_domain?: boolean
          is_verified?: boolean
          created_by?: string | null
        }
      }
      user_companies: {
        Row: {
          id: string
          user_id: string
          company_id: string // Can be text or uuid depending on existing companies table
          role: 'owner' | 'admin' | 'member'
          status: 'pending' | 'approved' | 'rejected'
          email_domain: string | null
          invited_by: string | null
          requested_at: string
          approved_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string // Can be text or uuid depending on existing companies table
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          email_domain?: string | null
          invited_by?: string | null
          requested_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string // Can be text or uuid depending on existing companies table
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'approved' | 'rejected'
          email_domain?: string | null
          invited_by?: string | null
          requested_at?: string
          approved_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      company_invitations: {
        Row: {
          id: string
          company_id: string // Can be text or uuid depending on existing companies table
          email: string
          role: 'admin' | 'member'
          invited_by: string
          token: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string // Can be text or uuid depending on existing companies table
          email: string
          role?: 'admin' | 'member'
          invited_by: string
          token: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string // Can be text or uuid depending on existing companies table
          email?: string
          role?: 'admin' | 'member'
          invited_by?: string
          token?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string
          company_id: string | null
          company_name: string
          location: string
          job_type: string[]
          remote_allowed: boolean
          salary_min: number | null
          salary_max: number | null
          salary_period: string | null
          salary_currency: string
          requirements: string | null
          benefits: string | null
          experience_level: string
          status: string
          is_featured: boolean
          is_sponsored: boolean
          easy_apply: boolean
          external_apply_url: string | null
          application_deadline: string | null
          contact_email: string | null
          company_website: string | null
          view_count: number
          application_count: number
          posted_date: string
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description: string
          company_id?: string | null
          company_name: string
          location: string
          job_type: string[]
          remote_allowed?: boolean
          salary_min?: number | null
          salary_max?: number | null
          salary_period?: string | null
          salary_currency?: string
          requirements?: string | null
          benefits?: string | null
          experience_level?: string
          status?: string
          is_featured?: boolean
          is_sponsored?: boolean
          easy_apply?: boolean
          external_apply_url?: string | null
          application_deadline?: string | null
          contact_email?: string | null
          company_website?: string | null
          view_count?: number
          application_count?: number
          posted_date?: string
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string
          company_id?: string | null
          company_name?: string
          location?: string
          job_type?: string[]
          remote_allowed?: boolean
          salary_min?: number | null
          salary_max?: number | null
          salary_period?: string | null
          salary_currency?: string
          requirements?: string | null
          benefits?: string | null
          experience_level?: string
          status?: string
          is_featured?: boolean
          is_sponsored?: boolean
          easy_apply?: boolean
          external_apply_url?: string | null
          application_deadline?: string | null
          contact_email?: string | null
          company_website?: string | null
          view_count?: number
          application_count?: number
          posted_date?: string
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_company_memberships: {
        Row: {
          user_id: string
          company_id: string
          company_name: string
          email_domain: string | null
          role: 'owner' | 'admin' | 'member'
          status: 'approved'
          approved_at: string | null
          created_at: string
          logo_url: string | null
          industry: string | null
          location: string | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Extended interfaces for application use
export interface Company {
  id: string
  name: string
  description?: string
  logo_url?: string
  website?: string
  location?: string
  industry?: string
  size?: string
  founded_year?: number
  email_domain?: string
  auto_approve_domain: boolean
  is_verified: boolean
  created_by?: string
  created_at: string
  updated_at: string
  // Legacy properties for backward compatibility
  total_reviews?: number
  average_rating?: number
  total_jobs?: number
  headquarters?: string
  company_size?: string
  slug?: string
}

export interface UserCompany {
  id: string
  user_id: string
  company_id: string
  role: 'owner' | 'admin' | 'member'
  status: 'pending' | 'approved' | 'rejected'
  email_domain?: string
  invited_by?: string
  requested_at: string
  approved_at?: string
  rejected_at?: string
  created_at: string
  updated_at: string
  company?: Company
}

export interface UserCompanyMembership {
  user_id: string
  company_id: string
  company_name: string
  email_domain?: string
  role: 'owner' | 'admin' | 'member'
  status: 'approved'
  approved_at?: string
  created_at: string
  logo_url?: string
  industry?: string
  location?: string
}

export interface CompanyInvitation {
  id: string
  company_id: string
  email: string
  role: 'admin' | 'member'
  invited_by: string
  token: string
  expires_at: string
  used_at?: string
  created_at: string
  company?: Company
}

export interface JobPosting {
  id: string
  employer_id: string
  title: string
  description: string
  company_id?: string
  company_name: string
  location: string
  job_type: string[]
  remote_allowed: boolean
  salary_min?: number
  salary_max?: number
  salary_period?: string
  salary_currency: string
  requirements?: string
  benefits?: string
  experience_level: string
  status: string
  is_featured: boolean
  is_sponsored: boolean
  easy_apply: boolean
  external_apply_url?: string
  application_deadline?: string
  contact_email?: string
  company_website?: string
  view_count: number
  application_count: number
  posted_date: string
  last_updated: string
  created_at: string
  updated_at: string
  company?: Company
}

// Form data interfaces
export interface CompanyFormData {
  name: string
  description?: string
  website?: string
  location?: string
  industry?: string
  size?: string
  founded_year?: number
  email_domain?: string
  auto_approve_domain?: boolean
}

export interface CompanyJoinRequest {
  company_id: string
  message?: string
}

// Multi-tenant context interfaces
export interface TenantContext {
  currentCompany?: UserCompanyMembership
  userCompanies: UserCompanyMembership[]
  switchCompany: (companyId: string) => Promise<void>
  switchToPersonal: () => void
  createCompany: (data: CompanyFormData) => Promise<Company>
  joinCompany: (request: CompanyJoinRequest) => Promise<UserCompany>
  leaveCompany: (companyId: string) => Promise<void>
  isLoading: boolean
}

// User context with multi-tenant support
export interface ExtendedUser {
  id: string
  email: string
  user_metadata?: {
    [key: string]: any
  }
  current_company_id?: string
  currentCompany?: UserCompanyMembership
  companies?: UserCompanyMembership[]
}

// Job search and filter interfaces remain the same
export interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  jobType: string[]
  postedDate: string
  featured?: boolean
  easy_apply?: boolean
  remote?: boolean
  description?: string
  requirements?: string
  benefits?: string
  companyWebsite?: string
}

export interface JobFilters {
  location?: string
  remote?: boolean
  minSalary?: number
  maxSalary?: number
  jobType?: string
  datePosted?: 'today' | '3days' | 'week' | 'month'
  companyId?: string // New: filter by specific company
}

export interface SupabaseJobFilters {
  location?: string
  remote?: boolean
  minSalary?: number
  maxSalary?: number
  jobType?: string
  datePosted?: 'today' | '3days' | 'week' | 'month'
  companyId?: string
}

export interface JobSearchResult {
  jobs: Job[]
  total: number
  hasMore: boolean
}

export interface JobPostingFormData {
  title: string
  description: string
  company_id?: string
  location: string
  job_type: string[]
  remote_allowed: boolean
  salary_min?: number
  salary_max?: number
  salary_period?: string
  salary_currency?: string
  requirements?: string
  benefits?: string
  experience_level: string
  easy_apply: boolean
  external_apply_url?: string
  application_deadline?: string
  contact_email?: string
  company_website?: string
}

export interface ApplicationFormData {
  cover_letter: string
  resume_url: string
  why_interested: string
}

export interface JobApplication {
  id: string
  user_id: string
  job_id: string
  status: 'applied' | 'reviewed' | 'interviewing' | 'rejected' | 'hired' | 'withdrawn'
  applied_date: string
  cover_letter?: string
  resume_url?: string
  job_title: string
  company_name: string
  job_location: string
  job_salary?: string
  job_type: string[]
  last_updated: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  job_titles?: string[]
  city?: string
  country?: string
  postcode?: string
  remote_work?: boolean
  minimum_pay?: number
  pay_period?: 'hour' | 'day' | 'week' | 'month' | 'year'
  onboarding_completed?: boolean
}

// Legacy interfaces for backward compatibility
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
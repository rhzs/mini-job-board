import { supabase } from './supabase'
import { JobPosting } from './database.types'

// Job filters interface
export interface JobFilters {
  query?: string
  location?: string
  salary?: { min: number, max: number }
  jobType?: string[]
  remote?: boolean
  company?: string
  datePosted?: 'today' | '3days' | 'week' | 'month'
  sortBy?: 'relevance' | 'date'
}

// Convert JobPosting to Job interface for compatibility with existing components  
export function convertJobPostingToJob(jobPosting: JobPosting & { company_slug?: string }) {
  return {
    id: jobPosting.id,
    title: jobPosting.title,
    company: jobPosting.company_name || 'Unknown Company',
    company_id: jobPosting.company_id,
    company_slug: jobPosting.company_slug,
    location: jobPosting.location,
    salary: jobPosting.salary_min && jobPosting.salary_max ? {
      min: jobPosting.salary_min,
      max: jobPosting.salary_max,
      period: (jobPosting.salary_period as 'hour' | 'day' | 'week' | 'month' | 'year') || 'month',
      currency: jobPosting.salary_currency || 'S$'
    } : undefined,
    jobType: jobPosting.job_type || [],
    remote: Boolean(jobPosting.remote_allowed),
    description: jobPosting.description,
    requirements: Array.isArray(jobPosting.requirements) 
      ? jobPosting.requirements 
      : jobPosting.requirements 
        ? [jobPosting.requirements] 
        : [],
    benefits: Array.isArray(jobPosting.benefits) 
      ? jobPosting.benefits 
      : jobPosting.benefits 
        ? [jobPosting.benefits] 
        : [],
    postedDate: jobPosting.posted_date,
    easy_apply: jobPosting.easy_apply,
    easyApply: jobPosting.easy_apply,
    responseRate: undefined, // Not in database schema
    isUrgent: jobPosting.is_featured || false,
    companyRating: undefined, // Not in database schema
    logo: undefined // Not in database schema
  }
}

// Job search result interface
export interface JobSearchResult {
  jobs: JobPosting[]
  total: number
  error?: string
}

// Fetch all active jobs with optional filters
export async function fetchJobs(filters: JobFilters = {}): Promise<JobSearchResult> {
  try {
    console.log('🔍 fetchJobs called with filters:', filters)
    
    let query = supabase
      .from('job_postings')
      .select('*')
      .eq('status', 'active')
      .order('posted_date', { ascending: false })

    // Apply search query filter
    if (filters.query && filters.query.trim()) {
      const searchQuery = filters.query.trim()
      console.log('📝 Applying search filter:', searchQuery)
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    // Apply location filter
    if (filters.location && filters.location.trim() && filters.location.toLowerCase() !== 'singapore') {
      console.log('📍 Applying location filter:', filters.location)
      query = query.ilike('location', `%${filters.location}%`)
    }

    // Apply remote filter
    if (filters.remote !== undefined) {
      console.log('🏠 Applying remote filter:', filters.remote)
      query = query.eq('remote_allowed', filters.remote)
    }

    // Apply salary filter (convert to monthly for comparison)
    if (filters.salary) {
      console.log('💰 Applying salary filter:', filters.salary)
      // For now, assume all salaries in database are monthly
      query = query
        .gte('salary_min', filters.salary.min)
        .lte('salary_max', filters.salary.max)
    }

    // Apply job type filter
    if (filters.jobType && filters.jobType.length > 0) {
      console.log('💼 Applying job type filter:', filters.jobType)
      query = query.overlaps('job_type', filters.jobType)
    }

    // Apply company filter using company name
    if (filters.company && filters.company.trim()) {
      console.log('🏢 Applying company filter:', filters.company)
      query = query.ilike('company_name', `%${filters.company}%`)
    }

    // Apply date posted filter
    if (filters.datePosted) {
      console.log('📅 Applying date filter:', filters.datePosted)
      const now = new Date()
      let dateThreshold: Date
      
      switch (filters.datePosted) {
        case 'today':
          dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          break
        case '3days':  // Added support for 3 days
          dateThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
          break
        case 'week':
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          dateThreshold = new Date(0) // No filter
      }
      
      if (dateThreshold.getTime() > 0) {
        console.log('📅 Date threshold:', dateThreshold.toISOString())
        query = query.gte('posted_date', dateThreshold.toISOString())
      }
    }

    const { data, error, count } = await query.limit(100) // Limit to 100 results

    if (error) {
      console.error('❌ Error fetching jobs:', error)
      return { jobs: [], total: 0, error: error.message }
    }

    console.log('✅ Successfully fetched', data?.length || 0, 'jobs')
    
    // Fetch company names for all unique company IDs in one query
    const uniqueCompanyIds = Array.from(new Set(data?.map(job => job.company_id).filter(Boolean)))
    const companySlugMap = new Map()
    
    if (uniqueCompanyIds.length > 0) {
      try {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', uniqueCompanyIds)
        
        companies?.forEach(company => {
          // Generate slug from company name
          const slug = company.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
          companySlugMap.set(company.id, slug)
        })
      } catch (error) {
        console.warn('Could not fetch company names:', error)
      }
    }
    
    // Add company slugs to job data
    const jobsWithCompanySlugs = data?.map(job => ({
      ...job,
      company_slug: job.company_id ? companySlugMap.get(job.company_id) : undefined
    })) || []
    
    return {
      jobs: jobsWithCompanySlugs,
      total: count || (jobsWithCompanySlugs.length || 0)
    }
  } catch (error) {
    console.error('❌ Error fetching jobs:', error)
    return { jobs: [], total: 0, error: 'Failed to fetch jobs' }
  }
}

// Fetch a single job by ID
export async function fetchJobById(id: string): Promise<JobPosting | null> {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching job:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}

// Fetch multiple jobs by their IDs
export async function fetchJobsByIds(ids: string[]): Promise<JobPosting[]> {
  if (ids.length === 0) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .in('id', ids)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return []
  }
}

// Increment view count for a job
export async function incrementJobViewCount(jobId: string): Promise<void> {
  try {
    // First get current view count
    const { data } = await supabase
      .from('job_postings')
      .select('view_count')
      .eq('id', jobId)
      .single()
    
    if (data) {
      await supabase
        .from('job_postings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', jobId)
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
}

// Get recommended jobs for a user based on preferences
export async function fetchRecommendedJobs(userId: string, limit: number = 6): Promise<JobPosting[]> {
  try {
    // First get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (prefError || !preferences) {
      // If no preferences, return recent jobs
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'active')
        .order('posted_date', { ascending: false })
        .limit(limit)

      return data || []
    }

    // Build query based on preferences
    let query = supabase
      .from('job_postings')
      .select('*')
      .eq('status', 'active')

    // Filter by job titles if available
    if (preferences.job_titles && preferences.job_titles.length > 0) {
      const titleFilters = preferences.job_titles
        .map((title: string) => `title.ilike.%${title}%`)
        .join(',')
      query = query.or(titleFilters)
    }

    // Filter by location if specified
    if (preferences.city) {
      query = query.ilike('location', `%${preferences.city}%`)
    }

    // Filter by remote work preference
    if (preferences.remote_work) {
      query = query.eq('remote_allowed', true)
    }

    // Filter by minimum salary if specified
    if (preferences.minimum_pay) {
      query = query.gte('salary_min', preferences.minimum_pay)
    }

    const { data, error } = await query
      .order('posted_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recommended jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching recommended jobs:', error)
    return []
  }
} 
import { supabase } from './supabase'
import { Company, CompanyReview, CompanySalary, CompanyQuestion, CompanyAnswer } from './database.types'

export interface CompanyFilters {
  query?: string
  industry?: string
  company_size?: string
  location?: string
  min_rating?: number
  has_reviews?: boolean
}

export interface CompanySearchResult {
  companies: Company[]
  total: number
  error?: string
}

// Fetch companies with optional filters
export async function fetchCompanies(filters: CompanyFilters = {}): Promise<CompanySearchResult> {
  try {
    let query = supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('total_reviews', { ascending: false })

    // Apply search query filter
    if (filters.query && filters.query.trim()) {
      const searchQuery = filters.query.trim()
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    // Apply industry filter
    if (filters.industry && filters.industry.trim()) {
      query = query.eq('industry', filters.industry)
    }

    // Apply company size filter
    if (filters.company_size && filters.company_size.trim()) {
      query = query.eq('company_size', filters.company_size)
    }

    // Apply location filter
    if (filters.location && filters.location.trim()) {
      query = query.ilike('headquarters', `%${filters.location}%`)
    }

    // Apply minimum rating filter
    if (filters.min_rating && filters.min_rating > 0) {
      query = query.gte('average_rating', filters.min_rating)
    }

    // Apply has reviews filter
    if (filters.has_reviews) {
      query = query.gt('total_reviews', 0)
    }

    const { data, error, count } = await query.limit(50)

    if (error) {
      console.error('Error fetching companies:', error)
      return { companies: [], total: 0, error: error.message }
    }

    return {
      companies: data || [],
      total: count || (data?.length || 0)
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    return { companies: [], total: 0, error: 'Failed to fetch companies' }
  }
}

// Fetch a single company by slug
export async function fetchCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching company:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

// Fetch company reviews
export async function fetchCompanyReviews(
  companyId: string, 
  limit: number = 20, 
  offset: number = 0
): Promise<CompanyReview[]> {
  try {
    const { data, error } = await supabase
      .from('company_reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching company reviews:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching company reviews:', error)
    return []
  }
}

// Fetch company salaries
export async function fetchCompanySalaries(
  companyId: string,
  jobTitle?: string,
  limit: number = 50
): Promise<CompanySalary[]> {
  try {
    let query = supabase
      .from('company_salaries')
      .select('*')
      .eq('company_id', companyId)
      .order('total_compensation', { ascending: false })
      .limit(limit)

    if (jobTitle && jobTitle.trim()) {
      query = query.ilike('job_title', `%${jobTitle}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching company salaries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching company salaries:', error)
    return []
  }
}

// Fetch company questions
export async function fetchCompanyQuestions(
  companyId: string,
  limit: number = 20
): Promise<CompanyQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('company_questions')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'published')
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching company questions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching company questions:', error)
    return []
  }
}

// Fetch company jobs
export async function fetchCompanyJobs(companyId: string, limit: number = 20) {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('posted_date', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching company jobs:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching company jobs:', error)
    return []
  }
}

// Submit a company review
export async function submitCompanyReview(review: Partial<CompanyReview>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('company_reviews')
      .upsert([review])

    if (error) {
      console.error('Error submitting review:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting review:', error)
    return { success: false, error: 'Failed to submit review' }
  }
}

// Submit salary information
export async function submitSalaryInfo(salary: Partial<CompanySalary>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('company_salaries')
      .insert([salary])

    if (error) {
      console.error('Error submitting salary:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting salary:', error)
    return { success: false, error: 'Failed to submit salary information' }
  }
}

// Submit a question
export async function submitQuestion(question: Partial<CompanyQuestion>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('company_questions')
      .insert([question])

    if (error) {
      console.error('Error submitting question:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting question:', error)
    return { success: false, error: 'Failed to submit question' }
  }
}

// Get company statistics
export async function getCompanyStats(companyId: string) {
  try {
    // Get review statistics
    const { data: reviewStats } = await supabase
      .from('company_reviews')
      .select('rating, work_life_balance, compensation_benefits, job_security, management, culture')
      .eq('company_id', companyId)
      .eq('status', 'published')

    // Get salary statistics
    const { data: salaryStats } = await supabase
      .from('company_salaries')
      .select('total_compensation, job_title, job_level')
      .eq('company_id', companyId)

    // Calculate averages
    const reviewCount = reviewStats?.length || 0
    const avgRating = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + r.rating, 0) || 0) / reviewCount 
      : 0

    const avgWorkLife = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + (r.work_life_balance || 0), 0) || 0) / reviewCount 
      : 0

    const avgCompensation = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + (r.compensation_benefits || 0), 0) || 0) / reviewCount 
      : 0

    const avgJobSecurity = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + (r.job_security || 0), 0) || 0) / reviewCount 
      : 0

    const avgManagement = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + (r.management || 0), 0) || 0) / reviewCount 
      : 0

    const avgCulture = reviewCount > 0 
      ? (reviewStats?.reduce((sum, r) => sum + (r.culture || 0), 0) || 0) / reviewCount 
      : 0

    // Salary statistics
    const salaryCount = salaryStats?.length || 0
    const avgSalary = salaryCount > 0 
      ? (salaryStats?.reduce((sum, s) => sum + s.total_compensation, 0) || 0) / salaryCount 
      : 0

    const salaryRange = salaryCount > 0 ? {
      min: Math.min(...(salaryStats?.map(s => s.total_compensation) || [])),
      max: Math.max(...(salaryStats?.map(s => s.total_compensation) || []))
    } : null

    return {
      reviewCount,
      avgRating: Math.round(avgRating * 10) / 10,
      avgWorkLife: Math.round(avgWorkLife * 10) / 10,
      avgCompensation: Math.round(avgCompensation * 10) / 10,
      avgJobSecurity: Math.round(avgJobSecurity * 10) / 10,
      avgManagement: Math.round(avgManagement * 10) / 10,
      avgCulture: Math.round(avgCulture * 10) / 10,
      salaryCount,
      avgSalary: Math.round(avgSalary),
      salaryRange
    }
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return null
  }
}

// Get popular companies (featured or most reviewed)
export async function getPopularCompanies(limit: number = 9): Promise<Company[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('total_reviews', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching popular companies:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching popular companies:', error)
    return []
  }
}

// Search companies by name (for autocomplete)
export async function searchCompanies(query: string, limit: number = 10): Promise<Pick<Company, 'id' | 'name' | 'slug' | 'logo_url' | 'industry'>[]> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url, industry')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .order('total_reviews', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error searching companies:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching companies:', error)
    return []
  }
} 
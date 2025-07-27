import {
  convertJobPostingToJob,
  fetchJobs,
  fetchJobById,
  incrementJobViewCount,
  fetchRecommendedJobs,
  JobFilters,
} from '@/lib/supabase-jobs'
import { JobPosting } from '@/lib/database.types'

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
    })),
  },
}))

describe('lib/supabase-jobs.ts', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = require('@/lib/supabase').supabase
    jest.clearAllMocks()
  })

  describe('convertJobPostingToJob', () => {
    it('should convert basic job posting to job format', () => {
      const jobPosting = {
        id: 'job-1',
        employer_id: 'emp-1',
        title: 'Software Engineer',
        description: 'Test description',
        company_name: 'Test Company',
        company_id: 'company-1',
        location: 'Singapore',
        job_type: ['Full-time'],
        remote_allowed: true,
        salary_min: 5000,
        salary_max: 8000,
        salary_period: 'month',
        salary_currency: 'S$',
        requirements: 'JavaScript, React',
        benefits: 'Health insurance',
        experience_level: 'Mid-level',
        status: 'active',
        is_featured: false,
        is_sponsored: false,
        easy_apply: true,
        view_count: 0,
        application_count: 0,
        posted_date: '2024-01-01',
        last_updated: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        company_slug: 'test-company',
      } as JobPosting & { company_slug?: string }

      const result = convertJobPostingToJob(jobPosting)

      expect(result).toMatchObject({
        id: 'job-1',
        title: 'Software Engineer',
        company: 'Test Company',
        company_id: 'company-1',
        company_slug: 'test-company',
        location: 'Singapore',
        remote: true,
        easyApply: true,
      })
      expect(result.requirements).toEqual(['JavaScript, React'])
      expect(result.benefits).toEqual(['Health insurance'])
    })

    it('should handle missing company_name', () => {
      const jobPosting = {
        id: 'job-1',
        company_name: null,
        salary_currency: 'S$',
        experience_level: 'Mid-level',
        status: 'active',
        is_featured: false,
        is_sponsored: false,
        easy_apply: false,
        view_count: 0,
        application_count: 0,
      } as any

      const result = convertJobPostingToJob(jobPosting)
      expect(result.company).toBe('Unknown Company')
    })

    it('should handle null requirements and benefits', () => {
      const jobPosting = {
        requirements: null,
        benefits: undefined,
        salary_currency: 'S$',
      } as any

      const result = convertJobPostingToJob(jobPosting)
      expect(result.requirements).toEqual([])
      expect(result.benefits).toEqual([])
    })
  })

  describe('fetchJobs', () => {
    it('should fetch jobs with default filters', async () => {
      const mockJobs = [{ id: 'job-1', company_id: 'company-1' }]
      const mockCompanies = [{ id: 'company-1', slug: 'test-company' }]

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'job_postings') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: mockJobs,
              error: null,
              count: 1,
            }),
          }
        } else if (table === 'companies') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
              data: mockCompanies,
              error: null,
            }),
          }
        }
        return { select: jest.fn().mockReturnThis() }
      })

      const result = await fetchJobs()
      expect(result.jobs).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
          count: 0,
        }),
      }))

      const result = await fetchJobs()
      expect(result.jobs).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('fetchJobById', () => {
    it('should fetch job successfully', async () => {
      const mockJob = { id: 'job-1', title: 'Engineer' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockJob,
          error: null,
        }),
      })

      const result = await fetchJobById('job-1')
      expect(result).toEqual(mockJob)
    })

    it('should return null on error', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      })

      const result = await fetchJobById('job-1')
      expect(result).toBeNull()
    })
  })

  describe('incrementJobViewCount', () => {
    it('should increment view count', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      await expect(incrementJobViewCount('job-1')).resolves.not.toThrow()
    })

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: new Error('DB error'),
        }),
      })

      await expect(incrementJobViewCount('job-1')).resolves.not.toThrow()
    })
  })

  describe('fetchRecommendedJobs', () => {
    it('should fetch recommended jobs', async () => {
      const mockJobs = [{ id: 'job-1' }]

      // Mock user preferences query first
      const mockPreferencesQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null, // No preferences, should fall back to recent jobs
          error: { code: 'PGRST116' } // Not found error
        })
      }

      // Mock job postings query
      const mockJobsQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockJobs,
          error: null,
        }),
      }

      // Mock calls in order: first for user_preferences, then for job_postings
      mockSupabase.from
        .mockReturnValueOnce(mockPreferencesQuery)
        .mockReturnValueOnce(mockJobsQuery)

      const result = await fetchRecommendedJobs('user-1')
      expect(result).toEqual(mockJobs)
    })

    it('should handle errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('DB error'),
        }),
      })

      const result = await fetchRecommendedJobs('user-1')
      expect(result).toEqual([])
    })
  })
}) 
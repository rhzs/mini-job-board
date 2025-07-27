import {
  fetchCompanies,
  fetchCompanyBySlug,
  fetchCompanyReviews,
  fetchCompanySalaries,
  fetchCompanyQuestions,
  fetchCompanyQuestionsWithAnswers,
  fetchCompanyJobs,
  submitCompanyReview,
  submitSalaryInfo,
  submitQuestion,
  getCompanyStats,
  getPopularCompanies,
  searchCompanies,
} from '@/lib/supabase-companies'

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
      insert: jest.fn().mockReturnThis(),
      throwOnError: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    })),
  },
}))

describe('lib/supabase-companies.ts', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = require('@/lib/supabase').supabase
    jest.clearAllMocks()
  })

  describe('fetchCompanies', () => {
    it('should fetch companies with default filters', async () => {
      const mockCompanies = [
        { id: '1', name: 'Test Company', slug: 'test-company' },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
          count: 1,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await fetchCompanies()

      expect(result.companies).toEqual(mockCompanies)
      expect(result.total).toBe(1)
      expect(mockSupabase.from).toHaveBeenCalledWith('companies')
    })

    it('should apply search filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await fetchCompanies({ query: 'tech' })

      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%tech%,description.ilike.%tech%')
    })

    it('should apply industry filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await fetchCompanies({ industry: 'Technology' })

      expect(mockQuery.eq).toHaveBeenCalledWith('industry', 'Technology')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
          count: 0,
        }),
      })

      const result = await fetchCompanies()

      expect(result.companies).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('fetchCompanyBySlug', () => {
    it('should fetch company by slug successfully', async () => {
      const mockCompany = {
        id: '1',
        name: 'Test Company',
        slug: 'test-company',
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCompany,
          error: null,
        }),
      })

      const result = await fetchCompanyBySlug('test-company')

      expect(result).toEqual(mockCompany)
      expect(mockSupabase.from).toHaveBeenCalledWith('companies')
    })

    it('should return null when company not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Not found'),
        }),
      })

      const result = await fetchCompanyBySlug('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('fetchCompanyReviews', () => {
    it('should fetch company reviews successfully', async () => {
      const mockReviews = [
        { id: '1', company_id: 'comp-1', rating: 5 },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockReviews,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await fetchCompanyReviews('comp-1')

      expect(result).toEqual(mockReviews)
      expect(mockSupabase.from).toHaveBeenCalledWith('company_reviews')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await fetchCompanyReviews('comp-1')

      expect(result).toEqual([])
    })
  })

  describe('fetchCompanySalaries', () => {
    it('should fetch company salaries successfully', async () => {
      const mockSalaries = [
        { id: '1', company_id: 'comp-1', salary: 50000 },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockSalaries,
          error: null,
        }),
      })

      const result = await fetchCompanySalaries('comp-1')

      expect(result).toEqual(mockSalaries)
      expect(mockSupabase.from).toHaveBeenCalledWith('company_salaries')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await fetchCompanySalaries('comp-1')

      expect(result).toEqual([])
    })
  })

  describe('fetchCompanyQuestions', () => {
    it('should fetch company questions successfully', async () => {
      const mockQuestions = [
        { id: '1', company_id: 'comp-1', question: 'How is the culture?' },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockQuestions,
          error: null,
        }),
      })

      const result = await fetchCompanyQuestions('comp-1')

      expect(result).toEqual(mockQuestions)
      expect(mockSupabase.from).toHaveBeenCalledWith('company_questions')
    })
  })

  describe('fetchCompanyQuestionsWithAnswers', () => {
    it('should fetch questions with answers successfully', async () => {
      const mockQuestions = [
        { id: '1', company_id: 'comp-1', question: 'How is the culture?' },
      ]
      
      const mockAnswers = [
        { id: '1', question_id: '1', answer: 'Great!' },
      ]

      // Set up mock to handle two different table calls
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'company_questions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: mockQuestions,
              error: null,
            }),
          }
        } else if (table === 'company_answers') {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
        }
      })

      // Mock the answers query chain
      const answersQuery = mockSupabase.from('company_answers')
      answersQuery.order.mockResolvedValue({
        data: mockAnswers,
        error: null,
      })

      const result = await fetchCompanyQuestionsWithAnswers('comp-1')

      expect(result).toEqual([
        {
          id: '1',
          company_id: 'comp-1',
          question: 'How is the culture?',
          answers: [{ id: '1', question_id: '1', answer: 'Great!' }],
        },
      ])
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await fetchCompanyQuestionsWithAnswers('comp-1')

      expect(result).toEqual([])
    })
  })

  describe('fetchCompanyJobs', () => {
    it('should fetch company jobs successfully', async () => {
      const mockJobs = [
        { id: '1', company_id: 'comp-1', title: 'Engineer' },
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockJobs,
          error: null,
        }),
      })

      const result = await fetchCompanyJobs('comp-1')

      expect(result).toEqual(mockJobs)
      expect(mockSupabase.from).toHaveBeenCalledWith('job_postings')
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await fetchCompanyJobs('comp-1')

      expect(result).toEqual([])
    })
  })

  describe('submitCompanyReview', () => {
    it('should submit review successfully', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const reviewData = {
        company_id: 'comp-1',
        rating: 5,
        title: 'Great company',
        review: 'Love working here',
      }

      const result = await submitCompanyReview(reviewData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle submission errors', async () => {
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      })

      const result = await submitCompanyReview({})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('submitSalaryInfo', () => {
    it('should submit salary info successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const salaryData = {
        company_id: 'comp-1',
        job_title: 'Engineer',
        salary: 50000,
      }

      const result = await submitSalaryInfo(salaryData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle submission errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      })

      const result = await submitSalaryInfo({})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('submitQuestion', () => {
    it('should submit question successfully', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const questionData = {
        company_id: 'comp-1',
        question: 'How is the work-life balance?',
      }

      const result = await submitQuestion(questionData)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle submission errors', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      })

      const result = await submitQuestion({})

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database error')
    })
  })

  describe('getCompanyStats', () => {
    it('should get company stats successfully', async () => {
      const mockReviewStats = [
        { rating: 4, work_life_balance: 4, compensation_benefits: 5, job_security: 4, management: 3, culture: 5 },
        { rating: 5, work_life_balance: 5, compensation_benefits: 4, job_security: 5, management: 4, culture: 4 },
      ]
      
      const mockSalaryStats = [
        { total_compensation: 50000, job_title: 'Engineer', job_level: 'Junior' },
        { total_compensation: 60000, job_title: 'Engineer', job_level: 'Mid' },
        { total_compensation: 70000, job_title: 'Engineer', job_level: 'Senior' },
        { total_compensation: 80000, job_title: 'Manager', job_level: 'Senior' },
        { total_compensation: 90000, job_title: 'Director', job_level: 'Executive' },
        { total_compensation: 100000, job_title: 'VP', job_level: 'Executive' },
        { total_compensation: 110000, job_title: 'CTO', job_level: 'C-Level' },
        { total_compensation: 120000, job_title: 'CEO', job_level: 'C-Level' },
      ]

      // Set up mock to handle two different table calls
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'company_reviews') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          }
        } else if (table === 'company_salaries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          }
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        }
      })

      // Mock the first call for reviews
      const reviewsQuery = mockSupabase.from('company_reviews')
      reviewsQuery.eq.mockResolvedValue({
        data: mockReviewStats,
        error: null,
      })

      // Mock the second call for salaries  
      const salariesQuery = mockSupabase.from('company_salaries')
      salariesQuery.eq.mockResolvedValue({
        data: mockSalaryStats,
        error: null,
      })

      const result = await getCompanyStats('comp-1')

      expect(result?.reviewCount).toBe(2)
      expect(result?.avgRating).toBe(4.5)
      expect(result?.salaryCount).toBe(8)
    })

    it('should handle errors in stats calculation', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      }))

      const result = await getCompanyStats('comp-1')

      expect(result).toBeNull()
    })
  })

  describe('getPopularCompanies', () => {
    it('should get popular companies successfully', async () => {
      const mockCompanies = [
        { id: '1', name: 'Popular Company' },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await getPopularCompanies(5)

      expect(result).toEqual(mockCompanies)
      expect(mockSupabase.from).toHaveBeenCalledWith('companies')
      expect(mockQuery.limit).toHaveBeenCalledWith(5)
    })

    it('should use default limit when not provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await getPopularCompanies()

      expect(mockQuery.limit).toHaveBeenCalledWith(9)
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await getPopularCompanies()

      expect(result).toEqual([])
    })
  })

  describe('searchCompanies', () => {
    it('should search companies successfully', async () => {
      const mockCompanies = [
        { id: '1', name: 'Tech Company', slug: 'tech-company' },
      ]

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: mockCompanies,
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await searchCompanies('tech')

      expect(result).toEqual(mockCompanies)
      expect(mockSupabase.from).toHaveBeenCalledWith('companies')
      expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%tech%')
    })

    it('should use default limit when not provided', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      }

      mockSupabase.from.mockReturnValue(mockQuery)

      await searchCompanies('test')

      expect(mockQuery.limit).toHaveBeenCalledWith(10)
    })

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      })

      const result = await searchCompanies('test')

      expect(result).toEqual([])
    })
  })
}) 
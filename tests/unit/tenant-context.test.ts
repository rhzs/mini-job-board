import {
  getCompanyMembership,
  searchCompanies,
  getCompanyPendingRequests,
  approveCompanyMember,
  rejectCompanyMember,
} from '@/lib/tenant-context'

// Mock Supabase
const createMockQuery = () => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
})

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => createMockQuery()),
    auth: {
      getUser: jest.fn(),
    }
  }
}))

// Import the mocked supabase after setting up the mock
const { supabase } = require('@/lib/supabase')

describe('lib/tenant-context.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCompanyMembership', () => {
    it('should fetch company membership successfully', async () => {
      const mockMembership = {
        id: 'membership-1',
        user_id: 'user-1',
        company_id: 'company-1',
        role: 'admin',
        status: 'approved'
      }

      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: mockMembership,
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await getCompanyMembership('user-1', 'company-1')

      expect(result).toEqual(mockMembership)
      expect(supabase.from).toHaveBeenCalledWith('user_companies')
    })

    it('should return null when membership not found (PGRST116)', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await getCompanyMembership('user-1', 'company-1')

      expect(result).toBeNull()
    })

    it('should throw error for database errors other than not found', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' }
      })
      supabase.from.mockReturnValue(mockQuery)

      await expect(getCompanyMembership('user-1', 'company-1')).rejects.toEqual({
        code: 'OTHER_ERROR',
        message: 'Database error'
      })
    })
  })

  describe('searchCompanies', () => {
    it('should search companies successfully', async () => {
      const mockCompanies = [
        {
          id: 'company-1',
          name: 'Tech Corp',
          slug: 'tech-corp',
          logo_url: 'logo.png'
        }
      ]

      const mockQuery = createMockQuery()
      mockQuery.limit.mockResolvedValue({
        data: mockCompanies,
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await searchCompanies('tech')

      expect(result).toEqual(mockCompanies)
      expect(supabase.from).toHaveBeenCalledWith('companies')
      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%tech%,description.ilike.%tech%')
      expect(mockQuery.eq).toHaveBeenCalledWith('is_verified', true)
    })

    it('should use default limit when not provided', async () => {
      const mockQuery = createMockQuery()
      mockQuery.limit.mockResolvedValue({
        data: [],
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      await searchCompanies('test')

      expect(mockQuery.limit).toHaveBeenCalledWith(10)
    })

    it('should use custom limit when provided', async () => {
      const mockQuery = createMockQuery()
      mockQuery.limit.mockResolvedValue({
        data: [],
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      await searchCompanies('test', 5)

      expect(mockQuery.limit).toHaveBeenCalledWith(5)
    })

    it('should throw error on search failure', async () => {
      const mockQuery = createMockQuery()
      mockQuery.limit.mockResolvedValue({
        data: null,
        error: new Error('Search error')
      })
      supabase.from.mockReturnValue(mockQuery)

      await expect(searchCompanies('tech')).rejects.toThrow('Search error')
    })
  })

  describe('getCompanyPendingRequests', () => {
    it('should fetch pending requests successfully', async () => {
      const mockRequests = [
        {
          id: 'request-1',
          user_id: 'user-1',
          company_id: 'company-1',
          status: 'pending'
        }
      ]

      const mockQuery = createMockQuery()
      mockQuery.order.mockResolvedValue({
        data: mockRequests,
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await getCompanyPendingRequests('company-1')

      expect(result).toEqual(mockRequests)
      expect(supabase.from).toHaveBeenCalledWith('user_companies')
      expect(mockQuery.eq).toHaveBeenCalledWith('company_id', 'company-1')
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'pending')
    })

    it('should throw error on fetch failure', async () => {
      const mockQuery = createMockQuery()
      mockQuery.order.mockResolvedValue({
        data: null,
        error: new Error('Fetch error')
      })
      supabase.from.mockReturnValue(mockQuery)

      await expect(getCompanyPendingRequests('company-1')).rejects.toThrow('Fetch error')
    })
  })

  describe('approveCompanyMember', () => {
    it('should approve member successfully', async () => {
      const mockMembership = { id: 'membership-1', status: 'approved' }
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: mockMembership,
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await approveCompanyMember('membership-1')

      expect(result).toEqual(mockMembership)
      expect(supabase.from).toHaveBeenCalledWith('user_companies')
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'approved',
        approved_at: expect.any(String)
      })
    })

    it('should handle approval errors', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Approval error')
      })
      supabase.from.mockReturnValue(mockQuery)

      await expect(approveCompanyMember('membership-1')).rejects.toThrow('Approval error')
    })
  })

  describe('rejectCompanyMember', () => {
    it('should reject member successfully', async () => {
      const mockMembership = { id: 'membership-1', status: 'rejected' }
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: mockMembership,
        error: null
      })
      supabase.from.mockReturnValue(mockQuery)

      const result = await rejectCompanyMember('membership-1')

      expect(result).toEqual(mockMembership)
      expect(supabase.from).toHaveBeenCalledWith('user_companies')
      expect(mockQuery.update).toHaveBeenCalledWith({
        status: 'rejected',
        rejected_at: expect.any(String)
      })
    })

    it('should handle rejection errors', async () => {
      const mockQuery = createMockQuery()
      mockQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Rejection error')
      })
      supabase.from.mockReturnValue(mockQuery)

      await expect(rejectCompanyMember('membership-1')).rejects.toThrow('Rejection error')
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      supabase.from.mockImplementation(() => {
        throw new Error('Network error')
      })

      await expect(getCompanyMembership('user-1', 'company-1')).rejects.toThrow('Network error')
      await expect(searchCompanies('test')).rejects.toThrow('Network error')
      await expect(getCompanyPendingRequests('company-1')).rejects.toThrow('Network error')
    })
  })
}) 
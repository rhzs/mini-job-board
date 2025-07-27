import {
  calculateJobMatch,
  JobMatchScore
} from '@/lib/job-matching'
import { UserPreferences, Job } from '@/lib/database.types'

// Mock job data for testing
const mockJob: Job = {
  id: 'job-1',
  title: 'Senior Software Engineer',
  company: 'Tech Corp',
  location: 'Singapore',
  salary: {
    min: 5000,
    max: 8000,
    period: 'month' as const,
    currency: 'S$'
  },
  jobType: ['Full-time'],
  remote: false,
  description: 'Senior software engineer position',
  requirements: ['JavaScript', 'React', 'Node.js'],
  benefits: ['Health insurance', 'Remote work'],
  postedDate: '2024-01-01',
  easyApply: true,
}

const mockUserPreferences: UserPreferences = {
  job_titles: ['Software Engineer', 'Developer'],
  city: 'Singapore',
  country: 'Singapore',
  remote_work: false,
  minimum_pay: 4000,
  pay_period: 'month'
}

describe('lib/job-matching.ts', () => {
  describe('calculateJobMatch', () => {
    it('should calculate job match correctly for exact title match', () => {
      const job = { ...mockJob, title: 'Software Engineer' }
      const preferences = { ...mockUserPreferences }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.job).toEqual(job)
      expect(result.score).toBeGreaterThan(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(Array.isArray(result.matchReasons)).toBe(true)
    })

    it('should calculate job match for partial title match', () => {
      const job = { ...mockJob, title: 'Junior Developer' }
      const preferences = { ...mockUserPreferences }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThan(0)
      expect(result.matchReasons.length).toBeGreaterThan(0)
    })

    it('should handle null preferences', () => {
      const job = { ...mockJob }
      
      const result = calculateJobMatch(job, null)
      
      expect(result).toBeDefined()
      expect(result.job).toEqual(job)
      expect(result.score).toBe(0.5) // Neutral score
      expect(result.matchReasons).toEqual([])
    })

    it('should handle job with matching location', () => {
      const job = { ...mockJob, location: 'Singapore CBD' }
      const preferences = { ...mockUserPreferences, city: 'Singapore' }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result.score).toBeGreaterThan(0)
      expect(result.matchReasons.some(reason => 
        reason.toLowerCase().includes('location') || 
        reason.toLowerCase().includes('area')
      )).toBe(true)
    })

    it('should handle remote work preferences', () => {
      const job = { ...mockJob, remote: true }
      const preferences = { ...mockUserPreferences, remote_work: true }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result.score).toBeGreaterThan(0)
      expect(result.matchReasons.some(reason => 
        reason.toLowerCase().includes('remote')
      )).toBe(true)
    })

    it('should handle salary preferences', () => {
      const job = { 
        ...mockJob, 
        salary: { min: 5000, max: 7000, period: 'month' as const, currency: 'S$' }
      }
      const preferences = { 
        ...mockUserPreferences, 
        minimum_pay: 4000,
        pay_period: 'month' as const
      }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('should handle job type preferences', () => {
      const job = { ...mockJob, jobType: ['Full-time'] }
      const preferences = { ...mockUserPreferences }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThan(0)
    })

    it('should return JobMatchScore with correct structure', () => {
      const job = { ...mockJob }
      const preferences = { ...mockUserPreferences }
      
      const result: JobMatchScore = calculateJobMatch(job, preferences)
      
      expect(result).toHaveProperty('job')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('matchReasons')
      expect(typeof result.score).toBe('number')
      expect(Array.isArray(result.matchReasons)).toBe(true)
    })

    it('should handle empty preferences gracefully', () => {
      const job = { ...mockJob }
      const preferences: UserPreferences = {}
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(Array.isArray(result.matchReasons)).toBe(true)
    })

    it('should handle job with missing salary information', () => {
      const job = { ...mockJob, salary: undefined }
      const preferences = { ...mockUserPreferences }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('should provide meaningful match reasons', () => {
      const job = { 
        ...mockJob, 
        title: 'Software Engineer',
        location: 'Singapore',
        remote: true,
        jobType: ['Full-time']
      }
      const preferences = { 
        ...mockUserPreferences,
        job_titles: ['Software Engineer'],
        city: 'Singapore',
        remote_work: true
      }
      
      const result = calculateJobMatch(job, preferences)
      
      expect(result.matchReasons.length).toBeGreaterThan(0)
      result.matchReasons.forEach(reason => {
        expect(typeof reason).toBe('string')
        expect(reason.length).toBeGreaterThan(0)
      })
    })
  })
}) 
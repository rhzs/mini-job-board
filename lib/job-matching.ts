import { Job } from './database.types'
import { UserPreferences } from './database.types'

export interface JobMatchScore {
  job: Job
  score: number
  matchReasons: string[]
}

export function calculateJobMatch(job: Job, preferences: UserPreferences | null): JobMatchScore {
  if (!preferences) {
    return {
      job,
      score: 0.5, // Neutral score for users without preferences
      matchReasons: []
    }
  }

  let score = 0
  const matchReasons: string[] = []
  const maxScore = 100

  // Job title matching (40% weight)
  if (preferences.job_titles && preferences.job_titles.length > 0) {
    const titleMatch = preferences.job_titles.some(preferredTitle =>
      job.title.toLowerCase().includes(preferredTitle.toLowerCase()) ||
      preferredTitle.toLowerCase().includes(job.title.toLowerCase())
    )
    if (titleMatch) {
      score += 40
      matchReasons.push('Matches your preferred job titles')
    }
  }

  // Location matching (25% weight)
  if (preferences.city && preferences.country) {
    const locationMatch = 
      job.location.toLowerCase().includes(preferences.city.toLowerCase()) ||
      job.location.toLowerCase().includes(preferences.country.toLowerCase())
    
    if (locationMatch) {
      score += 25
      matchReasons.push('Located in your preferred area')
    }
  }

  // Remote work preference (15% weight)
  if (preferences.remote_work && job.remote) {
    score += 15
    matchReasons.push('Remote work available')
  } else if (!preferences.remote_work && !job.remote) {
    score += 10
    matchReasons.push('Office-based work as preferred')
  }

  // Salary matching (20% weight)
  if (preferences.minimum_pay && job.salary && preferences.pay_period) {
    const jobMonthlySalary = convertToMonthlySalary(job.salary)
    const userMinimumMonthly = convertToMonthlySalary({
      min: preferences.minimum_pay,
      max: preferences.minimum_pay,
      period: preferences.pay_period,
      currency: 'S$'
    })

    if (jobMonthlySalary >= userMinimumMonthly) {
      score += 20
      matchReasons.push('Meets your salary expectations')
    } else if (jobMonthlySalary >= userMinimumMonthly * 0.8) {
      score += 10
      matchReasons.push('Close to your salary range')
    }
  }

  // Normalize score to 0-1 range
  const normalizedScore = Math.min(score / maxScore, 1)

  return {
    job,
    score: normalizedScore,
    matchReasons
  }
}

function convertToMonthlySalary(salary: Job['salary']): number {
  if (!salary) return 0

  const { min, period } = salary

  switch (period) {
    case 'hour':
      return min * 8 * 22 // 8 hours/day, 22 working days/month
    case 'day':
      return min * 22 // 22 working days/month
    case 'week':
      return min * 4.33 // ~4.33 weeks/month
    case 'month':
      return min
    case 'year':
      return min / 12
    default:
      return min
  }
}

export function rankJobsByMatch(jobs: Job[], preferences: UserPreferences | null): JobMatchScore[] {
  const scoredJobs = jobs.map(job => calculateJobMatch(job, preferences))
  
  // Sort by score (highest first), then by posted date (newest first)
  return scoredJobs.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return new Date(b.job.postedDate).getTime() - new Date(a.job.postedDate).getTime()
  })
}

export function getJobRecommendations(jobs: Job[], preferences: UserPreferences | null, limit = 5): JobMatchScore[] {
  const rankedJobs = rankJobsByMatch(jobs, preferences)
  return rankedJobs
    .filter(match => match.score > 0.3) // Only show jobs with decent match
    .slice(0, limit)
}

export function getMatchPercentage(score: number): number {
  return Math.round(score * 100)
}

export function getMatchLabel(score: number): string {
  if (score >= 0.8) return 'Excellent match'
  if (score >= 0.6) return 'Good match'
  if (score >= 0.4) return 'Fair match'
  return 'Basic match'
}

export function getMatchColor(score: number): string {
  if (score >= 0.8) return 'text-green-600'
  if (score >= 0.6) return 'text-blue-600'
  if (score >= 0.4) return 'text-yellow-600'
  return 'text-gray-600'
} 
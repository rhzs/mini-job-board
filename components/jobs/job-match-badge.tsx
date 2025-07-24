"use client"

import React from 'react'
import { JobMatchScore, getMatchPercentage, getMatchLabel, getMatchColor } from '@/lib/job-matching'
import { Sparkles, Target, MapPin, DollarSign, Home } from 'lucide-react'

interface JobMatchBadgeProps {
  matchScore: JobMatchScore
  showReasons?: boolean
  compact?: boolean
}

export function JobMatchBadge({ matchScore, showReasons = false, compact = false }: JobMatchBadgeProps) {
  const percentage = getMatchPercentage(matchScore.score)
  const label = getMatchLabel(matchScore.score)
  const colorClass = getMatchColor(matchScore.score)

  if (matchScore.score === 0.5) {
    // Don't show badge for neutral/unmatched jobs
    return null
  }

  const getReasonIcon = (reason: string) => {
    if (reason.includes('job titles')) return <Target className="h-3 w-3" />
    if (reason.includes('location') || reason.includes('area')) return <MapPin className="h-3 w-3" />
    if (reason.includes('salary')) return <DollarSign className="h-3 w-3" />
    if (reason.includes('Remote') || reason.includes('Office')) return <Home className="h-3 w-3" />
    return <Sparkles className="h-3 w-3" />
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-indeed-blue" />
        <span className={`text-xs font-medium ${colorClass}`}>
          {percentage}% match
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Match Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 rounded-full">
          <Sparkles className="h-3 w-3 text-indeed-blue" />
          <span className={`text-xs font-medium ${colorClass}`}>
            {percentage}% match
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>

      {/* Match Reasons */}
      {showReasons && matchScore.matchReasons.length > 0 && (
        <div className="space-y-1">
          {matchScore.matchReasons.slice(0, 3).map((reason, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              {getReasonIcon(reason)}
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
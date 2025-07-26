"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { JobFilters as JobFiltersType } from './job-search-page'
import { salaryRanges } from '@/lib/mock-data'


interface JobFiltersProps {
  filters: JobFiltersType
  onFiltersChange: (filters: JobFiltersType) => void
  compact?: boolean
}

export function JobFilters({ filters, onFiltersChange, compact = false }: JobFiltersProps) {
  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Pay Filter */}
        <div className="relative">
          <select
            value={filters.salary ? `${filters.salary.min}-${filters.salary.max}` : ''}
            onChange={(e) => {
              if (!e.target.value) {
                const { salary, ...rest } = filters
                onFiltersChange(rest)
                return
              }
              const [min, max] = e.target.value.split('-').map(Number)
              updateFilter('salary', { min, max })
            }}
            className="text-sm border border-input rounded px-3 py-1.5 bg-background min-w-20"
          >
            <option value="">Pay</option>
            {salaryRanges.map((range, index) => (
              <option key={index} value={`${range.min}-${range.max}`}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Remote Filter */}
        <Button
          variant={filters.remote ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('remote', filters.remote ? undefined : true)}
          className={`whitespace-nowrap ${filters.remote ? 'bg-indeed-blue hover:bg-indeed-blue-dark text-white' : ''}`}
        >
          Remote
        </Button>

        {/* Job Type Filter */}
        <div className="relative">
          <select
            value={filters.jobType?.[0] || ''}
            onChange={(e) => {
              if (!e.target.value) {
                const { jobType, ...rest } = filters
                onFiltersChange(rest)
                return
              }
              updateFilter('jobType', [e.target.value])
            }}
            className="text-sm border border-input rounded px-3 py-1.5 bg-background min-w-24"
          >
            <option value="">Job type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
          </select>
        </div>

        {/* Date Posted Filter */}
        <div className="relative">
          <select
            value={filters.datePosted || ''}
            onChange={(e) => updateFilter('datePosted', e.target.value || undefined)}
            className="text-sm border border-input rounded px-3 py-1.5 bg-background min-w-28"
          >
            <option value="">Date posted</option>
            <option value="today">Today</option>
            <option value="3days">Last 3 days</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
          </select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters-compact">
            Clear all
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Salary Range */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Salary Range</h3>
        <div className="space-y-2">
          {salaryRanges.map((range, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="salary"
                checked={filters.salary?.min === range.min && filters.salary?.max === range.max}
                onChange={() => updateFilter('salary', { min: range.min, max: range.max })}
                className="w-4 h-4 text-indeed-blue"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="salary"
              checked={!filters.salary}
              onChange={() => {
                const { salary, ...rest } = filters
                onFiltersChange(rest)
              }}
              className="w-4 h-4 text-indeed-blue"
            />
            <span className="text-sm">Any salary</span>
          </label>
        </div>
      </div>

      {/* Job Type */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Job Type</h3>
        <div className="space-y-2">
          {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.jobType?.includes(type) || false}
                onChange={(e) => {
                  const currentTypes = filters.jobType || []
                  if (e.target.checked) {
                    updateFilter('jobType', [...currentTypes, type])
                  } else {
                    updateFilter('jobType', currentTypes.filter(t => t !== type))
                  }
                }}
                className="w-4 h-4 text-indeed-blue"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remote Work */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Location</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.remote || false}
            onChange={(e) => updateFilter('remote', e.target.checked ? true : undefined)}
            className="w-4 h-4 text-indeed-blue"
          />
          <span className="text-sm">Remote work</span>
        </label>
      </div>

      {/* Date Posted */}
      <div>
        <h3 className="font-medium text-foreground mb-3">Date Posted</h3>
        <div className="space-y-2">
          {[
            { value: 'today', label: 'Today' },
            { value: '3days', label: 'Last 3 days' },
            { value: 'week', label: 'Last week' },
            { value: 'month', label: 'Last month' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="datePosted"
                checked={filters.datePosted === option.value}
                onChange={() => updateFilter('datePosted', option.value)}
                className="w-4 h-4 text-indeed-blue"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="datePosted"
              checked={!filters.datePosted}
              onChange={() => updateFilter('datePosted', undefined)}
              className="w-4 h-4 text-indeed-blue"
            />
            <span className="text-sm">Any time</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <Button variant="outline" onClick={clearFilters} className="w-full" data-testid="clear-filters-expanded">
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  )
} 
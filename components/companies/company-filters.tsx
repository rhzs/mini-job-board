"use client"

import React from 'react'
import { CompanyFilters as SupabaseCompanyFilters } from '@/lib/supabase-companies'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Star } from 'lucide-react'

interface CompanyFiltersProps {
  filters: SupabaseCompanyFilters
  onFiltersChange: (filters: SupabaseCompanyFilters) => void
}

const INDUSTRIES = [
  'Technology',
  'Professional Services', 
  'Banking & Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Communications',
  'Government',
  'Non-profit',
  'Real Estate',
  'Transportation',
  'Energy',
  'Food & Restaurants',
  'Other'
]

const COMPANY_SIZES = [
  '1-10',
  '11-50', 
  '51-200',
  '201-500',
  '501-1000',
  '1001-5000',
  '5001+'
]

const RATING_OPTIONS = [
  { value: 4, label: '4+ stars' },
  { value: 3, label: '3+ stars' },
  { value: 2, label: '2+ stars' },
  { value: 1, label: '1+ stars' }
]

export function CompanyFilters({ filters, onFiltersChange }: CompanyFiltersProps) {
  const updateFilter = (key: keyof SupabaseCompanyFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== false
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Industry Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Industry</label>
          <select
            value={filters.industry || ''}
            onChange={(e) => updateFilter('industry', e.target.value || undefined)}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Company Size Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Company Size</label>
          <select
            value={filters.company_size || ''}
            onChange={(e) => updateFilter('company_size', e.target.value || undefined)}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">All Sizes</option>
            {COMPANY_SIZES.map(size => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Location</label>
          <Input
            type="text"
            placeholder="City or country"
            value={filters.location || ''}
            onChange={(e) => updateFilter('location', e.target.value || undefined)}
          />
        </div>

        {/* Minimum Rating Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Minimum Rating</label>
          <select
            value={filters.min_rating || ''}
            onChange={(e) => updateFilter('min_rating', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">Any Rating</option>
            {RATING_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                <div className="flex items-center gap-1">
                  {option.label}
                </div>
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="has-reviews"
            checked={filters.has_reviews || false}
            onCheckedChange={(checked) => updateFilter('has_reviews', checked || undefined)}
          />
          <label htmlFor="has-reviews" className="text-sm text-foreground">
            Companies with reviews only
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {filters.industry && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Industry: {filters.industry}
                <button 
                  onClick={() => updateFilter('industry', undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.company_size && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Size: {filters.company_size}
                <button 
                  onClick={() => updateFilter('company_size', undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.location && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Location: {filters.location}
                <button 
                  onClick={() => updateFilter('location', undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.min_rating && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <Star className="h-3 w-3" />
                {filters.min_rating}+ stars
                <button 
                  onClick={() => updateFilter('min_rating', undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
            
            {filters.has_reviews && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Has reviews
                <button 
                  onClick={() => updateFilter('has_reviews', undefined)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
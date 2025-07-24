"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw, MapPin, Briefcase } from 'lucide-react'

interface NoResultsProps {
  query: string
  onClearFilters: () => void
}

export function NoResults({ query, onClearFilters }: NoResultsProps) {
  const suggestions = [
    'Try different keywords',
    'Remove some filters',
    'Check your spelling',
    'Try more general terms',
    'Expand your location search'
  ]

  const popularSearches = [
    'Software Engineer',
    'Data Analyst', 
    'Marketing Manager',
    'Customer Service',
    'Administrative Assistant',
    'Sales Executive'
  ]

  const handleSuggestionClick = (suggestion: string) => {
    // This would typically update the search query
    console.log('Searching for:', suggestion)
  }

  return (
    <div className="text-center py-12 px-6">
      {/* Icon */}
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>

      {/* Main Message */}
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {query ? `No jobs found for "${query}"` : 'No jobs found'}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find any jobs matching your search criteria. Try adjusting your search or filters to see more results.
      </p>

      {/* Suggestions */}
      <div className="mb-8">
        <h3 className="font-semibold text-foreground mb-4">Try these suggestions:</h3>
        <div className="space-y-2 max-w-sm mx-auto">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-1.5 h-1.5 bg-indeed-blue rounded-full" />
              {suggestion}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
        <Button onClick={onClearFilters} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Clear all filters
        </Button>
        <Button onClick={() => handleSuggestionClick('')} className="bg-indeed-blue hover:bg-indeed-blue-dark">
          <Search className="h-4 w-4 mr-2" />
          Show all jobs
        </Button>
      </div>

      {/* Popular Searches */}
      <div className="border-t border-border pt-8">
        <h3 className="font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
          <Briefcase className="h-5 w-5" />
          Popular job searches
        </h3>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {popularSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(search)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Location Suggestions */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <h3 className="font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5" />
          Expand your search area
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try searching in nearby locations or consider remote opportunities
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Remote', 'Singapore CBD', 'Jurong', 'Tampines', 'Woodlands'].map((location, index) => (
            <button
              key={index}
              onClick={() => console.log('Searching in:', location)}
              className="px-3 py-1 bg-background border border-border hover:border-indeed-blue rounded-full text-xs transition-colors"
            >
              {location}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 
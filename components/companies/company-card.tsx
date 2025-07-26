"use client"

import React from 'react'
import { Company } from '@/lib/database.types'
import { Card, CardContent } from '@/components/ui/card'
import { Star, MapPin, Users, ExternalLink, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompanyCardProps {
  company: Company
  onClick?: () => void
  showFullInfo?: boolean
}

export function CompanyCard({ company, onClick, showFullInfo = false }: CompanyCardProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-purple-600 text-purple-600" />
        )
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <Star className="h-4 w-4 text-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-purple-600 text-purple-600" />
            </div>
          </div>
        )
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        )
      }
    }
    
    return stars
  }

  const formatReviewCount = (count: number) => {
    if (count === 0) return 'No reviews'
    if (count < 1000) return `${count} reviews`
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k reviews`
    return `${(count / 1000000).toFixed(1)}M reviews`
  }

  const getCompanyLogo = (company: Company) => {
    if (company.logo_url) {
      return (
        <img 
          src={company.logo_url} 
          alt={`${company.name} logo`}
          className="h-16 w-16 object-contain rounded-lg"
        />
      )
    }
    
    // Default logo based on company name initial
    return (
      <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
        {company.name.charAt(0).toUpperCase()}
      </div>
    )
  }



  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-border group bg-card h-full flex flex-col">
      <CardContent className="p-5 flex flex-col h-full" onClick={onClick}>
        {/* Header with Logo and Company Name */}
        <div className="flex items-start gap-4 mb-4">
          {getCompanyLogo(company)}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
              {company.name}
            </h3>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {renderStars(company.average_rating || 0)}
              </div>
              <span className="text-primary font-medium text-sm hover:underline">
                {formatReviewCount(company.total_reviews || 0)}
              </span>
            </div>
          </div>
          
          {company.is_verified && (
            <div className="flex-shrink-0">
              <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs px-2 py-1 rounded-full font-medium">
                ✓ Verified
              </div>
            </div>
          )}
        </div>
        
        {/* Company Details (only for expanded view) - This will grow to fill space */}
        <div className="flex-1 mb-4">
          {showFullInfo && (
            <div className="space-y-2">
              {company.headquarters && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{company.headquarters}</span>
                </div>
              )}
              
              {company.company_size && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{company.company_size} employees</span>
                </div>
              )}
              
              {company.industry && (
                <div className="text-sm font-medium text-primary">
                  {company.industry}
                </div>
              )}
              
              {company.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                  {company.description}
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Action Buttons - Always at bottom */}
        <div className="flex gap-0 border-t border-border pt-3 mt-auto">
          <button 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent py-2 px-3 text-sm font-medium transition-colors rounded-l-md"
            onClick={(e) => {
              e.stopPropagation()
              // Handle salaries click
            }}
          >
            Salaries
          </button>
          
          <button 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent py-2 px-3 text-sm font-medium transition-colors border-l border-r border-border"
            onClick={(e) => {
              e.stopPropagation()
              // Handle questions click
            }}
          >
            Questions
          </button>
          
          <button 
            className="flex-1 text-muted-foreground hover:text-primary hover:bg-accent py-2 px-3 text-sm font-medium transition-colors rounded-r-md"
            onClick={(e) => {
              e.stopPropagation()
              // Handle jobs click
            }}
          >
            Open jobs
          </button>
        </div>
        
        {/* Featured Badge - commented out since is_featured is not available */}
        {/* {company.is_featured && (
          <div className="absolute top-3 right-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 text-xs px-2 py-1 rounded-full font-medium">
            ⭐ Featured
          </div>
        )} */}
      </CardContent>
    </Card>
  )
} 
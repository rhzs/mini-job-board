"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import HeaderWrapper from "@/components/header-wrapper"
import Footer from "@/components/footer"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CompanyCard } from '@/components/companies/company-card'
// import { CompanyFilters } from '@/components/companies/company-filters'
import { fetchCompanies, getPopularCompanies, type CompanyFilters as SupabaseCompanyFilters } from '@/lib/supabase-companies'
import { Company } from '@/lib/database.types'
import { Search, Building2, Star } from 'lucide-react'

function CompaniesPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-blue-50 to-background dark:from-gray-900 dark:to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 bg-muted rounded-full mx-auto"></div>
              <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
              <div className="h-6 bg-muted rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted rounded-lg h-52" />
            ))}
          </div>
        </div>
      </main>      
      <Footer />
    </div>
  )
}

function CompaniesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [companies, setCompanies] = useState<Company[]>([])
  const [popularCompanies, setPopularCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<SupabaseCompanyFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (query || Object.keys(filters).length > 0) {
      searchCompanies()
    }
  }, [query, filters])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      // Fetch popular companies for the homepage
      const popular = await getPopularCompanies(9)
      setPopularCompanies(popular)
      
      // If there's a search query, search immediately
      if (query) {
        await searchCompanies()
      } else {
        setCompanies([])
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchCompanies = async () => {
    setLoading(true)
    try {
      const result = await fetchCompanies({
        query: query.trim() || undefined,
        ...filters
      })
      
      if (result.error) {
        console.error('Error searching companies:', result.error)
        setCompanies([])
      } else {
        setCompanies(result.companies)
      }
    } catch (error) {
      console.error('Error searching companies:', error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('q', query.trim())
    }
    
    const newUrl = params.toString() ? `/companies?${params.toString()}` : '/companies'
    router.push(newUrl)
    
    searchCompanies()
  }

  const handleFiltersChange = (newFilters: SupabaseCompanyFilters) => {
    setFilters(newFilters)
  }

  const formatReviewText = (count: number) => {
    if (count === 0) return 'No reviews'
    if (count === 1) return '1 review'
    return `${count.toLocaleString()} reviews`
  }

  const showSearchResults = query.trim() || Object.keys(filters).length > 0

  return (
    <div className="min-h-screen bg-background">
      <HeaderWrapper />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-blue-50 to-background dark:from-gray-900 dark:to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Find great places to work
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Get access to millions of company reviews
            </p>
            
            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Company name or job title"
                    className="pl-10 h-12 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  Find Companies
                </Button>
              </div>
              

            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {showSearchResults ? (
            /* Search Results */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {loading ? 'Searching...' : `${companies.length} companies found`}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
              </div>

              {/* showFilters && (
                <div className="mb-6 p-4 border border-border rounded-lg bg-card">
                  <CompanyFilters 
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              ) */}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-52" />
                  ))}
                </div>
              ) : companies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onClick={() => router.push(`/companies/${company.slug}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No companies found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or browse popular companies below.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Popular Companies */
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Popular companies
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-52" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onClick={() => router.push(`/companies/${company.slug}`)}
                      showFullInfo
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rate Your Employer Section */}
        <div className="bg-muted py-12 mt-12">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground">Rate your recent employer:</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="h-8 w-8 text-muted-foreground hover:text-yellow-400 cursor-pointer transition-colors" 
                  />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground">
              Help others find great places to work by sharing your experience
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<CompaniesPageLoading />}>
      <CompaniesPageContent />
    </Suspense>
  )
} 
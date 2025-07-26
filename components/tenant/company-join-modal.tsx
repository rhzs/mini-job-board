'use client'

import React, { useState, useEffect } from 'react'
import { Search, Building2, MapPin, Users, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { useTenant } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { searchCompanies } from '@/lib/tenant-context'
import { Company, CompanyJoinRequest } from '@/lib/database.types'

interface CompanyJoinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function CompanyJoinModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CompanyJoinModalProps) {
  const { user } = useAuth()
  const { joinCompany, isLoading } = useTenant()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'pending' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchCompanies(searchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching companies:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const getUserEmailDomain = () => {
    return user?.email?.split('@')[1] || ''
  }

  const isEmailDomainMatch = (company: Company) => {
    const userDomain = getUserEmailDomain()
    return company.email_domain === userDomain
  }

  const willAutoApprove = (company: Company) => {
    return company.auto_approve_domain && isEmailDomainMatch(company)
  }

  const handleJoinCompany = async (company: Company) => {
    setSelectedCompany(company)
    setJoinStatus('idle')
    setErrorMessage('')

    try {
      const request: CompanyJoinRequest = {
        company_id: company.id
      }

      await joinCompany(request)
      
      if (willAutoApprove(company)) {
        setJoinStatus('success')
        setTimeout(() => {
          onSuccess?.()
          onClose()
          resetModal()
        }, 2000)
      } else {
        setJoinStatus('pending')
        setTimeout(() => {
          onClose()
          resetModal()
        }, 3000)
      }
    } catch (error: any) {
      console.error('Error joining company:', error)
      setJoinStatus('error')
      setErrorMessage(error.message || 'Failed to join company. Please try again.')
    }
  }

  const resetModal = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedCompany(null)
    setJoinStatus('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    if (!isLoading) {
      resetModal()
      onClose()
    }
  }

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const renderStatusMessage = () => {
    if (joinStatus === 'success') {
      return (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Welcome to {selectedCompany?.name}!</h3>
          <p className="text-muted-foreground">
            You've been automatically approved and can now access company features.
          </p>
        </div>
      )
    }

    if (joinStatus === 'pending') {
      return (
        <div className="text-center py-6">
          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Request Sent!</h3>
          <p className="text-muted-foreground mb-4">
            Your request to join {selectedCompany?.name} has been sent to company administrators.
          </p>
          <p className="text-sm text-muted-foreground">
            You'll receive an email notification once your request is reviewed.
          </p>
        </div>
      )
    }

    if (joinStatus === 'error') {
      return (
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Request Failed</h3>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <Button onClick={() => setJoinStatus('idle')}>
            Try Again
          </Button>
        </div>
      )
    }

    return null
  }

  const statusMessage = renderStatusMessage()
  if (statusMessage) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Join Company">
        {statusMessage}
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Join Existing Company">
      <div className="space-y-6">
        {/* User Email Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium">Your email domain</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Companies with the domain <span className="font-mono font-medium">@{getUserEmailDomain()}</span> may automatically approve your request.
          </p>
        </div>

        {/* Search */}
        <div>
          <label htmlFor="company-search" className="block text-sm font-medium mb-2">
            Search Companies
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="company-search"
              type="text"
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          {isSearching && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Searching companies...</p>
            </div>
          )}

          {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <div className="text-center py-6">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No companies found matching "{searchQuery}"
              </p>
            </div>
          )}

          {searchResults.map((company) => (
            <div 
              key={company.id}
              className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Company Logo/Avatar */}
                <div className="flex-shrink-0">
                  {company.logo_url ? (
                    <img 
                      src={company.logo_url} 
                      alt={company.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {getCompanyInitials(company.name)}
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{company.name}</h3>
                    {company.is_verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    {isEmailDomainMatch(company) && (
                      <Badge className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Domain Match
                      </Badge>
                    )}
                  </div>

                  {company.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    {company.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.industry && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{company.industry}</span>
                      </div>
                    )}
                  </div>

                  {/* Join Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      {willAutoApprove(company) ? (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ Will be auto-approved
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Requires admin approval
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleJoinCompany(company)}
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? 'Joining...' : 'Request to Join'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        {!searchQuery.trim() && (
          <div className="text-center py-6">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start typing to search for companies to join
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 
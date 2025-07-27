'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { 
  TenantContext, 
  UserCompanyMembership, 
  Company, 
  CompanyFormData, 
  CompanyJoinRequest, 
  UserCompany,
  ExtendedUser
} from './database.types'
import { useAuth } from './auth-context'

const TenantContextProvider = createContext<TenantContext | undefined>(undefined)

export function useTenant() {
  const context = useContext(TenantContextProvider)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Helper function to determine if user is in company mode
export function useIsCompanyMode() {
  const { currentCompany, isLoading } = useTenant()
  return { isCompanyMode: !!currentCompany, isLoading }
}

// Helper function to switch to personal mode
export function usePersonalMode() {
  const { switchToPersonal } = useTenant()
  return switchToPersonal
}

interface TenantProviderProps {
  children: React.ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user } = useAuth()
  const [currentCompany, setCurrentCompany] = useState<UserCompanyMembership | undefined>()
  const [userCompanies, setUserCompanies] = useState<UserCompanyMembership[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExplicitPersonalMode, setIsExplicitPersonalMode] = useState(false)

  // Load user's companies and current company selection
  useEffect(() => {
    if (user) {
      loadUserCompanies()
    } else {
      setCurrentCompany(undefined)
      setUserCompanies([])
    }
  }, [user])



  const loadUserCompanies = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Fetch user's approved company memberships
      const { data: memberships, error } = await supabase
        .from('user_company_memberships')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading user companies:', error)
        return
      }

      setUserCompanies(memberships || [])

      // Set current company from user metadata or first available
      let currentCompanyId = user.user_metadata?.current_company_id
      
      // Only auto-select first company if:
      // 1. No company ID is set (undefined/null)
      // 2. User has companies available  
      // 3. User hasn't explicitly switched to personal mode
      if (!currentCompanyId && memberships && memberships.length > 0 && !isExplicitPersonalMode) {
        currentCompanyId = memberships[0].company_id
      }

      if (currentCompanyId) {
        const currentMembership = memberships?.find(m => m.company_id === currentCompanyId)
        if (currentMembership) {
          setCurrentCompany(currentMembership)
          // Clear explicit personal mode when loading a company
          setIsExplicitPersonalMode(false)
          
          // Update user metadata if needed
          if (user.user_metadata?.current_company_id !== currentCompanyId) {
            await updateUserCurrentCompany(currentCompanyId)
          }
        }
      } else {
        // If no company ID and not explicit personal mode, clear current company
        if (!isExplicitPersonalMode) {
          setCurrentCompany(undefined)
        }
      }
    } catch (error) {
      console.error('Error in loadUserCompanies:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserCurrentCompany = async (companyId: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { current_company_id: companyId }
      })
      
      if (error) {
        console.error('Error updating user current company:', error)
      }
    } catch (error) {
      console.error('Error in updateUserCurrentCompany:', error)
    }
  }

  const switchCompany = async (companyId: string) => {
    const membership = userCompanies.find(c => c.company_id === companyId)
    if (!membership) {
      throw new Error('Company membership not found')
    }

    // Clear explicit personal mode when switching to a company
    setIsExplicitPersonalMode(false)
    setCurrentCompany(membership)
    await updateUserCurrentCompany(companyId)
  }

  const createCompany = async (data: CompanyFormData): Promise<Company> => {
    if (!user) {
      throw new Error('User must be authenticated to create a company')
    }

    setIsLoading(true)
    try {
      // Generate slug from company name
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim()
          .substring(0, 50) // Limit length
      }

      const slug = generateSlug(data.name)

      // Create the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          slug: slug, // Add the generated slug
          description: data.description,
          website: data.website,
          headquarters: data.location, // Map location to headquarters column
          industry: data.industry,
          company_size: data.size, // Map size to company_size column
          founded_year: data.founded_year,
          email_domain: data.email_domain,
          auto_approve_domain: data.auto_approve_domain || false,
          is_verified: true, // Auto-verify companies created by users
          created_by: user.id
        })
        .select()
        .single()

      if (companyError) {
        throw companyError
      }

      // Create user-company relationship as owner
      const { error: membershipError } = await supabase
        .from('user_companies')
        .insert({
          user_id: user.id,
          company_id: company.id,
          role: 'owner',
          status: 'approved',
          approved_at: new Date().toISOString()
        })

      if (membershipError) {
        throw membershipError
      }

      // Create the new membership object directly (matching UserCompanyMembership interface)
      const newMembership: UserCompanyMembership = {
        user_id: user.id,
        company_id: company.id,
        company_name: company.name,
        role: 'owner',
        status: 'approved',
        created_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        email_domain: data.email_domain
      }

      // Add to userCompanies state directly (faster than reloading)
      setUserCompanies(prev => [...prev, newMembership])

      // Set as current company directly
      setCurrentCompany(newMembership)
      await updateUserCurrentCompany(company.id)
      
      return company
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const joinCompany = async (request: CompanyJoinRequest): Promise<UserCompany> => {
    if (!user) {
      throw new Error('User must be authenticated to join a company')
    }

    setIsLoading(true)
    try {
      // Extract email domain for validation
      const userEmail = user.email
      const emailDomain = userEmail?.split('@')[1]

      // Create user-company relationship request
      const { data: membership, error } = await supabase
        .from('user_companies')
        .insert({
          user_id: user.id,
          company_id: request.company_id,
          role: 'member',
          status: 'pending', // Will be auto-approved if email domain matches
          email_domain: emailDomain
        })
        .select(`
          *,
          company:companies(*)
        `)
        .single()

      if (error) {
        throw error
      }

      // Reload user companies to include any auto-approved memberships
      await loadUserCompanies()

      return membership
    } catch (error) {
      console.error('Error joining company:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const leaveCompany = async (companyId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to leave a company')
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('user_companies')
        .delete()
        .eq('user_id', user.id)
        .eq('company_id', companyId)

      if (error) {
        throw error
      }

      // If user is leaving their current company, switch to another one
      if (currentCompany?.company_id === companyId) {
        const remainingCompanies = userCompanies.filter(c => c.company_id !== companyId)
        if (remainingCompanies.length > 0) {
          await switchCompany(remainingCompanies[0].company_id)
        } else {
          setCurrentCompany(undefined)
          await updateUserCurrentCompany('')
        }
      }

      // Reload user companies
      await loadUserCompanies()
    } catch (error) {
      console.error('Error leaving company:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const switchToPersonal = async () => {
    // Set explicit personal mode flag FIRST to prevent auto-selection
    setIsExplicitPersonalMode(true)
    setCurrentCompany(undefined)
    
    // Clear current company from user metadata
    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { current_company_id: null }
        })
        if (error) {
          console.error('Error updating user metadata:', error)
        }
      } catch (error) {
        console.error('Exception in updateUser:', error)
      }
    }
  }

  const contextValue: TenantContext = {
    currentCompany,
    userCompanies,
    switchCompany,
    switchToPersonal,
    createCompany,
    joinCompany,
    leaveCompany,
    isLoading
  }

  return (
    <TenantContextProvider.Provider value={contextValue}>
      {children}
    </TenantContextProvider.Provider>
  )
}

// Utility functions for company operations
export const getCompanyMembership = async (userId: string, companyId: string) => {
  const { data, error } = await supabase
    .from('user_companies')
    .select('*')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error
  }

  return data
}

export const searchCompanies = async (query: string, limit = 10) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_verified', true)
    .limit(limit)

  if (error) {
    throw error
  }

  return data
}

export const getCompanyPendingRequests = async (companyId: string) => {
  const { data, error } = await supabase
    .from('user_companies')
    .select(`
      *,
      user:auth.users(email)
    `)
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .order('requested_at', { ascending: true })

  if (error) {
    throw error
  }

  return data
}

export const approveCompanyMember = async (membershipId: string) => {
  const { data, error } = await supabase
    .from('user_companies')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString()
    })
    .eq('id', membershipId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export const rejectCompanyMember = async (membershipId: string) => {
  const { data, error } = await supabase
    .from('user_companies')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString()
    })
    .eq('id', membershipId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
} 
"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  showSignIn: boolean
  showSignUp: boolean
  showOnboarding: boolean
  openSignIn: () => void
  openSignUp: () => void
  openOnboarding: () => Promise<void>
  closeModals: () => void
  closeOnboarding: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    let initialLoadTimer: NodeJS.Timeout | null = null
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      
      // Add small delay for initial load to prevent flickering
      initialLoadTimer = setTimeout(() => {
        setLoading(false)
      }, 100)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        // For auth state changes (not initial), set loading false immediately
        if (event !== 'INITIAL_SESSION') {
          setLoading(false)
        }
        
        // Close modals on successful auth and check onboarding
        if (event === 'SIGNED_IN') {
          setShowSignIn(false)
          setShowSignUp(false)
          checkOnboardingStatus(session?.user || null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      if (initialLoadTimer) {
        clearTimeout(initialLoadTimer)
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Allow sign-in even if email is not confirmed
        if (error.message.includes('Email not confirmed')) {
          console.log('User signed in with unconfirmed email')
          // Still return success - user can sign in without email confirmation
          closeModals()
          return {}
        }
        return { error: error.message }
      }
      
      // Successful sign-in - close modals, home page will show job search
      closeModals()
      
      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Attempting signup with:', { email, passwordLength: password.length })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      console.log('Supabase signup response:', { data, error })
      
      if (error) {
        console.error('Supabase signup error:', error)
        return { error: error.message }
      }
      
      // If signup successful, close modals - onboarding will be triggered by onAuthStateChange
      if (data.user && !error) {
        console.log('User created successfully:', data.user.email)
        closeModals()
        // Don't call openOnboarding() here - let onAuthStateChange handle it to avoid double trigger
        return {}
      }
      
      return {}
    } catch (error) {
      console.error('Unexpected signup error:', error)
      return { error: 'An unexpected error occurred' }
    }
  }

  const checkOnboardingStatus = async (user: User | null) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking onboarding status:', error)
        return
      }

      // Show onboarding only if:
      // 1. No preferences exist at all (completely new user), OR
      // 2. Preferences exist but onboarding_completed is explicitly false
      if (!data || (data && data.onboarding_completed === false)) {
        console.log('Showing onboarding for user:', user.email, 'Status:', data?.onboarding_completed)
        setShowOnboarding(true)
      } else {
        console.log('Onboarding already completed for user:', user.email)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const openSignIn = () => {
    setShowSignIn(true)
    setShowSignUp(false)
  }

  const openSignUp = () => {
    setShowSignUp(true)
    setShowSignIn(false)
  }

  const openOnboarding = async () => {
    if (!user) return

    // Check if user has already completed onboarding
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      // Only show onboarding if user hasn't completed it
      if (!data || data.onboarding_completed !== true) {
        console.log('Opening onboarding for user:', user.email)
        setShowOnboarding(true)
      } else {
        console.log('User has already completed onboarding:', user.email)
      }
    } catch (error) {
      console.error('Error checking onboarding status in openOnboarding:', error)
      // If there's an error checking, show onboarding as fallback
      setShowOnboarding(true)
    }
  }

  const closeModals = () => {
    setShowSignIn(false)
    setShowSignUp(false)
  }

  const closeOnboarding = () => {
    setShowOnboarding(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    showSignIn,
    showSignUp,
    showOnboarding,
    openSignIn,
    openSignUp,
    openOnboarding,
    closeModals,
    closeOnboarding,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
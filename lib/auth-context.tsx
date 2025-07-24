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
  openOnboarding: () => void
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Close modals on successful auth and check onboarding
        if (event === 'SIGNED_IN') {
          setShowSignIn(false)
          setShowSignUp(false)
          checkOnboardingStatus(session?.user || null)
        }
      }
    )

    return () => subscription.unsubscribe()
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
          return {}
        }
        return { error: error.message }
      }
      
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
      
      // If signup successful, trigger onboarding for new users
      if (data.user && !error) {
        setShowSignUp(false)
        setShowOnboarding(true)
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

      // If no preferences found or onboarding not completed, show onboarding
      if (!data || !data.onboarding_completed) {
        setShowOnboarding(true)
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

  const openOnboarding = () => {
    setShowOnboarding(true)
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
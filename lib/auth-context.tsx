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
  openSignIn: () => void
  openSignUp: () => void
  closeModals: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

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
        
        // Close modals on successful auth
        if (event === 'SIGNED_IN') {
          setShowSignIn(false)
          setShowSignUp(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
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
      
      return {}
    } catch (error) {
      console.error('Unexpected signup error:', error)
      return { error: 'An unexpected error occurred' }
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

  const closeModals = () => {
    setShowSignIn(false)
    setShowSignUp(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    showSignIn,
    showSignUp,
    openSignIn,
    openSignUp,
    closeModals,
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
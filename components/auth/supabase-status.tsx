"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function SupabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          setStatus('disconnected')
          setError(error.message)
        } else {
          setStatus('connected')
        }
      } catch (err) {
        setStatus('disconnected')
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    checkConnection()
  }, [])

  const hasValidConfig = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key'

  if (!hasValidConfig) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-sm">⚠️ Supabase Not Configured</h3>
        <p className="text-xs mt-1">
          Please set up your environment variables:
          <br />• NEXT_PUBLIC_SUPABASE_URL
          <br />• NEXT_PUBLIC_SUPABASE_ANON_KEY
        </p>
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-sm">🔌 Supabase Connection Issue</h3>
        <p className="text-xs mt-1">{error}</p>
      </div>
    )
  }

  if (status === 'connected') {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-sm">✅ Supabase Connected</h3>
        <p className="text-xs mt-1">Authentication is ready to use!</p>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold text-sm">🔄 Checking Supabase...</h3>
    </div>
  )
} 
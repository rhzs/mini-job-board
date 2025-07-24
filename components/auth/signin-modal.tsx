"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff } from 'lucide-react'

export function SignInModal() {
  const { showSignIn, closeModals, signIn, openSignUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn(email, password)
    
    if (result.error) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleSwitchToSignUp = () => {
    setEmail('')
    setPassword('')
    setError('')
    openSignUp()
  }

  return (
    <Modal
      isOpen={showSignIn}
      onClose={closeModals}
      title="Ready to take the next step?"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Create an account or sign in.
        </p>
  
        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <div className="font-medium">Error: {error}</div>
              {error.includes('Email not confirmed') && (
                <div className="text-xs mt-1 text-orange-600">
                  💡 Don't worry! You can still use the app without confirming your email.
                </div>
              )}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-indeed-blue hover:bg-indeed-blue-dark"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToSignUp}
              className="text-indeed-blue hover:underline font-medium"
            >
              Create account
            </button>
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          By creating an account or signing in, you understand and agree to Indeed's{' '}
          <a href="#" className="text-indeed-blue hover:underline">Terms</a>. You also acknowledge our{' '}
          <a href="#" className="text-indeed-blue hover:underline">Cookie</a> and{' '}
          <a href="#" className="text-indeed-blue hover:underline">Privacy</a> policies. You will receive
          marketing messages from Indeed and may opt out at any time by following
          the unsubscribe link in our messages, or as detailed in our terms.
        </div>
      </div>
    </Modal>
  )
} 
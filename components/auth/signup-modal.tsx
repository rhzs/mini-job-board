"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff } from 'lucide-react'
import { EmailSuggestions } from './email-suggestions'

export function SignUpModal() {
  const { showSignUp, closeModals, signUp, openSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Check for common invalid domains
    const invalidDomains = ['demo.com', 'test.com', 'example.com', 'fake.com']
    const domain = email.split('@')[1]?.toLowerCase()
    if (invalidDomains.includes(domain)) {
      setError('Please use a real email address (try gmail.com, outlook.com, etc.)')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    console.log('Starting signup process...')
    const result = await signUp(email, password)
    
    if (result.error) {
      console.error('Signup failed:', result.error)
      setError(result.error)
    } else {
      console.log('Signup successful!')
      setSuccess(true)
    }
    
    setLoading(false)
  }

  const handleSwitchToSignIn = () => {
    setEmail('')
    setPassword('')
    setError('')
    setSuccess(false)
    openSignIn()
  }

  if (success) {
    return (
      <Modal
        isOpen={showSignUp}
        onClose={closeModals}
        title="Check your email"
        className="max-w-lg"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Account created successfully!</h3>
          <p className="text-muted-foreground">
            We've sent you a confirmation email at <strong>{email}</strong>. 
            Please check your inbox and click the confirmation link to activate your account.
          </p>
          <Button onClick={closeModals} className="w-full">
            Got it
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={showSignUp}
      onClose={closeModals}
      title="Create your account"
      className="max-w-lg"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Join millions of people using Indeed to find their next opportunity.
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <div className="font-medium">Error: {error}</div>
              {error.includes('invalid') && (
                <div className="text-xs mt-1 text-red-500">
                  💡 Tips:<br/>
                  • Try a real email domain (gmail.com, outlook.com, yahoo.com)<br/>
                  • Avoid demo/test domains like demo.com<br/>
                  • Check your Supabase settings if issue persists
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
            {!email && <EmailSuggestions onSuggestionClick={setEmail} />}
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
                placeholder="At least 6 characters"
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
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleSwitchToSignIn}
              className="text-indeed-blue hover:underline font-medium"
            >
              Sign in
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
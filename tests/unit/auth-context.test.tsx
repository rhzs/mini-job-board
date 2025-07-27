import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '@/lib/auth-context'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  })
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: null },
        error: null
      })),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    }
  }
}))

// Test component to use the auth hook
const TestComponent = () => {
  const { user, loading } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
    </div>
  )
}

describe('lib/auth-context.tsx', () => {
  describe('AuthProvider', () => {
    it('should provide auth context to children', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('user')).toBeInTheDocument()
      expect(getByTestId('loading')).toBeInTheDocument()
    })

    it('should start with loading state', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(getByTestId('loading')).toHaveTextContent('Loading')
      expect(getByTestId('user')).toHaveTextContent('No user')
    })

    it('should provide auth methods', () => {
      const TestMethodsComponent = () => {
        const { signUp, signIn, signOut } = useAuth()
        
        return (
          <div>
            <div data-testid="has-signup">{typeof signUp === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-signin">{typeof signIn === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-signout">{typeof signOut === 'function' ? 'true' : 'false'}</div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestMethodsComponent />
        </AuthProvider>
      )

      expect(getByTestId('has-signup')).toHaveTextContent('true')
      expect(getByTestId('has-signin')).toHaveTextContent('true')
      expect(getByTestId('has-signout')).toHaveTextContent('true')
    })

    it('should provide modal methods', () => {
      const TestModalComponent = () => {
        const { 
          showSignIn, 
          showSignUp, 
          showOnboarding,
          openSignIn,
          openSignUp,
          openOnboarding,
          closeModals,
          closeOnboarding
        } = useAuth()
        
        return (
          <div>
            <div data-testid="show-signin">{showSignIn ? 'true' : 'false'}</div>
            <div data-testid="show-signup">{showSignUp ? 'true' : 'false'}</div>
            <div data-testid="show-onboarding">{showOnboarding ? 'true' : 'false'}</div>
            <div data-testid="has-open-signin">{typeof openSignIn === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-open-signup">{typeof openSignUp === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-open-onboarding">{typeof openOnboarding === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-close-modals">{typeof closeModals === 'function' ? 'true' : 'false'}</div>
            <div data-testid="has-close-onboarding">{typeof closeOnboarding === 'function' ? 'true' : 'false'}</div>
          </div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestModalComponent />
        </AuthProvider>
      )

      expect(getByTestId('show-signin')).toHaveTextContent('false')
      expect(getByTestId('show-signup')).toHaveTextContent('false')
      expect(getByTestId('show-onboarding')).toHaveTextContent('false')
      expect(getByTestId('has-open-signin')).toHaveTextContent('true')
      expect(getByTestId('has-open-signup')).toHaveTextContent('true')
      expect(getByTestId('has-open-onboarding')).toHaveTextContent('true')
      expect(getByTestId('has-close-modals')).toHaveTextContent('true')
      expect(getByTestId('has-close-onboarding')).toHaveTextContent('true')
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Context structure', () => {
    it('should provide all required auth context properties', () => {
      const TestPropertiesComponent = () => {
        const context = useAuth()
        
        const requiredProps = [
          'user', 'loading', 'signIn', 'signUp', 'signOut',
          'showSignIn', 'showSignUp', 'showOnboarding',
          'openSignIn', 'openSignUp', 'openOnboarding',
          'closeModals', 'closeOnboarding'
        ]
        
        const hasAllProps = requiredProps.every(prop => prop in context)
        
        return (
          <div data-testid="has-all-props">{hasAllProps ? 'true' : 'false'}</div>
        )
      }

      const { getByTestId } = render(
        <AuthProvider>
          <TestPropertiesComponent />
        </AuthProvider>
      )

      expect(getByTestId('has-all-props')).toHaveTextContent('true')
    })
  })
}) 
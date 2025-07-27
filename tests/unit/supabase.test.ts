import { createClient } from '@supabase/supabase-js'

// Mock the Supabase createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
    auth: jest.fn(),
    storage: jest.fn(),
    rpc: jest.fn()
  })),
}))

describe('lib/supabase.ts', () => {
  describe('Module exports', () => {
    it('should export a supabase client', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase).toBeDefined()
      expect(typeof supabase).toBe('object')
    })

    it('should only export the supabase client', () => {
      const supabaseModule = require('@/lib/supabase')

      const exportedKeys = Object.keys(supabaseModule)
      expect(exportedKeys).toEqual(['supabase'])
    })

    it('should provide expected client methods', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase).toHaveProperty('from')
      expect(supabase).toHaveProperty('auth')
      expect(typeof supabase.from).toBe('function')
      expect(typeof supabase.auth).toBe('function')
    })
  })

  describe('Client structure', () => {
    it('should have database query capabilities', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase.from).toBeDefined()
      expect(typeof supabase.from).toBe('function')
    })

    it('should have authentication capabilities', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase.auth).toBeDefined()
      expect(typeof supabase.auth).toBe('function')
    })

    it('should be a properly structured Supabase client', () => {
      const { supabase } = require('@/lib/supabase')

      // Basic structure check
      expect(supabase).toBeInstanceOf(Object)
      expect(supabase).not.toBeNull()
      expect(supabase).not.toBeUndefined()
    })

    it('should provide storage capabilities', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase.storage).toBeDefined()
      expect(typeof supabase.storage).toBe('function')
    })

    it('should provide RPC capabilities', () => {
      const { supabase } = require('@/lib/supabase')

      expect(supabase.rpc).toBeDefined()
      expect(typeof supabase.rpc).toBe('function')
    })
  })
}) 
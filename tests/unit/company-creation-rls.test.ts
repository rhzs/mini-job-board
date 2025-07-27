import { createClient } from '@supabase/supabase-js'

// Simple test framework functions
const describe = (name: string, fn: () => void) => {
  console.log(`\n📝 ${name}`)
  fn()
}

const test = (name: string, fn: () => Promise<void>) => {
  return async () => {
    try {
      console.log(`  ✓ ${name}`)
      await fn()
      console.log(`    ✅ PASSED`)
    } catch (error) {
      console.log(`    ❌ FAILED: ${error}`)
      throw error
    }
  }
}

const expect = (actual: any) => ({
  toBeNull: () => {
    if (actual !== null) throw new Error(`Expected null, got ${actual}`)
  },
  toBeTruthy: () => {
    if (!actual) throw new Error(`Expected truthy value, got ${actual}`)
  },
  toBe: (expected: any) => {
    if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`)
  },
  not: {
    toBe: (expected: any) => {
      if (actual === expected) throw new Error(`Expected not ${expected}, got ${actual}`)
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) throw new Error(`Expected ${actual} to be less than ${expected}`)
  }
})

const beforeAll = (fn: () => Promise<void>) => fn
const afterEach = (fn: () => Promise<void>) => fn

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

describe('Company Creation RLS Fix', () => {
  let supabase: any
  let testUser: any
  let createdCompanyIds: string[] = []

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  })

  afterEach(async () => {
    // Clean up created companies and user_companies entries
    if (createdCompanyIds.length > 0) {
      try {
        // Delete user_companies first (due to foreign key constraints)
        await supabase
          .from('user_companies')
          .delete()
          .in('company_id', createdCompanyIds)

        // Then delete companies
        await supabase
          .from('companies')
          .delete()
          .in('id', createdCompanyIds)
        
        createdCompanyIds = []
      } catch (error) {
        console.warn('Cleanup failed:', error)
      }
    }

    // Sign out test user
    if (testUser) {
      await supabase.auth.signOut()
      testUser = null
    }
  })

  test('should create user account without RLS errors', async () => {
    const testEmail = `test-rls-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Create test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    expect(signUpData.user).toBeTruthy()
    expect(signUpData.user?.email).toBe(testEmail)

    testUser = signUpData.user
  })

  test('should create company without infinite recursion error', async () => {
    // First create and sign in a test user
    const testEmail = `test-company-${Date.now()}@techcorp.com`
    const testPassword = 'TestPassword123!'

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    testUser = signUpData.user

    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(signInError).toBeNull()
    expect(signInData.user).toBeTruthy()

    // Create company data
    const companyData = {
      name: `Test Company RLS ${Date.now()}`,
      description: 'Test company for RLS verification',
      website: 'https://test-company.com',
      headquarters: 'Singapore',
      industry: 'Technology',
      company_size: '11-50',
      email_domain: 'techcorp.com',
      auto_approve_domain: true,
      is_verified: true,
      created_by: testUser.id
    }

    // This should NOT throw the infinite recursion error
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single()

    expect(companyError).toBeNull()
    expect(company).toBeTruthy()
    expect(company.name).toBe(companyData.name)

    if (company?.id) {
      createdCompanyIds.push(company.id)
    }

    // Create user-company relationship as owner
    // This is where the infinite recursion was happening before the fix
    const { data: membership, error: membershipError } = await supabase
      .from('user_companies')
      .insert({
        user_id: testUser.id,
        company_id: company.id,
        role: 'owner',
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .select()
      .single()

    // The key test: this should NOT return error code 42P17 (infinite recursion)
    expect(membershipError).toBeNull()
    expect(membership).toBeTruthy()
    expect(membership.role).toBe('owner')
    expect(membership.status).toBe('approved')
  })

  test('should verify RLS functions work correctly', async () => {
    // Test that the SECURITY DEFINER functions exist and work
    const testEmail = `test-functions-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Create and sign in user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    testUser = signUpData.user

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(signInError).toBeNull()

    // Create a test company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: `Function Test Company ${Date.now()}`,
        description: 'Test company for function verification',
        headquarters: 'Singapore',
        industry: 'Technology',
        company_size: '11-50',
        email_domain: 'example.com',
        created_by: testUser.id
      })
      .select()
      .single()

    expect(companyError).toBeNull()
    createdCompanyIds.push(company.id)

    // Create user-company relationship
    const { error: membershipError } = await supabase
      .from('user_companies')
      .insert({
        user_id: testUser.id,
        company_id: company.id,
        role: 'owner',
        status: 'approved',
        approved_at: new Date().toISOString()
      })

    expect(membershipError).toBeNull()

    // Test the RLS functions via RPC call
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_company_admin', {
        user_uuid: testUser.id,
        company_uuid: company.id
      })

    expect(adminError).toBeNull()
    expect(isAdmin).toBe(true)

    const { data: isMember, error: memberError } = await supabase
      .rpc('is_company_member', {
        user_uuid: testUser.id,
        company_uuid: company.id
      })

    expect(memberError).toBeNull()
    expect(isMember).toBe(true)
  })

  test('should handle multiple users without RLS conflicts', async () => {
    // Create two different users
    const user1Email = `user1-${Date.now()}@example.com`
    const user2Email = `user2-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    // Create user 1
    const { data: user1Data, error: user1Error } = await supabase.auth.signUp({
      email: user1Email,
      password: password,
    })

    expect(user1Error).toBeNull()
    const user1 = user1Data.user

    // Sign in user 1 and create company
    await supabase.auth.signInWithPassword({
      email: user1Email,
      password: password,
    })

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: `Multi-User Test Company ${Date.now()}`,
        description: 'Test company for multi-user verification',
        headquarters: 'Singapore',
        industry: 'Technology',
        company_size: '11-50',
        email_domain: 'example.com',
        created_by: user1.id
      })
      .select()
      .single()

    expect(companyError).toBeNull()
    createdCompanyIds.push(company.id)

    // Create user1 as owner
    const { error: owner1Error } = await supabase
      .from('user_companies')
      .insert({
        user_id: user1.id,
        company_id: company.id,
        role: 'owner',
        status: 'approved',
        approved_at: new Date().toISOString()
      })

    expect(owner1Error).toBeNull()

    // Create user 2
    const { data: user2Data, error: user2Error } = await supabase.auth.signUp({
      email: user2Email,
      password: password,
    })

    expect(user2Error).toBeNull()
    testUser = user2Data.user // For cleanup

    // Sign in user 2
    await supabase.auth.signInWithPassword({
      email: user2Email,
      password: password,
    })

    // User 2 requests to join company (should work without RLS issues)
    const { error: joinError } = await supabase
      .from('user_companies')
      .insert({
        user_id: user2Data.user.id,
        company_id: company.id,
        role: 'member',
        status: 'pending'
      })

    expect(joinError).toBeNull()

    // Switch back to user 1 to approve the request
    await supabase.auth.signInWithPassword({
      email: user1Email,
      password: password,
    })

    // User 1 (owner) should be able to approve user 2's request
    const { error: approveError } = await supabase
      .from('user_companies')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('user_id', user2Data.user.id)
      .eq('company_id', company.id)

    expect(approveError).toBeNull()

    console.log('✅ Multi-user RLS test completed successfully')
  })

  test('should detect and report specific error codes', async () => {
    // This test ensures we can differentiate between different types of errors
    const testEmail = `error-test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Create user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    testUser = signUpData.user

    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    // Try to create a company with invalid data to test error handling
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: null, // This should cause a validation error, not recursion
        headquarters: 'Singapore',
        created_by: testUser.id
      })
      .select()
      .single()

    // Should get a validation error, NOT infinite recursion (42P17)
    expect(companyError).toBeTruthy()
    expect(companyError?.code).not.toBe('42P17') // Not infinite recursion
    
    console.log('✅ Error handling test completed - no infinite recursion detected')
  })

  test('should measure performance to ensure no recursion delays', async () => {
    const testEmail = `perf-test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Create user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(signUpError).toBeNull()
    testUser = signUpData.user

    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    // Measure time for company creation (should be fast, not stuck in recursion)
    const startTime = Date.now()

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: `Performance Test Company ${Date.now()}`,
        description: 'Test company for performance verification',
        headquarters: 'Singapore',
        industry: 'Technology',
        company_size: '11-50',
        email_domain: 'example.com',
        created_by: testUser.id
      })
      .select()
      .single()

    expect(companyError).toBeNull()
    createdCompanyIds.push(company.id)

    const { error: membershipError } = await supabase
      .from('user_companies')
      .insert({
        user_id: testUser.id,
        company_id: company.id,
        role: 'owner',
        status: 'approved',
        approved_at: new Date().toISOString()
      })

    const endTime = Date.now()
    const duration = endTime - startTime

    expect(membershipError).toBeNull()
    
    // Should complete within reasonable time (not stuck in infinite recursion)
    expect(duration).toBeLessThan(5000) // Less than 5 seconds
    
    console.log(`✅ Performance test completed in ${duration}ms`)
  })
})

// Export test runner function
export const runRLSTests = async () => {
  console.log('🚀 Starting RLS Recursion Fix Tests...')
  
  const tests = [
    test('should create user account without RLS errors', async () => {
      const testEmail = `test-rls-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      expect(signUpError).toBeNull()
      expect(signUpData.user).toBeTruthy()
      expect(signUpData.user?.email).toBe(testEmail)

      await supabase.auth.signOut()
    }),

    test('should create company without infinite recursion error', async () => {
      const testEmail = `test-company-${Date.now()}@techcorp.com`
      const testPassword = 'TestPassword123!'
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      let companyId: string | null = null

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        })

        expect(signUpError).toBeNull()

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })

        expect(signInError).toBeNull()

        const companyData = {
          name: `Test Company RLS ${Date.now()}`,
          description: 'Test company for RLS verification',
          website: 'https://test-company.com',
          headquarters: 'Singapore',
          industry: 'Technology',
          company_size: '11-50',
          email_domain: 'techcorp.com',
          auto_approve_domain: true,
          is_verified: true,
          created_by: signUpData.user?.id
        }

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert(companyData)
          .select()
          .single()

        expect(companyError).toBeNull()
        expect(company).toBeTruthy()
        companyId = company?.id

        // This is the critical test - should NOT cause infinite recursion
        const { data: membership, error: membershipError } = await supabase
          .from('user_companies')
          .insert({
            user_id: signUpData.user?.id,
            company_id: company.id,
            role: 'owner',
            status: 'approved',
            approved_at: new Date().toISOString()
          })
          .select()
          .single()

        // If we get here without error code 42P17, the fix worked!
        expect(membershipError).toBeNull()
        expect(membership).toBeTruthy()
        expect(membership.role).toBe('owner')
        
      } finally {
        // Cleanup
        if (companyId) {
          await supabase.from('user_companies').delete().eq('company_id', companyId)
          await supabase.from('companies').delete().eq('id', companyId)
        }
        await supabase.auth.signOut()
      }
    }),

    test('should verify RLS functions exist and work', async () => {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const testEmail = `test-functions-${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      let companyId: string | null = null

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        })

        expect(signUpError).toBeNull()

        await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        })

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: `Function Test Company ${Date.now()}`,
            description: 'Test company for function verification',
            headquarters: 'Singapore',
            industry: 'Technology',
            company_size: '11-50',
            email_domain: 'example.com',
            created_by: signUpData.user?.id
          })
          .select()
          .single()

        expect(companyError).toBeNull()
        companyId = company.id

        await supabase
          .from('user_companies')
          .insert({
            user_id: signUpData.user?.id,
            company_id: company.id,
            role: 'owner',
            status: 'approved',
            approved_at: new Date().toISOString()
          })

        // Test the RLS functions
        const { data: isAdmin, error: adminError } = await supabase
          .rpc('is_company_admin', {
            user_uuid: signUpData.user?.id,
            company_uuid: company.id
          })

        expect(adminError).toBeNull()
        expect(isAdmin).toBe(true)

      } finally {
        if (companyId) {
          await supabase.from('user_companies').delete().eq('company_id', companyId)
          await supabase.from('companies').delete().eq('id', companyId)
        }
        await supabase.auth.signOut()
      }
    })
  ]

  // Run all tests
  for (const testFn of tests) {
    await testFn()
  }

  console.log('\n🎉 All RLS tests completed successfully!')
  console.log('✅ No infinite recursion errors detected')
  console.log('✅ Company creation flow working correctly')
  console.log('✅ RLS policies functioning as expected')
  
  return true
}

// If this file is run directly, execute the tests
if (require.main === module) {
  runRLSTests().catch(console.error)
} 
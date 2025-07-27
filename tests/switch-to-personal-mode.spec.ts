import { test, expect } from '@playwright/test'

test.describe('Switch to Personal Mode', () => {
  // Helper function to create test user data
  function createTestUser() {
    const timestamp = Date.now()
    return {
      email: `switch.test.${timestamp}@company.com`,
      password: 'TestPassword123!'
    }
  }

  // Helper function to create test company data
  function createTestCompany() {
    const timestamp = Date.now()
    return {
      name: `Switch Test Corp ${timestamp}`,
      email_domain: 'company.com',
      industry: 'Technology',
      size: '11-50',
      location: 'Singapore'
    }
  }

  // Helper function to sign in a user
  async function signInUser(page: any, testUser: any) {
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 })
    
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Create your account')).toBeVisible()
    
    await page.getByLabel('Email address *').fill(testUser.email)
    await page.getByLabel('Password *').fill(testUser.password)
    await page.getByRole('button', { name: 'Create account' }).click()
    
    await page.waitForTimeout(3000)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
  }

  // Helper function to wait for jobs to load
  async function waitForJobsToLoad(page: any) {
    await page.waitForTimeout(2000)
    // Look for either job cards or personal mode indicator
    try {
      await page.waitForSelector('text=Personal Mode', { timeout: 5000 })
    } catch {
      // Jobs might already be loaded or we're in a different state
    }
  }

  test('should switch from company mode to personal mode successfully', async ({ page }) => {
    const testUser = createTestUser()
    
    // Step 1: Create user and company
    await page.goto('/')
    await signInUser(page, testUser)
    
    // Wait for page to load after signin
    await waitForJobsToLoad(page)
    
    // Create a company
    const companyData = createTestCompany()
    const personalModeButton = page.getByText('Personal Mode')
    await expect(personalModeButton).toBeVisible({ timeout: 5000 })
    await personalModeButton.click()
    await page.waitForTimeout(1000)
    
    await page.getByText('Add New Company').click()
    await page.waitForTimeout(2000)
    
    // Fill company form
    await page.getByLabel('Company Name').fill(companyData.name)
    await page.getByLabel('Email Domain *').fill(companyData.email_domain)
    await page.getByLabel('Description').fill('Test company for mode switching')
    await page.getByLabel('Location').fill(companyData.location)
    await page.getByLabel('Industry').fill(companyData.industry)
    
    const sizeSelect = page.getByLabel('Company Size')
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption(companyData.size)
    }
    
    await page.getByRole('button', { name: 'Create Company' }).click()
    
    // Step 2: Verify we're in company mode after creation
    await page.waitForTimeout(3000)
    await expect(page).toHaveURL('/', { timeout: 10000 })
    
    const companyModeButton = page.getByText(companyData.name).first()
    await expect(companyModeButton).toBeVisible({ timeout: 5000 })
    console.log('✅ Successfully in company mode')
    
    const hasDashboardContent = await page.getByText('Dashboard').isVisible() || 
                              await page.getByText('Post a Job').isVisible() ||
                              await page.getByText('Job Postings').isVisible()
    expect(hasDashboardContent).toBe(true)
    console.log('✅ Employer dashboard visible in company mode')
    
    // Step 3: Switch to Personal Mode
    await companyModeButton.click()
    await page.waitForTimeout(1000)
    
    const switchToPersonalOption = page.getByText('Switch to Personal Mode')
    await expect(switchToPersonalOption).toBeVisible({ timeout: 5000 })
    console.log('✅ Switch to Personal Mode option visible in dropdown')
    
    await switchToPersonalOption.click()
    console.log('✅ Clicked Switch to Personal Mode')
    
    // Wait for switch to complete
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')
    
    const backToPersonalMode = page.getByText('Personal Mode')
    await expect(backToPersonalMode).toBeVisible({ timeout: 10000 })
    console.log('✅ Successfully switched back to personal mode')
    
    // Step 4: Verify job search interface is visible (personal mode behavior)
    const hasJobSearchInterface = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                 await page.getByText('Find your next opportunity').isVisible() ||
                                 await page.getByText('Browse').isVisible()
    
    expect(hasJobSearchInterface).toBe(true)
    console.log('✅ Job search interface visible in personal mode')
    
    // Step 5: Verify employer dashboard is hidden
    const hasEmployerDashboard = await page.getByText('Post a Job').isVisible() ||
                                await page.getByText('Job Postings').isVisible()
    
    expect(hasEmployerDashboard).toBe(false)
    console.log('✅ Employer dashboard correctly hidden in personal mode')
    
    // Step 6: Verify company is still available for switching back
    await backToPersonalMode.click()
    await page.waitForTimeout(1000)
    
    const availableCompany = page.getByText(companyData.name).first()
    await expect(availableCompany).toBeVisible()
    console.log('✅ Company visible in available companies list')
    
    // Step 7: Switch back to company mode
    await availableCompany.click()
    await page.waitForTimeout(2000)
    
    const companyModeAgain = page.getByText(companyData.name).first()
    await expect(companyModeAgain).toBeVisible()
    console.log('✅ Successfully switched back to company mode')
    
    console.log('🎉 COMPLETE SUCCESS: Switch to Personal Mode functionality works perfectly!')
  })

  test('should persist mode selection after page refresh', async ({ page }) => {
    const testUser = createTestUser()
    
    // Step 1: Create user and company
    await page.goto('/')
    await signInUser(page, testUser)
    await waitForJobsToLoad(page)
    
    // Create a company
    const companyData = createTestCompany()
    const personalModeButton = page.getByText('Personal Mode')
    await expect(personalModeButton).toBeVisible({ timeout: 5000 })
    await personalModeButton.click()
    await page.waitForTimeout(1000)
    
    await page.getByText('Add New Company').click()
    await page.waitForTimeout(2000)
    
    // Fill company form
    await page.getByLabel('Company Name').fill(companyData.name)
    await page.getByLabel('Email Domain *').fill(companyData.email_domain)
    await page.getByLabel('Description').fill('Test company for mode switching')
    await page.getByLabel('Location').fill(companyData.location)
    await page.getByLabel('Industry').fill(companyData.industry)
    
    const sizeSelect = page.getByLabel('Company Size')
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption(companyData.size)
    }
    
    await page.getByRole('button', { name: 'Create Company' }).click()
    
    // Step 2: Verify we're in company mode
    await page.waitForTimeout(3000)
    await expect(page).toHaveURL('/', { timeout: 10000 })
    
    const companyModeButton = page.getByText(companyData.name).first()
    await expect(companyModeButton).toBeVisible({ timeout: 5000 })
    
    const hasDashboardContent = await page.getByText('Dashboard').isVisible() || 
                              await page.getByText('Post a Job').isVisible() ||
                              await page.getByText('Job Postings').isVisible()
    expect(hasDashboardContent).toBe(true)
    console.log('✅ Initial company mode established')
    
    // Step 3: Refresh page and verify company mode persists
    await page.reload()
    await page.waitForTimeout(3000)
    
    const companyAfterRefresh = page.getByText(companyData.name).first()
    await expect(companyAfterRefresh).toBeVisible({ timeout: 10000 })
    
    const hasDashboardAfterRefresh = await page.getByText('Dashboard').isVisible() || 
                                   await page.getByText('Post a Job').isVisible() ||
                                   await page.getByText('Job Postings').isVisible()
    expect(hasDashboardAfterRefresh).toBe(true)
    console.log('✅ Company mode persisted after page refresh')
    
    // Step 4: Switch to Personal Mode
    await companyAfterRefresh.click()
    await page.waitForTimeout(1000)
    
    const switchToPersonalOption = page.getByText('Switch to Personal Mode')
    await expect(switchToPersonalOption).toBeVisible({ timeout: 5000 })
    await switchToPersonalOption.click()
    
    // Wait for switch to complete
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle')
    
    const personalMode = page.getByText('Personal Mode')
    await expect(personalMode).toBeVisible({ timeout: 10000 })
    
    const hasJobSearchInterface = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                 await page.getByText('Find your next opportunity').isVisible() ||
                                 await page.getByText('Browse').isVisible()
    expect(hasJobSearchInterface).toBe(true)
    
    const hasEmployerDashboard = await page.getByText('Post a Job').isVisible() ||
                                await page.getByText('Job Postings').isVisible()
    expect(hasEmployerDashboard).toBe(false)
    console.log('✅ Switched to personal mode successfully')
    
    // Step 5: Refresh page and verify personal mode persists
    await page.reload()
    await page.waitForTimeout(3000)
    
    const personalModeAfterRefresh = page.getByText('Personal Mode')
    await expect(personalModeAfterRefresh).toBeVisible({ timeout: 10000 })
    
    const hasJobSearchAfterRefresh = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                    await page.getByText('Find your next opportunity').isVisible() ||
                                    await page.getByText('Browse').isVisible()
    expect(hasJobSearchAfterRefresh).toBe(true)
    
    const hasEmployerAfterRefresh = await page.getByText('Post a Job').isVisible() ||
                                   await page.getByText('Job Postings').isVisible()
    expect(hasEmployerAfterRefresh).toBe(false)
    console.log('✅ Personal mode persisted after page refresh')
    
    // Step 6: Switch back to company and verify persistence again
    await personalModeAfterRefresh.click()
    await page.waitForTimeout(1000)
    
    const availableCompany = page.getByText(companyData.name).first()
    await expect(availableCompany).toBeVisible()
    await availableCompany.click()
    await page.waitForTimeout(2000)
    
    const companyModeAgain = page.getByText(companyData.name).first()
    await expect(companyModeAgain).toBeVisible()
    
    const hasDashboardAgain = await page.getByText('Dashboard').isVisible() || 
                             await page.getByText('Post a Job').isVisible() ||
                             await page.getByText('Job Postings').isVisible()
    expect(hasDashboardAgain).toBe(true)
    console.log('✅ Switched back to company mode')
    
    // Step 7: Final refresh test
    await page.reload()
    await page.waitForTimeout(3000)
    
    const finalCompanyMode = page.getByText(companyData.name).first()
    await expect(finalCompanyMode).toBeVisible({ timeout: 10000 })
    
    const finalDashboard = await page.getByText('Dashboard').isVisible() || 
                          await page.getByText('Post a Job').isVisible() ||
                          await page.getByText('Job Postings').isVisible()
    expect(finalDashboard).toBe(true)
    console.log('✅ Company mode persisted after final page refresh')
    
    console.log('🎉 COMPLETE SUCCESS: Mode persistence across page refreshes works perfectly!')
  })
}) 
import { test, expect } from '@playwright/test';

test.describe('Company Creation Redirect to Employer Dashboard', () => {
  let testEmail: string;
  let testPassword: string;
  let testCompanyName: string;

  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `redirect.test.${timestamp}@company.com`;
    testPassword = 'TestPassword123!';
    testCompanyName = `Redirect Test Corp ${timestamp}`;
    
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should redirect to home page and show employer dashboard after company creation', async ({ page }) => {
    // Track all console messages to debug form submission
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(message);
      console.log(`BROWSER: ${message}`);
    });

    // Step 1: Sign up with new user
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Switch to sign up modal
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Create your account')).toBeVisible();
    
    await page.getByLabel('Email address *').fill(testEmail);
    await page.getByLabel('Password *').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Wait for signup completion
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Step 2: Navigate to company creation
    const personalModeButton = page.getByText('Personal Mode');
    await expect(personalModeButton).toBeVisible({ timeout: 5000 });
    await personalModeButton.click();
    await page.waitForTimeout(1000);
    
    await page.getByText('Add New Company').click();
    await page.waitForTimeout(2000);
    
    // Step 3: Fill and submit company creation form
    await expect(page).toHaveURL('/company/create');
    
    // Fill required fields first
    await page.getByLabel('Company Name').fill(testCompanyName);
    await page.getByLabel('Email Domain *').fill('company.com');
    await page.getByLabel('Description').fill('Test company for redirect verification');
    await page.getByLabel('Location').fill('Singapore');
    await page.getByLabel('Industry').fill('Technology');
    
    const sizeSelect = page.getByLabel('Company Size');
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption('11-50');
    }
    
    // Verify submit button is enabled before clicking
    const submitButton = page.getByRole('button', { name: 'Create Company' });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    console.log('✅ Submit button is enabled');
    
    // Submit the form
    await submitButton.click();
    console.log('✅ Submit button clicked');
    
    // Step 4: CRITICAL - Verify redirect to home page (not staying on creation page)
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
    console.log('✅ Successfully redirected to home page');
    
    // Step 5: Verify we're now in company mode (not personal mode)
    const companyModeButton = page.getByText(testCompanyName).first();
    await expect(companyModeButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Company mode activated - company name visible in header');
    
    // Step 6: Verify employer dashboard is shown (not job search interface)
    const hasDashboardContent = await page.getByText('Dashboard').isVisible() || 
                               await page.getByText('Post a Job').isVisible() ||
                               await page.getByText('Job Postings').isVisible() ||
                               await page.getByText('Employer').isVisible();
    
    expect(hasDashboardContent).toBe(true);
    console.log('✅ Employer dashboard content is visible');
    
    // Step 7: Verify we're NOT seeing the job search interface (which would indicate personal mode)
    const hasJobSearchInterface = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                  await page.getByText('Find your next opportunity').isVisible();
    
    // We should NOT see job search interface when in company mode on home page
    expect(hasJobSearchInterface).toBe(false);
    console.log('✅ Job search interface correctly hidden in company mode');
    
    // Step 8: Verify company selector shows correct state
    await companyModeButton.click();
    await page.waitForTimeout(1000);
    
    // Should show "Current Mode" with company details
    await expect(page.getByText('Current Mode')).toBeVisible();
    await expect(page.getByText(testCompanyName).first()).toBeVisible();
    await expect(page.getByText('owner').first()).toBeVisible();
    console.log('✅ Company selector shows correct owner status');
    
    // Close dropdown
    await page.keyboard.press('Escape');
    
    console.log('🎉 COMPLETE SUCCESS: Company creation redirects to home and shows employer dashboard!');
  });

  test('should allow switching back to personal mode from employer dashboard', async ({ page }) => {
    // This test ensures the complete multi-tenant flow works
    
    // Step 1: Create company (same as above)
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Create your account')).toBeVisible();
    
    await page.getByLabel('Email address *').fill(testEmail);
    await page.getByLabel('Password *').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    const personalModeButton = page.getByText('Personal Mode');
    await expect(personalModeButton).toBeVisible({ timeout: 5000 });
    await personalModeButton.click();
    await page.waitForTimeout(1000);
    
    await page.getByText('Add New Company').click();
    await page.waitForTimeout(2000);
    
    await page.getByLabel('Company Name').fill(testCompanyName);
    await page.getByLabel('Email Domain *').fill('company.com');
    await page.getByLabel('Description').fill('Test company for mode switching');
    await page.getByLabel('Location').fill('Singapore');
    await page.getByLabel('Industry').fill('Technology');
    
    const sizeSelect = page.getByLabel('Company Size');
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption('11-50');
    }
    
    await page.getByRole('button', { name: 'Create Company' }).click();
    
    // Should redirect to home and show employer dashboard
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL('/');
    
    const companyModeButton = page.getByText(testCompanyName).first();
    await expect(companyModeButton).toBeVisible();
    
    // Step 2: Switch back to personal mode via dropdown
    await companyModeButton.click();
    await page.waitForTimeout(1000);
    
    // Look for the full text "Switch to Personal Mode" in the dropdown
    const switchToPersonalOption = page.getByText('Switch to Personal Mode');
    await expect(switchToPersonalOption).toBeVisible({ timeout: 5000 });
    await switchToPersonalOption.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Verify we're back in personal mode
    const backToPersonalMode = page.getByText('Personal Mode');
    await expect(backToPersonalMode).toBeVisible();
    console.log('✅ Successfully switched back to personal mode');
    
    // Step 4: Verify job search interface is now visible (personal mode)
    const hasJobSearchInterface = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                  await page.getByText('Find your next opportunity').isVisible();
    
    expect(hasJobSearchInterface).toBe(true);
    console.log('✅ Job search interface visible in personal mode');
    
    console.log('🎉 COMPLETE SUCCESS: Multi-tenant mode switching works correctly!');
  });
}); 
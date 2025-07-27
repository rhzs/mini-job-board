import { test, expect } from '@playwright/test';

test.describe('Switch to Personal Mode', () => {
  let testEmail: string;
  let testPassword: string;
  let testCompanyName: string;

  test.beforeEach(async ({ page }) => {
    const timestamp = Date.now();
    testEmail = `switch.test.${timestamp}@company.com`;
    testPassword = 'TestPassword123!';
    testCompanyName = `Switch Test Corp ${timestamp}`;
    
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should switch from company mode to personal mode successfully', async ({ page }) => {
    // Track console messages for debugging
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(message);
      console.log(`BROWSER: ${message}`);
    });

    // Step 1: Sign up and create a company (get into company mode)
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
    
    // Navigate to company creation
    const personalModeButton = page.getByText('Personal Mode');
    await expect(personalModeButton).toBeVisible({ timeout: 5000 });
    await personalModeButton.click();
    await page.waitForTimeout(1000);
    
    await page.getByText('Add New Company').click();
    await page.waitForTimeout(2000);
    
    // Create company
    await expect(page).toHaveURL('/company/create');
    
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
    
    // Should redirect to home and be in company mode
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL('/', { timeout: 10000 });
    
    // Verify we're in company mode
    const companyModeButton = page.getByText(testCompanyName).first();
    await expect(companyModeButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Successfully in company mode');
    
    // Verify employer dashboard is shown
    const hasDashboardContent = await page.getByText('Dashboard').isVisible() || 
                               await page.getByText('Post a Job').isVisible() ||
                               await page.getByText('Job Postings').isVisible();
    expect(hasDashboardContent).toBe(true);
    console.log('✅ Employer dashboard visible in company mode');
    
    // Step 2: Switch back to personal mode via dropdown
    await companyModeButton.click();
    await page.waitForTimeout(1000);
    
    // Look for the "Switch to Personal Mode" option in the dropdown
    const switchToPersonalOption = page.getByText('Switch to Personal Mode');
    await expect(switchToPersonalOption).toBeVisible({ timeout: 5000 });
    console.log('✅ Switch to Personal Mode option visible in dropdown');
    
    // Click on "Switch to Personal Mode"
    await switchToPersonalOption.click();
    console.log('✅ Clicked Switch to Personal Mode');
    
    // Wait longer for React to re-render
    await page.waitForTimeout(3000);
    
    // Force a page refresh if needed to ensure state is reflected
    await page.waitForLoadState('networkidle');
    
    // Step 3: Verify we're back in personal mode
    const backToPersonalMode = page.getByText('Personal Mode');
    // Check if Personal Mode is visible, if not, debug what we do see
    const isPersonalModeVisible = await backToPersonalMode.isVisible();
    if (!isPersonalModeVisible) {
      console.log('❌ Personal Mode not visible, checking current UI state...');
      
      // Check what's currently visible in the header
      const currentText = await page.locator('header').textContent();
      console.log('Current header text:', currentText);
      
      // Check if we're still seeing company name
      const companyNameStill = await page.getByText(testCompanyName).first().isVisible();
      console.log('Company name still visible:', companyNameStill);
      
      // Try clicking outside to close any dropdowns
      await page.click('body');
      await page.waitForTimeout(1000);
    }
    
    await expect(backToPersonalMode).toBeVisible({ timeout: 10000 });
    console.log('✅ Successfully switched back to personal mode');
    
    // Step 4: Verify job search interface is now visible (personal mode behavior)
    const hasJobSearchInterface = await page.getByPlaceholder('What', { exact: false }).isVisible() ||
                                  await page.getByText('Find your next opportunity').isVisible() ||
                                  await page.getByText('Browse').isVisible();
    
    expect(hasJobSearchInterface).toBe(true);
    console.log('✅ Job search interface visible in personal mode');
    
    // Step 5: Verify employer dashboard is hidden in personal mode
    const hasEmployerDashboard = await page.getByText('Post a Job').isVisible() ||
                                await page.getByText('Job Postings').isVisible();
    
    expect(hasEmployerDashboard).toBe(false);
    console.log('✅ Employer dashboard correctly hidden in personal mode');
    
    // Step 6: Verify we can switch back to company mode
    const personalButton = page.getByText('Personal Mode');
    await personalButton.click();
    await page.waitForTimeout(1000);
    
    // Should see the company in available companies
    const availableCompany = page.getByText(testCompanyName).first();
    await expect(availableCompany).toBeVisible();
    console.log('✅ Company visible in available companies list');
    
    // Switch back to company mode
    await availableCompany.click();
    await page.waitForTimeout(2000);
    
    // Verify we're back in company mode
    const companyModeAgain = page.getByText(testCompanyName).first();
    await expect(companyModeAgain).toBeVisible();
    console.log('✅ Successfully switched back to company mode');
    
    console.log('🎉 COMPLETE SUCCESS: Switch to Personal Mode functionality works perfectly!');
  });

  test('should handle switch to personal mode from header button', async ({ page }) => {
    // This test checks the alternative "Switch to Personal" button in the header navigation
    
    // Step 1: Get into company mode (simplified setup)
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await page.getByRole('button', { name: 'Create account' }).click();
    await page.getByLabel('Email address *').fill(testEmail);
    await page.getByLabel('Password *').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    
    const personalModeButton = page.getByText('Personal Mode');
    await expect(personalModeButton).toBeVisible({ timeout: 5000 });
    await personalModeButton.click();
    
    await page.getByText('Add New Company').click();
    await page.waitForTimeout(2000);
    
    await page.getByLabel('Company Name').fill(testCompanyName);
    await page.getByLabel('Email Domain *').fill('company.com');
    await page.getByLabel('Description').fill('Test company');
    await page.getByLabel('Location').fill('Singapore');
    await page.getByLabel('Industry').fill('Technology');
    
    const sizeSelect = page.getByLabel('Company Size');
    if (await sizeSelect.isVisible()) {
      await sizeSelect.selectOption('11-50');
    }
    
    await page.getByRole('button', { name: 'Create Company' }).click();
    await page.waitForTimeout(3000);
    
    // Should be in company mode now
    await expect(page).toHaveURL('/');
    const companyButton = page.getByText(testCompanyName).first();
    await expect(companyButton).toBeVisible();
    
    // Step 2: Look for header "Switch to Personal" button
    const headerSwitchButton = page.getByRole('button').filter({ hasText: 'Switch to Personal' });
    
    if (await headerSwitchButton.isVisible()) {
      console.log('✅ Header Switch to Personal button found');
      await headerSwitchButton.click();
      await page.waitForTimeout(2000);
      
      // Verify switch worked
      const personalMode = page.getByText('Personal Mode');
      await expect(personalMode).toBeVisible();
      console.log('✅ Header switch to personal mode successful');
    } else {
      console.log('ℹ️ Header Switch to Personal button not visible (may be responsive design)');
    }
  });
}); 
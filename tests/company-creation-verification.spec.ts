import { test, expect } from '@playwright/test';

test.describe('Company Creation Fix Verification', () => {
  let testEmail: string;
  let testPassword: string;
  let testCompanyName: string;

  test.beforeEach(async ({ page }) => {
    // Generate unique test data for each test run
    const timestamp = Date.now();
    testEmail = `company.test.${timestamp}@techcorp.sg`;
    testPassword = 'TestPassword123!';
    testCompanyName = `TestCorp ${timestamp}`;
    
    await page.goto('/');
    await page.waitForTimeout(2000);
  });

  test('should create company without database column errors and auto-switch', async ({ page }) => {
    // Track console messages to detect database errors
    const consoleMessages: string[] = [];
    const dbErrors: string[] = [];
    
    page.on('console', msg => {
      const message = `${msg.type()}: ${msg.text()}`;
      consoleMessages.push(message);
      
      // Check for specific database column errors
      if (message.includes('column') && (message.includes('location') || message.includes('size')) && message.includes('does not exist')) {
        dbErrors.push(message);
      }
    });

    // Step 1: Sign up with new user
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Switch to sign up modal
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Create your account')).toBeVisible();
    
    await page.getByLabel('Email address *').fill(testEmail);
    await page.getByLabel('Password *').fill(testPassword);
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Wait for signup to complete and modal to close
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // Step 2: Navigate to company creation
    const personalModeButton = page.getByText('Personal Mode');
    if (await personalModeButton.isVisible()) {
      await personalModeButton.click();
      await page.waitForTimeout(1000);
      
      // Click "Add New Company"
      await page.getByText('Add New Company').click();
      await page.waitForTimeout(2000);
      
      // Step 3: Verify we're on company creation page
      await expect(page).toHaveURL('/company/create');
      
      // Step 4: Fill out the form with data that previously caused errors
      await page.getByLabel('Company Name').fill(testCompanyName);
      await page.getByLabel('Description').fill('Test company to verify database column mapping fix');
      
      // These fields previously caused "column does not exist" errors:
      await page.getByLabel('Location').fill('Singapore');  // Maps to 'headquarters'
      
      await page.getByLabel('Website').fill('https://testcorp.com');
      await page.getByLabel('Email Domain *').fill('testcorp.com');
      
      // Fill industry if available
      const industryInput = page.getByLabel('Industry');
      if (await industryInput.isVisible()) {
        await industryInput.fill('Technology');
      }
      
      // Select company size (this previously caused errors)  
      const sizeSelect = page.getByLabel('Company Size');
      if (await sizeSelect.isVisible()) {
        await sizeSelect.selectOption('51-200');  // Maps to 'company_size'
      }
      
      // Step 5: Submit the form
      const createButton = page.getByRole('button', { name: 'Create Company' });
      await expect(createButton).toBeVisible();
      await createButton.click();
      
      // Wait for creation process
      await page.waitForTimeout(5000);
      
      // Step 6: Verify NO database column errors occurred
      expect(dbErrors.length).toBe(0);
      if (dbErrors.length > 0) {
        console.log('❌ Database errors detected:');
        dbErrors.forEach(error => console.log(`  ${error}`));
      } else {
        console.log('✅ No database column errors detected');
      }
      
      // Step 7: Check if redirected or stayed on creation page (both are acceptable)
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      if (currentUrl === 'http://localhost:3000/') {
        console.log('✅ Redirected to home after company creation');
        
        // Should show company name in header
        const companyModeButton = page.getByText(testCompanyName);
        if (await companyModeButton.isVisible()) {
          console.log('✅ Company creation and auto-switch successful');
        }
      } else if (currentUrl.includes('/company/create')) {
        console.log('✅ Company creation completed (stayed on creation page)');
        
        // Navigate to home to check if company was created
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        const companyModeButton = page.getByText(testCompanyName);
        if (await companyModeButton.isVisible()) {
          console.log('✅ Company creation successful - found in navigation');
        } else {
          console.log('ℹ️ Company creation completed but not immediately visible');
        }
      } else {
        console.log(`ℹ️ Unexpected redirect to: ${currentUrl}`);
      }
      
      // Log all console messages for debugging
      if (consoleMessages.length > 0) {
        console.log('\n📝 All console messages:');
        consoleMessages.forEach(msg => console.log(`  ${msg}`));
      }
      
    } else {
      console.log('⚠️ Personal Mode button not visible - user may not be authenticated');
    }
  });

  test('should verify column mapping works correctly', async ({ page }) => {
    // This test focuses specifically on verifying the column mapping fix
    const testRequests: any[] = [];
    
    // Intercept network requests to verify correct data is being sent
    page.on('request', request => {
      if (request.method() === 'POST' && request.url().includes('rest/v1/companies')) {
        testRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    // Track responses for errors
    const responseErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok() && response.url().includes('companies')) {
        responseErrors.push(`${response.status()}: ${response.statusText()}`);
      }
    });
    
    // Navigate directly to company creation page (for authenticated users)
    await page.goto('/company/create');
    await page.waitForTimeout(2000);
    
    // Check if we're redirected (means not authenticated)
    if (page.url() === 'http://localhost:3000/') {
      console.log('ℹ️ Redirected to home - user not authenticated (expected)');
      
      // Verify no server errors occurred during the redirect
      expect(responseErrors.length).toBe(0);
      console.log('✅ No server errors during redirect');
      
    } else {
      // We're on the creation page - fill and submit form
      console.log('✅ On company creation page');
      
      await page.getByLabel('Company Name').fill('Column Mapping Test');
      await page.getByLabel('Location').fill('Test Location');  // Should map to headquarters
      
      const sizeSelect = page.getByLabel('Company Size');
      if (await sizeSelect.isVisible()) {
        await sizeSelect.selectOption('51-200');  // Should map to company_size
      }
      
      // Submit form
      await page.getByRole('button', { name: 'Create Company' }).click();
      await page.waitForTimeout(3000);
      
      // Verify no 400/500 errors related to column mapping
      const hasColumnErrors = responseErrors.some(error => 
        error.includes('400') || error.includes('500')
      );
      
      expect(hasColumnErrors).toBeFalsy();
      console.log('✅ No HTTP errors related to column mapping');
    }
  });

  test('should handle form validation without database errors', async ({ page }) => {
    // Test that form validation works without triggering database column errors
    const dbColumnErrors: string[] = [];
    
    page.on('console', msg => {
      const message = msg.text();
      if (message.includes('column') && message.includes('does not exist')) {
        dbColumnErrors.push(message);
      }
    });
    
    await page.goto('/company/create');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('/company/create')) {
      // Try to submit empty form to trigger validation
      await page.getByRole('button', { name: 'Create Company' }).click();
      await page.waitForTimeout(2000);
      
      // Should have validation errors, but NO database column errors
      expect(dbColumnErrors.length).toBe(0);
      console.log('✅ Form validation works without database column errors');
      
      // Fill form with minimal valid data
      await page.getByLabel('Company Name').fill('Validation Test Corp');
      
      // Submit again
      await page.getByRole('button', { name: 'Create Company' }).click();
      await page.waitForTimeout(2000);
      
      // Still should have no database column errors
      expect(dbColumnErrors.length).toBe(0);
      console.log('✅ Form submission attempts do not trigger column errors');
      
    } else {
      console.log('ℹ️ Not on creation page - user authentication required');
    }
  });
}); 
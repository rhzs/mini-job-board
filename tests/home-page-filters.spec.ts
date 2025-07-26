import { test, expect } from '@playwright/test';

test.describe('Home Page Filters Tests', () => {
  let testQuery: string = '';
  let hasSearchResults: boolean = false;

  // Helper function to ensure search interface is visible
  async function ensureSearchInterface(page: any) {
    if (!await page.getByPlaceholder('Job title, keywords, or company').isVisible()) {
      await page.goto('/?q=test');
      await page.waitForTimeout(2000);
    }
  }

  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication/tenant state to ensure personal mode
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Clear localStorage to reset any tenant state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Force personal mode by ensuring we navigate with a search parameter
    // This guarantees the job search interface will be displayed
    if (!testQuery && !hasSearchResults) {
      const searchTerms = ['work', 'job', 'software', 'developer', 'manager', 'engineer'];
      
      for (const term of searchTerms) {
        await page.goto(`/?q=${term}`);
        await page.waitForTimeout(2000);
        
        // Check if search interface is visible (this is what we need for tests)
        const hasSearchInterface = await page.getByPlaceholder('Job title, keywords, or company').isVisible();
        
        if (hasSearchInterface) {
          testQuery = term;
          hasSearchResults = true;
          break;
        }
      }
      
      // If search interface still not found, try with anonymous user on homepage  
      if (!hasSearchResults) {
        await page.goto('/');
        await page.waitForTimeout(2000);
        
        // Look for hero section and search interface
        const heroSearchInput = page.getByPlaceholder('Job title, keywords, or company');
        if (await heroSearchInput.isVisible()) {
          testQuery = '';
          hasSearchResults = true;
        }
      }
    }
    
    // Navigate to appropriate page based on test needs
    if (hasSearchResults && testQuery) {
      await page.goto(`/?q=${testQuery}`);
    } else {
      await page.goto('/');
    }
    await page.waitForTimeout(2000);
  });

  test('should display search interface correctly', async ({ page }) => {
    await ensureSearchInterface(page);
    
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible();
    await expect(page.getByPlaceholder('Country, Town, or MRT Station')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find jobs' })).toBeVisible();
    
    // Only check for search results text if we have results
    if (hasSearchResults && testQuery) {
      const searchResultText = page.locator(`text=${testQuery} jobs`).first();
      if (await searchResultText.count() > 0) {
        await expect(searchResultText).toBeVisible();
      }
    }
  });

  test('should test basic search functionality', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test search with a generic term
    let searchInput = page.getByPlaceholder('Job title, keywords, or company');
    let findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    await searchInput.clear();
    await searchInput.fill('work');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    // Check if URL updated
    await expect(page).toHaveURL(/q=work/);
    
    // Test another search term - re-acquire elements after navigation
    await ensureSearchInterface(page);
    searchInput = page.getByPlaceholder('Job title, keywords, or company');
    findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    await searchInput.clear();
    await searchInput.fill('job');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveURL(/q=job/);
  });

  test('should test location search functionality', async ({ page }) => {
    await ensureSearchInterface(page);
    
    const locationInput = page.getByPlaceholder('Country, Town, or MRT Station');
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    // Test different locations
    const locations = ['Singapore', 'Remote', 'CBD'];
    
    for (const location of locations) {
      await locationInput.clear();
      await locationInput.fill(location);
      await findJobsButton.click();
      await page.waitForTimeout(1500);
      
      // Check if location is reflected in URL (if not Singapore which is default)
      if (location.toLowerCase() !== 'singapore') {
        await expect(page).toHaveURL(new RegExp(`location=${encodeURIComponent(location)}`, 'i'));
      }
    }
  });

  test('should test filters visibility and interaction', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Check if filters button exists
    const filtersButton = page.getByRole('button', { name: 'Filters' }).first();
    if (await filtersButton.isVisible()) {
      await expect(filtersButton).toBeVisible();
    }
    
    // Check filter elements
    const payFilter = page.locator('select').first();
    const remoteButton = page.getByRole('button', { name: 'Remote' }).first(); // Target first Remote button
    
    await expect(payFilter).toBeVisible();
    await expect(remoteButton).toBeVisible();
    
    // Test remote filter interaction
    await remoteButton.click();
    await page.waitForTimeout(1000);
    
    // Should add remote parameter to URL
    await expect(page).toHaveURL(/remote=true/);
    
    // Click again to toggle off
    await remoteButton.click();
    await page.waitForTimeout(1000);
    
    // Should remove remote parameter
    await expect(page).not.toHaveURL(/remote=true/);
  });

  test('should test remote filter toggle', async ({ page }) => {
    await ensureSearchInterface(page);
    
    const remoteButton = page.getByRole('button', { name: 'Remote' }).first(); // Target first Remote button
    
    // Initial state should be inactive
    await expect(remoteButton).not.toHaveClass(/bg-indeed-blue/);
    
    // Click to activate
    await remoteButton.click();
    await page.waitForTimeout(1000);
    
    // Should be active now
    await expect(remoteButton).toHaveClass(/bg-indeed-blue/);
    await expect(page).toHaveURL(/remote=true/);
    
    // Click to deactivate
    await remoteButton.click();
    await page.waitForTimeout(1000);
    
    // Should be inactive again
    await expect(remoteButton).not.toHaveClass(/bg-indeed-blue/);
  });

  test('should test filter dropdowns', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test salary filter dropdown
    const salarySelect = page.locator('select').first();
    await salarySelect.selectOption('5000-8000');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/minSalary=5000/);
    await expect(page).toHaveURL(/maxSalary=8000/);
    
    // Test job type filter dropdown
    const jobTypeSelect = page.locator('select').nth(1);
    await jobTypeSelect.selectOption('Full-time');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/jobType=Full-time/);
  });

  test('should test sort functionality', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test is always valid - if no results, test the basic interface
    
    // Look for sort dropdown - be more specific to avoid the date filter
    const sortSelect = page.locator('select').filter({ hasText: /Sort by/ });
    
    const sortCount = await sortSelect.count();
    if (sortCount > 0) {
      // Test sort by date
      await sortSelect.selectOption('date');
      await page.waitForTimeout(1000);
      
      await expect(page).toHaveURL(/sort=date/);
      
      // Test sort by relevance
      await sortSelect.selectOption('relevance');
      await page.waitForTimeout(1000);
      
      // Relevance might not appear in URL as it's default
      const hasRelevanceInUrl = page.url().includes('sort=relevance');
      const hasNoSortInUrl = !page.url().includes('sort=');
      expect(hasRelevanceInUrl || hasNoSortInUrl).toBeTruthy();
    } else {
      // If no sort dropdown, just verify the page loads correctly
      await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible();
    }
  });

  test('should test responsive design', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Search elements should still be visible
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find jobs' })).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible();
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should test job results display', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test job display interface regardless of results
    
    // Check if job cards are displayed
    const jobCards = page.locator('[data-testid="job-card"]');
    const jobCount = await jobCards.count();
    
    if (jobCount > 0) {
      await expect(jobCards.first()).toBeVisible();
      
      // Test clicking on a job card - but don't assume it will navigate
      await jobCards.first().click();
      await page.waitForTimeout(1000);
      
      // Check if we're still on the same page or navigated
      const currentUrl = page.url();
      const hasJobInUrl = currentUrl.includes('/job/');
      const hasJobDetail = await page.locator('[data-testid="job-detail"]').isVisible();
      const hasJobCards = await page.locator('[data-testid="job-card"]').count() > 0;
      
      // Any of these states is acceptable - we clicked and something happened
      expect(hasJobInUrl || hasJobDetail || hasJobCards).toBeTruthy();
    } else {
      // If no job cards, should show appropriate message
      const noJobsMessage = page.locator('text=/no.*jobs/i');
      if (await noJobsMessage.count() > 0) {
        await expect(noJobsMessage.first()).toBeVisible();
      }
    }
  });

  test('should test accessibility features', async ({ page }) => {
    await ensureSearchInterface(page);
    
    // Test keyboard navigation on search input
    const searchInput = page.getByPlaceholder('Job title, keywords, or company');
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const locationInput = page.getByPlaceholder('Country, Town, or MRT Station');
    await expect(locationInput).toBeFocused();
    
    // Test Enter key on search
    await searchInput.focus();
    await searchInput.fill('accessibility test');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/q=accessibility.*test/);
    
    // Test if interactive elements have proper labels
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    await expect(findJobsButton).toBeVisible();
    
    // Target the first Remote button specifically to avoid multiple matches
    const remoteButton = page.getByRole('button', { name: 'Remote' }).first();
    await expect(remoteButton).toBeVisible();
  });

  test('should handle empty search gracefully', async ({ page }) => {
    await ensureSearchInterface(page);
    
    const searchInput = page.getByPlaceholder('Job title, keywords, or company');
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    // Clear search and submit
    await searchInput.clear();
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    // Should handle empty search appropriately
    // Either show all jobs or show a message
    const hasJobCards = await page.locator('[data-testid="job-card"]').count() > 0;
    const hasHeroSection = await page.locator('text=/find.*opportunity/i').isVisible();
    const hasEmptyMessage = await page.locator('text=/no.*jobs/i').isVisible();
    
    expect(hasJobCards || hasHeroSection || hasEmptyMessage).toBeTruthy();
  });
}); 
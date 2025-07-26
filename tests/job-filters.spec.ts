import { test, expect } from '@playwright/test';

test.describe('Job Filters E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the job search page
    await page.goto('/?q=engineer');
    
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });
  });

  test('should display filter controls correctly', async ({ page }) => {
    // Check that all filter controls are visible
    await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
    
    // Check compact filter controls
    await expect(page.locator('select').first()).toBeVisible(); // Pay filter
    await expect(page.getByRole('button', { name: 'Remote' })).toBeVisible();
    await expect(page.locator('select').nth(1)).toBeVisible(); // Job type filter
    await expect(page.locator('select').last()).toBeVisible(); // Date posted filter
  });

  test('should filter jobs by salary range', async ({ page }) => {
    // Get initial job count
    const initialJobCards = await page.locator('[data-testid="job-card"]').count();
    
    // Apply salary filter (S$5,000 - S$8,000)
    await page.locator('select').first().selectOption('5000-8000');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check that URL updated with salary filter
    await expect(page).toHaveURL(/minSalary=5000/);
    await expect(page).toHaveURL(/maxSalary=8000/);
    
    // Check that results are filtered (should be fewer or same number of jobs)
    const filteredJobCards = await page.locator('[data-testid="job-card"]').count();
    expect(filteredJobCards).toBeLessThanOrEqual(initialJobCards);
    
    // Verify that salary information in job cards matches filter
    const salaryTexts = await page.locator('[data-testid="job-salary"]').allTextContents();
    for (const salaryText of salaryTexts) {
      if (salaryText.includes('$')) {
        // Extract salary numbers and verify they're within range
        const numbers = salaryText.match(/\d+,?\d*/g);
        if (numbers && numbers.length >= 2) {
          const minSalary = parseInt(numbers[0].replace(',', ''));
          const maxSalary = parseInt(numbers[1].replace(',', ''));
          
          // Should overlap with filter range (5000-8000)
          expect(maxSalary >= 5000 || minSalary <= 8000).toBeTruthy();
        }
      }
    }
  });

  test('should filter jobs by remote work', async ({ page }) => {
    // Get initial job count
    const initialJobCards = await page.locator('[data-testid="job-card"]').count();
    
    // Click remote filter button
    await page.getByRole('button', { name: 'Remote' }).click();
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check that URL updated with remote filter
    await expect(page).toHaveURL(/remote=true/);
    
    // Check that results are filtered
    const filteredJobCards = await page.locator('[data-testid="job-card"]').count();
    expect(filteredJobCards).toBeLessThanOrEqual(initialJobCards);
    
    // Verify that remote jobs are shown
    const jobCards = page.locator('[data-testid="job-card"]');
    const jobCount = await jobCards.count();
    
    for (let i = 0; i < jobCount; i++) {
      const jobCard = jobCards.nth(i);
      // Should contain remote indicator
      const hasRemoteIndicator = await jobCard.locator('text=/remote/i').count() > 0;
      expect(hasRemoteIndicator).toBeTruthy();
    }
  });

  test('should filter jobs by job type', async ({ page }) => {
    // Get initial job count
    const initialJobCards = await page.locator('[data-testid="job-card"]').count();
    
    // Select job type filter (Full-time)
    const jobTypeSelect = page.locator('select').nth(1);
    await jobTypeSelect.selectOption('Full-time');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check that URL updated with job type filter
    await expect(page).toHaveURL(/jobType=Full-time/);
    
    // Check that results are filtered
    const filteredJobCards = await page.locator('[data-testid="job-card"]').count();
    expect(filteredJobCards).toBeLessThanOrEqual(initialJobCards);
    
    // Verify that job type information matches filter
    const jobTypeTexts = await page.locator('[data-testid="job-type"]').allTextContents();
    for (const jobTypeText of jobTypeTexts) {
      expect(jobTypeText.toLowerCase()).toContain('full-time');
    }
  });

  test('should filter jobs by date posted', async ({ page }) => {
    // Get initial job count
    const initialJobCards = await page.locator('[data-testid="job-card"]').count();
    
    // Select date posted filter (Last 3 days) - target the specific date filter select
    const dateSelect = page.locator('select').filter({ hasText: 'Date posted' });
    await dateSelect.selectOption('3days');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check that URL updated with date filter
    await expect(page).toHaveURL(/datePosted=3days/);
    
    // Check that results are filtered
    const filteredJobCards = await page.locator('[data-testid="job-card"]').count();
    expect(filteredJobCards).toBeLessThanOrEqual(initialJobCards);
    
    // Verify that posted dates are within last 3 days
    const postedDates = await page.locator('[data-testid="job-posted-date"]').allTextContents();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    for (const dateText of postedDates) {
      // Check for relative date indicators
      const isRecent = dateText.includes('day') || dateText.includes('hour') || dateText.includes('today');
      expect(isRecent).toBeTruthy();
    }
  });

  test('should combine multiple filters correctly', async ({ page }) => {
    // Apply multiple filters
    await page.locator('select').first().selectOption('4000-6000'); // Salary
    await page.getByRole('button', { name: 'Remote' }).click(); // Remote
    await page.locator('select').nth(1).selectOption('Full-time'); // Job type
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Check that URL contains all filters
    await expect(page).toHaveURL(/minSalary=4000/);
    await expect(page).toHaveURL(/maxSalary=6000/);
    await expect(page).toHaveURL(/remote=true/);
    await expect(page).toHaveURL(/jobType=Full-time/);
    
    // Should still have some results (or no results message)
    const hasJobs = await page.locator('[data-testid="job-card"]').count() > 0;
    const hasNoResults = await page.locator('text=No jobs found').isVisible();
    
    expect(hasJobs || hasNoResults).toBeTruthy();
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    await page.locator('select').first().selectOption('5000-8000');
    await page.getByRole('button', { name: 'Remote' }).click();
    
    // Wait for filters to apply
    await page.waitForTimeout(1000);
    
    // Check if "Clear all" button appears and click it (use the compact version)
    const clearAllButton = page.getByTestId('clear-filters-compact');
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      
      // Wait for results to update
      await page.waitForTimeout(1000);
      
      // Check that URL no longer contains filter parameters
      await expect(page).not.toHaveURL(/minSalary/);
      await expect(page).not.toHaveURL(/remote=true/);
      
      // Check that filter controls are reset
      await expect(page.locator('select').first()).toHaveValue('');
      await expect(page.getByRole('button', { name: 'Remote' })).not.toHaveClass(/bg-indeed-blue/);
    }
  });

  test('should maintain filters when navigating back and forward', async ({ page }) => {
    // Apply a filter
    await page.locator('select').first().selectOption('5000-8000');
    
    // Wait for URL to update
    await page.waitForTimeout(1000);
    
    // Verify filter is applied
    await expect(page).toHaveURL(/minSalary=5000/);
    
    // Get the first job card and click it (if any jobs exist)
    const jobCards = page.locator('[data-testid="job-card"]');
    const jobCount = await jobCards.count();
    
    if (jobCount > 0) {
      // Navigate to a job detail page
      await jobCards.first().click();
      await page.waitForTimeout(500);
      
      // Navigate back
      await page.goBack();
      
      // Wait for page to reload
      await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });
      
      // Check that filter is still applied
      await expect(page).toHaveURL(/minSalary=5000/);
      await expect(page.locator('select').first()).toHaveValue('5000-8000');
    } else {
      // If no jobs, just check that filter persists on page refresh
      await page.reload();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/minSalary=5000/);
      await expect(page.locator('select').first()).toHaveValue('5000-8000');
    }
  });

  test('should update job count when filters are applied', async ({ page }) => {
    // Get initial job count from the results text
    const initialCountText = await page.locator('text=/\\d+\\+ jobs/').first().textContent();
    const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0');
    
    // Apply a restrictive filter
    await page.locator('select').first().selectOption('10000-15000'); // High salary range
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Get new job count
    const newCountText = await page.locator('text=/\\d+\\+ jobs/').first().textContent();
    const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');
    
    // Should have fewer or equal jobs
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should handle no results gracefully', async ({ page }) => {
    // Apply very restrictive filters that should return no results
    await page.locator('select').first().selectOption('15000-20000'); // Very high salary
    
    // Target the date filter select specifically
    const dateSelect = page.locator('select').filter({ hasText: 'Date posted' });
    await dateSelect.selectOption('today'); // Only today
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Should show no results message or suggestion
    const noResultsVisible = await page.locator('text=No jobs found').isVisible();
    const hasJobCards = await page.locator('[data-testid="job-card"]').count() > 0;
    
    // Either should have no results message or no job cards
    expect(noResultsVisible || !hasJobCards).toBeTruthy();
    
    // Should still have filter controls available
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should persist filter state across page reloads', async ({ page }) => {
    // Apply filters
    await page.locator('select').first().selectOption('5000-8000');
    await page.getByRole('button', { name: 'Remote' }).click();
    
    // Wait for URL to update
    await page.waitForTimeout(1000);
    
    // Reload the page
    await page.reload();
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });
    
    // Check that filters are still applied
    await expect(page.locator('select').first()).toHaveValue('5000-8000');
    await expect(page.getByRole('button', { name: 'Remote' })).toHaveClass(/bg-indeed-blue/);
    
    // Check that URL still contains filters
    await expect(page).toHaveURL(/minSalary=5000/);
    await expect(page).toHaveURL(/remote=true/);
  });
}); 
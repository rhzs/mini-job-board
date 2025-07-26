import { test, expect } from '@playwright/test';

test.describe('Home Page Filters Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?q=developer');
    await page.waitForTimeout(3000);
  });

  test('should display search interface correctly', async ({ page }) => {
    await expect(page.getByPlaceholder('Job title, keywords, or company')).toBeVisible();
    await expect(page.getByPlaceholder('Country, Town, or MRT Station')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find jobs' })).toBeVisible();
    
    await expect(page.getByText('developer jobs').first()).toBeVisible();
  });

  test('should test basic search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Job title, keywords, or company');
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    await searchInput.clear();
    await searchInput.fill('frontend');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    await expect(page.getByText('frontend jobs').first()).toBeVisible();
    
    await searchInput.clear();
    await searchInput.fill('designer');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    await expect(page.getByText('designer jobs').first()).toBeVisible();
  });

  test('should test location search functionality', async ({ page }) => {
    const locationInput = page.getByPlaceholder('Country, Town, or MRT Station');
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    await locationInput.clear();
    await locationInput.fill('Jakarta');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
    
    await locationInput.clear();
    await locationInput.fill('Singapore');
    await findJobsButton.click();
    await page.waitForTimeout(2000);
  });

  test('should test filters visibility and interaction', async ({ page }) => {
    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await expect(filtersButton).toBeVisible();
    
    const remoteButton = page.getByRole('button', { name: 'Remote' });
    if (await remoteButton.isVisible()) {
      await expect(remoteButton).toBeVisible();
      await expect(remoteButton).toBeEnabled();
    }
    
    const dropdowns = page.locator('select');
    const dropdownCount = await dropdowns.count();
    
    for (let i = 0; i < Math.min(dropdownCount, 3); i++) {
      await expect(dropdowns.nth(i)).toBeVisible();
    }
  });

  test('should test remote filter toggle', async ({ page }) => {
    const remoteButton = page.getByRole('button', { name: 'Remote' });
    
    if (await remoteButton.isVisible()) {
      const initialClass = await remoteButton.getAttribute('class');
      await remoteButton.click();
      await page.waitForTimeout(1000);
      
      const newClass = await remoteButton.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });

  test('should test filter dropdowns', async ({ page }) => {
    const payDropdown = page.locator('select').first();
    
    if (await payDropdown.count() > 0) {
      await expect(payDropdown).toBeVisible();
      
      const options = payDropdown.locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(1);
    }
  });

  test('should test sort functionality', async ({ page }) => {
    const sortDropdown = page.locator('select').filter({ hasText: 'Sort by' });
    
    if (await sortDropdown.count() > 0) {
      await expect(sortDropdown).toBeVisible();
      await sortDropdown.selectOption('date');
      await page.waitForTimeout(1000);
      
      await sortDropdown.selectOption('relevance');
      await page.waitForTimeout(1000);
    }
  });

  test('should test responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const filtersButton = page.getByRole('button', { name: 'Filters' });
    await expect(filtersButton).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(filtersButton).toBeVisible();
  });

  test('should test job results display', async ({ page }) => {
    const jobCards = page.locator('.cursor-pointer').or(page.locator('[data-testid*="job"]'));
    
    if (await jobCards.count() > 0) {
      await expect(jobCards.first()).toBeVisible();
      
      await jobCards.first().click();
      await page.waitForTimeout(1000);
    }
    
    const resultsCount = page.getByText(/\d+\+ jobs/);
    if (await resultsCount.count() > 0) {
      await expect(resultsCount.first()).toBeVisible();
    }
  });

  test('should test accessibility features', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Job title, keywords, or company');
    const locationInput = page.getByPlaceholder('Country, Town, or MRT Station');
    const findJobsButton = page.getByRole('button', { name: 'Find jobs' });
    
    await searchInput.focus();
    await expect(searchInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(locationInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(findJobsButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  });
}); 
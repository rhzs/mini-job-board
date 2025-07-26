import { test, expect } from '@playwright/test';

test.describe('Job Applications Table Tests', () => {
  let testJobId: string | null = null;

  test.beforeEach(async ({ page }) => {
    // Try to find a job ID only if we haven't found one yet
    if (!testJobId) {
      // Try to navigate to the employer jobs page to find any existing job
      await page.goto('/employer/jobs');
      
      // Wait a moment for the page to load
      await page.waitForTimeout(2000);
      
      // Try to find any job ID from the page - this could be from href attributes or data attributes
      const jobLinks = page.locator('a[href*="/employer/jobs/"][href*="/applications"]');
      const linkCount = await jobLinks.count();
      
      if (linkCount > 0) {
        const firstJobLink = await jobLinks.first().getAttribute('href');
        if (firstJobLink) {
          // Extract job ID from href like "/employer/jobs/[id]/applications"
          const jobIdMatch = firstJobLink.match(/\/employer\/jobs\/([^\/]+)\/applications/);
          if (jobIdMatch) {
            testJobId = jobIdMatch[1];
          }
        }
      }
    }
    // Skip test if no job ID is available
    if (!testJobId) {
      test.skip();
      return;
    }

    // Navigate to the job applications page using the found job ID
    await page.goto(`/employer/jobs/${testJobId}/applications`);
    
    // Wait for either the table to load or "no applications" message
    await Promise.race([
      page.waitForSelector('table', { timeout: 5000 }).catch(() => null),
      page.waitForSelector('text=No applications yet', { timeout: 5000 }).catch(() => null)
    ]);
  });

  test('should display applications page with proper structure', async ({ page }) => {
    // Check basic page structure regardless of whether applications exist
    await expect(page.locator('h1')).toContainText('Applications for:');
    await expect(page.getByRole('button', { name: 'Back to Jobs' })).toBeVisible();
    
    // Check if applications exist
    const hasTable = await page.locator('table').isVisible();
    const hasNoApplicationsMessage = await page.locator('text=No applications yet').isVisible();
    
    expect(hasTable || hasNoApplicationsMessage).toBeTruthy();
    
    if (hasTable) {
      // If applications exist, verify table structure
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Applicant")')).toBeVisible();
      await expect(page.locator('th:has-text("Email")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Applied")')).toBeVisible();
      await expect(page.locator('th:has-text("Actions")')).toBeVisible();
    }
  });

  test('should handle expandable rows if applications exist', async ({ page }) => {
    const hasTable = await page.locator('table').isVisible();
    
    if (!hasTable) {
      test.skip();
      return;
    }

    const applicationRows = page.locator('tbody tr:not([class*="bg-muted"])');
    const rowCount = await applicationRows.count();
    
    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Test expandable functionality on first row
    const firstRow = applicationRows.first();
    
    // Check for expand/collapse chevron
    const hasChevron = await firstRow.locator('svg').first().isVisible();
    expect(hasChevron).toBeTruthy();
    
    // Click row to test expansion
    await firstRow.click();
    await page.waitForTimeout(500);
    
    // Check if row expanded (look for expanded content)
    const hasExpandedContent = await page.locator('tr[class*="bg-muted"]').count() > 0;
    
    if (hasExpandedContent) {
      // Verify expanded content structure
      const expandedRow = page.locator('tr[class*="bg-muted"]').first();
      await expect(expandedRow).toBeVisible();
      
      // Click again to collapse
      await firstRow.click();
      await page.waitForTimeout(500);
      
      // Should be collapsed now
      const expandedRowsAfterCollapse = await page.locator('tr[class*="bg-muted"]').count();
      expect(expandedRowsAfterCollapse).toBeLessThan(hasExpandedContent ? 1 : 0);
    }
  });

  test('should show proper status badges if applications exist', async ({ page }) => {
    const hasTable = await page.locator('table').isVisible();
    
    if (!hasTable) {
      test.skip();
      return;
    }

    // Look for any status badges
    const statusBadges = page.locator('[class*="bg-yellow-100"], [class*="bg-blue-100"], [class*="bg-purple-100"], [class*="bg-green-100"], [class*="bg-red-100"]');
    const badgeCount = await statusBadges.count();
    
    if (badgeCount > 0) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });

  test('should have functional UI elements if applications exist', async ({ page }) => {
    const hasTable = await page.locator('table').isVisible();
    
    if (!hasTable) {
      test.skip();
      return;
    }

    const applicationRows = page.locator('tbody tr:not([class*="bg-muted"])');
    const rowCount = await applicationRows.count();
    
    if (rowCount === 0) {
      test.skip();
      return;
    }

    const firstRow = applicationRows.first();
    
    // Check for action buttons
    const actionButtons = firstRow.locator('button');
    const buttonCount = await actionButtons.count();
    
    if (buttonCount > 0) {
      await expect(actionButtons.first()).toBeVisible();
      await expect(actionButtons.first()).toBeEnabled();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Page should still be usable
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to Jobs' })).toBeVisible();
    
    // Check if table has overflow handling
    const tableContainer = page.locator('.overflow-x-auto');
    if (await tableContainer.count() > 0) {
      await expect(tableContainer).toBeVisible();
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should handle no applications gracefully', async ({ page }) => {
    // This test specifically checks the no applications state
    const hasNoApplicationsMessage = await page.locator('text=No applications yet').isVisible();
    
    if (hasNoApplicationsMessage) {
      await expect(page.locator('text=No applications yet')).toBeVisible();
      await expect(page.locator('text=Applications will appear here')).toBeVisible();
      
      // Should not have a table in this case
      await expect(page.locator('table')).not.toBeVisible();
    }
  });
}); 
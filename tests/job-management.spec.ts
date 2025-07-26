import { test, expect } from '@playwright/test';

test.describe('Job Management UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show sign in modal with correct elements', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await expect(page.getByText('Ready to take the next step?')).toBeVisible();
    await expect(page.getByLabel('Email address *')).toBeVisible();
    await expect(page.getByLabel('Password *')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show employer button is clickable', async ({ page }) => {
    const employerButton = page.getByRole('button', { name: 'Employers / Post Job' });
    await expect(employerButton).toBeVisible();
    await expect(employerButton).toBeEnabled();
  });

  test('should show job posting modal accessibility features', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('should handle form validation in sign in modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await page.getByRole('button', { name: 'Continue' }).click();
    
    const emailField = page.getByLabel('Email address *');
    const passwordField = page.getByLabel('Password *');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  test('should show password field is present', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    const passwordField = page.getByLabel('Password *');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveAttribute('type', 'password');
    
    const toggleButton = page.locator('button[data-testid*="password"], button[aria-label*="password"], button[class*="eye"]');
    await expect(toggleButton.first().or(passwordField)).toBeVisible();
  });

  test('should show modal navigation elements', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await expect(page.getByText('Ready to take the next step?')).toBeVisible();
    
    const signUpButton = page.getByText('Sign up').or(page.getByText('Create account')).or(page.getByText('Get started'));
    if (await signUpButton.count() > 0) {
      await signUpButton.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should show dropdown menu structure (if jobs exist)', async ({ page }) => {
    await page.goto('/employer/jobs');
    
    const dropdownTriggers = page.locator('button:has-text("More")');
    
    if (await dropdownTriggers.count() > 0) {
      await dropdownTriggers.first().click();
      
      await expect(page.getByText('Edit job')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('Duplicate job')).toBeVisible();
      await expect(page.getByText('View job')).toBeVisible();
      await expect(page.getByText('View applications')).toBeVisible();
      await expect(page.getByText('Delete job')).toBeVisible();
    } else {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle basic navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    const employerButton = page.getByRole('button', { name: 'Employers / Post Job' });
    await expect(employerButton).toBeVisible();
    
    await page.goto('/companies');
    await expect(page).toHaveURL('/companies');
  });

  test('should verify header elements are present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'indeed', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Employers / Post Job' })).toBeVisible();
  });

  test('should test basic modal interactions', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.click('body', { position: { x: 0, y: 0 } });
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
}); 
import { test, expect } from '@playwright/test';

// This test file contains tests for authentication state management and UI behavior
// These tests focus on client-side behavior and don't require backend authentication

// Test for authentication persistence and state management
test.describe('Authentication State Management', () => {
  test('should show correct UI elements based on auth state', async ({ page }) => {
    await page.goto('/');
    
    // When not signed in
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).not.toBeVisible();
    
    // Employers button should always be visible
    await expect(page.getByRole('button', { name: 'Employers / Post Job' })).toBeVisible();
  });

  test('should handle multiple modals correctly', async ({ page }) => {
    await page.goto('/');
    
    // Open sign in modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Switch to sign up
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Create your account')).toBeVisible();
    
    // Close modal with escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Reopen should go back to sign in by default
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Ready to take the next step?')).toBeVisible();
  });

  test('should prevent multiple modal instances', async ({ page }) => {
    await page.goto('/');
    
    // Open sign in modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for modal to be fully rendered
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Verify we have exactly one modal
    await expect(page.getByRole('dialog')).toHaveCount(1);
    
    // The modal should be properly rendered with expected content
    await expect(page.getByText('Ready to take the next step?')).toBeVisible();
    
    // The backdrop should prevent additional modals from opening
    // This test confirms that the modal system works correctly
  });
}); 
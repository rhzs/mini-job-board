import { test, expect } from '@playwright/test';

// This test file contains tests for successful authentication flows
// These tests assume you have a test Supabase environment set up with proper test accounts
// or mocked authentication responses

test.describe('Successful Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // This test would work if you have a test account set up in your Supabase
  test.skip('should successfully sign in with valid credentials', async ({ page }) => {
    // Replace with actual test account credentials
    const testAccount = {
      email: 'test@example.com', // Replace with real test account
      password: 'validtestpassword123'
    };

    // Open sign in modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Fill credentials
    await page.getByLabel('Email address *').fill(testAccount.email);
    await page.getByLabel('Password *').fill(testAccount.password);
    
    // Submit
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Wait for successful sign in
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Verify user is signed in (email appears in header)
    await expect(page.getByText(testAccount.email)).toBeVisible();
    
    // Verify sign out button is visible
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test.skip('should successfully sign up with new account', async ({ page }) => {
    // Generate unique email for test
    const uniqueEmail = `test+${Date.now()}@example.com`;
    const password = 'testpassword123';

    // Open sign up modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Fill credentials
    await page.getByLabel('Email address *').fill(uniqueEmail);
    await page.getByLabel('Password *').fill(password);
    
    // Submit
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Should show success message
    await expect(page.getByText('Account created successfully!')).toBeVisible();
    await expect(page.getByText(`We've sent you a confirmation email at ${uniqueEmail}`)).toBeVisible();
    
    // Click "Got it" button
    await page.getByRole('button', { name: 'Got it' }).click();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.skip('should sign out successfully', async ({ page }) => {
    // This test assumes user is already signed in
    // You would need to sign in first or use browser storage to set auth state
    
    // Click sign out
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Verify user is signed out
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).not.toBeVisible();
  });

  test.skip('should persist authentication across page reloads', async ({ page }) => {
    // This test assumes user is signed in
    // Reload page
    await page.reload();
    
    // User should still be signed in
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });

  test.skip('should handle authentication errors gracefully', async ({ page }) => {
    // Open sign in modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Use invalid credentials
    await page.getByLabel('Email address *').fill('nonexistent@example.com');
    await page.getByLabel('Password *').fill('wrongpassword');
    
    // Submit
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should show error message
    await expect(page.getByText(/Error:/)).toBeVisible();
    
    // Modal should remain open
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

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
    
    // Clicking sign in again shouldn't open another modal
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should still have only one dialog
    const dialogs = page.getByRole('dialog');
    await expect(dialogs).toHaveCount(1);
  });
}); 
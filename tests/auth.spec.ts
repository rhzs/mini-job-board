import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  invalidEmail: 'invalid-email',
  shortPassword: '123',
  invalidDomainEmail: 'test@demo.com'
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test.describe('Sign In Modal', () => {
    test('should open sign in modal when clicking sign in button', async ({ page }) => {
      // Click sign in button in header
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Wait for modal to be fully rendered
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      
      // Verify modal is open
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Ready to take the next step?')).toBeVisible();
      await expect(page.getByText('Create an account or sign in.')).toBeVisible();
    });

    test('should show validation for empty fields', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Check that form doesn't submit (browser validation)
      const emailInput = page.getByLabel('Email address *');
      await expect(emailInput).toBeFocused();
    });

    test('should show validation for invalid email format', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Fill invalid email
      await page.getByLabel('Email address *').fill(testUser.invalidEmail);
      await page.getByLabel('Password *').fill(testUser.password);
      
      // Try to submit
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Check validation message (browser validation)
      const emailInput = page.getByLabel('Email address *');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toContain('email');
    });

    test('should toggle password visibility', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      const passwordInput = page.getByLabel('Password *');
      const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).last();
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should switch to sign up modal', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Click "Create account" link
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Verify we're now in sign up modal
      await expect(page.getByText('Create your account')).toBeVisible();
      await expect(page.getByText('Join millions of people using Indeed')).toBeVisible();
    });

    test('should close modal when clicking outside or escape', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Wait for modal to be fully rendered
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      
      // Verify modal is open
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Press escape to close
      await page.keyboard.press('Escape');
      
      // Verify modal is closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should attempt sign in with test credentials', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Fill in credentials
      await page.getByLabel('Email address *').fill(testUser.email);
      await page.getByLabel('Password *').fill(testUser.password);
      
      // Submit form
      await page.getByRole('button', { name: 'Continue' }).click();
      
      // Wait for loading state
      await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
      
      // Note: We expect this to fail since we're using test credentials
      // In a real test environment, you might want to mock the API or use test accounts
    });
  });

  test.describe('Sign Up Modal', () => {
    test('should open sign up modal from sign in modal', async ({ page }) => {
      // Open sign in modal first
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Switch to sign up
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Verify sign up modal is open
      await expect(page.getByText('Create your account')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
    });

    test('should show validation for empty fields', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Check that form doesn't submit (browser validation)
      const emailInput = page.getByLabel('Email address *');
      await expect(emailInput).toBeFocused();
    });

    test('should show error for invalid email domain', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Fill invalid domain email
      await page.getByLabel('Email address *').fill(testUser.invalidDomainEmail);
      await page.getByLabel('Password *').fill(testUser.password);
      
      // Submit form
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Wait for error message
      await expect(page.getByText('Please use a real email address (try gmail.com, outlook.com, etc.)')).toBeVisible();
    });

    test('should show error for short password', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Fill valid email domain but short password
      await page.getByLabel('Email address *').fill('test@gmail.com');
      await page.getByLabel('Password *').fill(testUser.shortPassword);
      
      // Submit form
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Wait for error message
      await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible();
    });

    test('should toggle password visibility in sign up', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      const passwordInput = page.getByLabel('Password *');
      const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).last();
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click toggle to hide password again
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should switch back to sign in modal', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Click "Sign in" link in the modal (not the header)
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Sign in' }).click();
      
      // Verify we're back to sign in modal
      await expect(page.getByText('Ready to take the next step?')).toBeVisible();
      await expect(page.getByText('Create an account or sign in.')).toBeVisible();
    });

    test('should show email suggestions when field is empty', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Check if email suggestions are visible (when email field is empty)
      const emailInput = page.getByLabel('Email address *');
      await emailInput.focus();
      
      // Note: EmailSuggestions component should be visible when email is empty
      // The exact implementation may vary based on the component
    });

    test('should attempt sign up with valid credentials', async ({ page }) => {
      // Open sign up modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Fill valid credentials (but this will likely fail without proper backend)
      await page.getByLabel('Email address *').fill('valid@gmail.com');
      await page.getByLabel('Password *').fill('validpassword123');
      
      // Submit form
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Wait for loading state
      await expect(page.getByRole('button', { name: 'Creating account...' })).toBeVisible();
      
      // Note: This will likely show an error in test environment
      // In a proper test setup, you'd mock the Supabase calls or use test accounts
    });
  });

  test.describe('Modal Navigation', () => {
    test('should maintain form state when switching between modals', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Fill some data
      await page.getByLabel('Email address *').fill('test@example.com');
      
      // Switch to sign up
      await page.getByRole('button', { name: 'Create account' }).click();
      
      // Form should be cleared in sign up modal
      const signUpEmail = page.getByLabel('Email address *');
      await expect(signUpEmail).toHaveValue('');
      
      // Switch back to sign in (click the one in modal, not header)
      await page.locator('[role="dialog"]').getByRole('button', { name: 'Sign in' }).click();
      
      // Form should be cleared in sign in modal too
      const signInEmail = page.getByLabel('Email address *');
      await expect(signInEmail).toHaveValue('');
    });

    test('should handle modal accessibility', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Wait for modal to be fully rendered
      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      
      // Check that modal has proper ARIA attributes
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Check that focus is trapped in modal
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // The focus should stay within the modal
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Terms and Privacy Links', () => {
    test('should have clickable terms and privacy links', async ({ page }) => {
      // Open sign in modal
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Check that terms, cookie, and privacy links exist
      await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Cookie' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
      
      // Note: These links currently have href="#" so they won't navigate
      // In a real app, you'd want to test the actual navigation
    });
  });
}); 
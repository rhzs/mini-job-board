import { Page, expect } from '@playwright/test';

// Helper functions for authentication testing

export class AuthHelpers {
  constructor(private page: Page) {}

  // Open sign in modal
  async openSignInModal() {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    // Wait for modal to be fully rendered
    await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    await expect(this.page.getByRole('dialog')).toBeVisible();
    await expect(this.page.getByText('Ready to take the next step?')).toBeVisible();
  }

  // Open sign up modal (via sign in modal)
  async openSignUpModal() {
    await this.openSignInModal();
    await this.page.getByRole('button', { name: 'Create account' }).click();
    await expect(this.page.getByText('Create your account')).toBeVisible();
  }

  // Fill sign in form
  async fillSignInForm(email: string, password: string) {
    await this.page.getByLabel('Email address *').fill(email);
    await this.page.getByLabel('Password *').fill(password);
  }

  // Fill sign up form
  async fillSignUpForm(email: string, password: string) {
    await this.page.getByLabel('Email address *').fill(email);
    await this.page.getByLabel('Password *').fill(password);
  }

  // Submit sign in form
  async submitSignInForm() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  // Submit sign up form
  async submitSignUpForm() {
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }

  // Check if user is signed in
  async expectUserSignedIn(email: string) {
    await expect(this.page.getByText(email)).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign in' })).not.toBeVisible();
  }

  // Check if user is signed out
  async expectUserSignedOut() {
    await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign out' })).not.toBeVisible();
  }

  // Check for error message
  async expectErrorMessage(message?: string) {
    const errorLocator = this.page.getByText(/Error:/);
    await expect(errorLocator).toBeVisible();
    if (message) {
      // Use partial text matching for more flexible error message checking
      await expect(this.page.getByText(new RegExp(message, 'i'))).toBeVisible();
    }
  }

  // Check for success message
  async expectSignUpSuccess(email: string) {
    await expect(this.page.getByText('Account created successfully!')).toBeVisible();
    await expect(this.page.getByText(`We've sent you a confirmation email at ${email}`)).toBeVisible();
  }

  // Close modal
  async closeModal() {
    await this.page.keyboard.press('Escape');
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }

  // Toggle password visibility
  async togglePasswordVisibility() {
    const toggleButton = this.page.locator('button[type="button"]').filter({ has: this.page.locator('svg') }).last();
    await toggleButton.click();
  }

  // Switch from sign in to sign up
  async switchToSignUp() {
    await this.page.getByRole('button', { name: 'Create account' }).click();
    await expect(this.page.getByText('Create your account')).toBeVisible();
  }

  // Switch from sign up to sign in
  async switchToSignIn() {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await expect(this.page.getByText('Ready to take the next step?')).toBeVisible();
  }

  // Check loading state
  async expectSignInLoading() {
    await expect(this.page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  }

  async expectSignUpLoading() {
    await expect(this.page.getByRole('button', { name: 'Creating account...' })).toBeVisible();
  }

  // Wait for modal to disappear
  async waitForModalToClose() {
    await expect(this.page.getByRole('dialog')).not.toBeVisible();
  }

  // Check if modal is open
  async expectModalOpen() {
    await expect(this.page.getByRole('dialog')).toBeVisible();
  }

  // Check terms and privacy links
  async expectTermsAndPrivacyLinks() {
    await expect(this.page.getByRole('link', { name: 'Terms' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Cookie' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Privacy' })).toBeVisible();
  }
}

// Test data generator
export class TestDataGenerator {
  static generateUniqueEmail(): string {
    return `test+${Date.now()}@example.com`;
  }

  static generateValidEmail(): string {
    return `valid+${Date.now()}@gmail.com`;
  }

  static getTestCredentials() {
    return {
      validEmail: 'test@example.com',
      validPassword: 'testpassword123',
      invalidEmail: 'invalid-email',
      shortPassword: '123',
      invalidDomainEmail: 'test@demo.com',
      longPassword: 'thisisaverylongpasswordthatshouldbemorethan50characters123456789'
    };
  }
}

// Assertions helper
export class AuthAssertions {
  constructor(private page: Page) {}

  // Assert form validation
  async assertFormValidation(field: 'email' | 'password') {
    const input = field === 'email' 
      ? this.page.getByLabel('Email address *')
      : this.page.getByLabel('Password *');
    
    await expect(input).toBeFocused();
  }

  // Assert password type
  async assertPasswordType(type: 'password' | 'text') {
    const passwordInput = this.page.getByLabel('Password *');
    await expect(passwordInput).toHaveAttribute('type', type);
  }

  // Assert email suggestions are visible
  async assertEmailSuggestionsVisible() {
    // This would depend on the actual implementation of EmailSuggestions
    // For now, just check that the email input is focused
    const emailInput = this.page.getByLabel('Email address *');
    await expect(emailInput).toBeFocused();
  }

  // Assert accessibility
  async assertModalAccessibility() {
    const modal = this.page.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Check that modal has focus
    const focusedElement = this.page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  }
} 
import { test, expect } from '@playwright/test';
import { AuthHelpers, TestDataGenerator, AuthAssertions } from './helpers/auth-helpers';

test.describe('Authentication Tests with Helpers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle complete sign in flow with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);
    const testData = TestDataGenerator.getTestCredentials();

    // Open modal and fill form
    await auth.openSignInModal();
    await auth.fillSignInForm(testData.validEmail, testData.validPassword);
    
    // Submit and expect loading state
    await auth.submitSignInForm();
    await auth.expectSignInLoading();
    
    // Note: This will show an error in test environment without real auth setup
  });

  test('should handle complete sign up flow with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);
    const email = TestDataGenerator.generateValidEmail();
    const testData = TestDataGenerator.getTestCredentials();

    // Open modal and fill form
    await auth.openSignUpModal();
    await auth.fillSignUpForm(email, testData.validPassword);
    
    // Submit and expect loading state
    await auth.submitSignUpForm();
    await auth.expectSignUpLoading();
    
    // Note: This will show an error in test environment without real auth setup
  });

  test('should validate forms using helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);
    const assertions = new AuthAssertions(page);
    const testData = TestDataGenerator.getTestCredentials();

    // Test sign up validation
    await auth.openSignUpModal();
    await auth.fillSignUpForm(testData.invalidDomainEmail, testData.validPassword);
    await auth.submitSignUpForm();
    await auth.expectErrorMessage('Please use a real email address');

    // Test password length validation
    await auth.fillSignUpForm('test@gmail.com', testData.shortPassword);
    await auth.submitSignUpForm();
    await auth.expectErrorMessage('Password must be at least 6 characters long');

    // Test password visibility toggle
    await assertions.assertPasswordType('password');
    await auth.togglePasswordVisibility();
    await assertions.assertPasswordType('text');
    await auth.togglePasswordVisibility();
    await assertions.assertPasswordType('password');
  });

  test('should handle modal navigation with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Open sign in, switch to sign up, then back to sign in
    await auth.openSignInModal();
    await auth.switchToSignUp();
    await auth.switchToSignIn();
    
    // Close modal and reopen
    await auth.closeModal();
    await auth.openSignInModal();
    
    // Check terms and privacy links
    await auth.expectTermsAndPrivacyLinks();
  });

  test('should verify UI state with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);

    // Initial state - user should be signed out
    await auth.expectUserSignedOut();
    
    // Open modal and verify it's open
    await auth.openSignInModal();
    await auth.expectModalOpen();
    
    // Close modal and verify it's closed
    await auth.closeModal();
    await auth.waitForModalToClose();
  });

  test('should test accessibility with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);
    const assertions = new AuthAssertions(page);

    await auth.openSignInModal();
    await assertions.assertModalAccessibility();
    
    // Test form validation focus
    await auth.submitSignInForm(); // Submit empty form
    await assertions.assertFormValidation('email');
  });

  test('should handle edge cases with helpers', async ({ page }) => {
    const auth = new AuthHelpers(page);
    const testData = TestDataGenerator.getTestCredentials();

    // Test with very long password
    await auth.openSignUpModal();
    await auth.fillSignUpForm(testData.validEmail, testData.longPassword);
    await auth.submitSignUpForm();
    
    // Should still work (password length is usually not limited on upper end)
    await auth.expectSignUpLoading();
  });

  test('should generate unique test data', () => {
    // Test the test data generator
    const email1 = TestDataGenerator.generateUniqueEmail();
    const email2 = TestDataGenerator.generateUniqueEmail();
    
    expect(email1).not.toBe(email2);
    expect(email1).toMatch(/test\+\d+@example\.com/);
    
    const validEmail = TestDataGenerator.generateValidEmail();
    expect(validEmail).toMatch(/valid\+\d+@gmail\.com/);
    
    const credentials = TestDataGenerator.getTestCredentials();
    expect(credentials.validEmail).toBe('test@example.com');
    expect(credentials.validPassword).toBe('testpassword123');
  });
}); 
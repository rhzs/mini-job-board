# E2E Test Suite

This directory contains end-to-end tests for the job board application using Playwright.

## Test Files

### `auth.spec.ts`
Comprehensive tests for authentication functionality including:
- Sign in modal interactions
- Sign up modal interactions  
- Form validation
- Password visibility toggle
- Modal navigation between sign in/sign up
- Error handling
- Terms and privacy links

### `auth-success-flow.spec.ts`
Tests for successful authentication flows (currently skipped):
- Successful sign in with valid credentials
- Successful sign up with new account
- Sign out functionality
- Authentication persistence
- Error handling for invalid credentials

### `auth-with-helpers.spec.ts`
Demonstrates using helper functions for cleaner tests:
- Complete authentication flows
- Form validation
- Modal navigation
- UI state verification
- Accessibility testing
- Edge cases

### `helpers/auth-helpers.ts`
Helper functions and utilities:
- `AuthHelpers` class for common authentication actions
- `TestDataGenerator` for creating test data
- `AuthAssertions` for common assertions

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## Test Setup

The tests are configured to:
- Start the development server automatically (`npm run dev`)
- Run against `http://localhost:3000`
- Use Chrome and Firefox browsers
- Take screenshots on failure
- Record videos on failure
- Generate HTML reports

## Test Data

The tests use various test credentials:
- `test@example.com` / `testpassword123` for basic testing
- Generated unique emails for sign up tests
- Invalid emails and passwords for validation testing

## Environment Setup

For successful authentication tests, you would need:
1. A test Supabase environment
2. Test user accounts in your database
3. Environment variables for test configuration

## Test Categories

### UI/UX Tests
- Modal opening/closing
- Form field interactions
- Button states and loading indicators
- Error message display

### Validation Tests
- Email format validation
- Password length validation
- Invalid domain handling
- Empty form submission

### Accessibility Tests
- Modal focus management
- Keyboard navigation
- ARIA attributes
- Screen reader compatibility

### Integration Tests
- Authentication flow end-to-end
- Error handling from API
- State management across components

## Best Practices

1. **Use Helper Functions**: Utilize the helper classes for common actions
2. **Test Real User Flows**: Focus on complete user journeys
3. **Handle Async Operations**: Properly wait for loading states and API responses
4. **Test Error Cases**: Ensure error handling works correctly
5. **Accessibility**: Include accessibility checks in tests
6. **Maintainable Selectors**: Use semantic locators (roles, labels) over CSS selectors

## Troubleshooting

### Common Issues

1. **Modal not opening**: Check if the sign in button is visible and clickable
2. **Form submission fails**: Verify form validation and required fields
3. **Timeout errors**: Increase timeouts for slow operations or network requests
4. **Flaky tests**: Add proper waits and check for element states

### Debug Tips

1. Use `--debug` flag to step through tests
2. Add `await page.pause()` to pause execution
3. Use `page.screenshot()` to capture current state
4. Check browser console for JavaScript errors

## Future Improvements

1. **Mock API Responses**: Add API mocking for more reliable tests
2. **Test Data Management**: Implement database seeding/cleanup
3. **Visual Regression**: Add screenshot comparison tests
4. **Performance Tests**: Add lighthouse audit integration
5. **Cross-browser Testing**: Expand browser coverage
6. **Mobile Testing**: Add mobile viewport tests 
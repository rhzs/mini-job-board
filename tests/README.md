# E2E Test Suite

This directory contains end-to-end tests for the job board application using Playwright.

## Test Files

| Test File | Description | Test Count | Status |
|-----------|-------------|------------|---------|
| `auth.spec.ts` | Authentication modal interactions, form validation, password visibility, modal navigation, error handling | 18 tests | ✅ Passing |
| `auth-with-helpers.spec.ts` | Authentication flows using helper functions for cleaner test code | 8 tests | ✅ Passing |
| `auth-success-flow.spec.ts` | Successful authentication flows requiring live auth setup | 8 tests | ⏭️ Skipped |
| `job-management.spec.ts` | Job management UI components, modals, dropdowns, navigation | 10 tests | ✅ Passing |
| `home-page-filters.spec.ts` | Home page search and filters functionality, responsive design, accessibility | 10 tests | ✅ Passing |

## Helper Files

| File | Purpose |
|------|---------|
| `helpers/auth-helpers.ts` | AuthHelpers class, TestDataGenerator, AuthAssertions utilities |

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed

# Run with debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- tests/auth.spec.ts

# Run only Chromium tests
npm run test:e2e -- --project=chromium

# Generate test report
npm run test:e2e:report
```

## Test Coverage

### Authentication Tests (26 passing)
- Sign in/sign up modal functionality
- Form validation (email, password, domain checks)
- Modal accessibility and keyboard navigation
- Error message handling
- Password visibility toggle
- Modal switching between sign in/sign up

### Job Management Tests (10 passing)
- Header navigation elements
- Employer button functionality
- Job posting modal accessibility
- Form field validation
- Dropdown menu structure (Edit, Duplicate, View, View Applications, Delete)
- Basic page navigation

### Home Page Filters Tests (10 passing)
- Search interface display and functionality
- Location search with different cities
- Filter visibility and interaction (Remote, Pay, Job type, Date posted)
- Sort functionality (relevance vs date)
- Responsive design across different viewport sizes
- Job results display and interaction
- Accessibility features (keyboard navigation, focus management)

## Test Configuration

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox
- **Timeout**: 15-30 seconds per test
- **Output**: Screenshots and videos on failure
- **Reports**: HTML report generated automatically

## Test Data

- `test@example.com` / `testpassword123` for basic authentication tests
- Generated unique emails for validation testing
- Invalid email domains and short passwords for error testing 
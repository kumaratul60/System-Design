# 07. Testing & Security Linting Guide

> Rules for React Testing Library, Jest, Playwright, and static security vulnerability detection.

---

## 1. Testing Library Query Priority & a11y

Using `getByRole` over `getByTestId` ensures that tests navigate the DOM just like real users and screen readers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Testing Query Priority                             │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ 1. Accessible     │ screen.getByRole('button', { name: /save/i })           │
│    (Preferred)    │ screen.getByLabelText(/username/i)                      │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 2. Semantic       │ screen.getByAltText(/company logo/i)                    │
│                   │ screen.getByPlaceholderText(/search/i)                  │
├───────────────────┼─────────────────────────────────────────────────────────┤
│ 3. Last Resort    │ screen.getByTestId('save-button')                       │
└───────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 2. Configuration Snippet

```json
{
  "plugins": ["testing-library", "jest", "security"],
  "rules": {
    "testing-library/prefer-screen-queries": "error",
    "testing-library/prefer-user-event": "error",
    "testing-library/no-await-sync-queries": "error",
    "testing-library/no-debugging-utils": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-disabled-tests": "warn",
    "jest/valid-expect": "error",
    "security/detect-eval-with-expr": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error"
  }
}
```

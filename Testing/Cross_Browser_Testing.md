# Cross-Browser & Responsive Matrix Testing

> **Scope:** Validating web applications across rendering engines (Blink, WebKit, Gecko), mobile device viewports, touch vs pointer inputs, and physical device clouds.

---

## Table of Contents

- [Cross-Browser \& Responsive Matrix Testing](#cross-browser--responsive-matrix-testing)
  - [Table of Contents](#table-of-contents)
  - [1. Engine Matrix: Blink vs. WebKit vs. Gecko](#1-engine-matrix-blink-vs-webkit-vs-gecko)
  - [2. Multi-Engine Matrix in Playwright](#2-multi-engine-matrix-in-playwright)
  - [3. Local Emulation vs. Real-Device Clouds](#3-local-emulation-vs-real-device-clouds)
  - [4. Responsive Breakpoint \& Container Query Testing](#4-responsive-breakpoint--container-query-testing)
  - [5. When to Use vs. When NOT to Use](#5-when-to-use-vs-when-not-to-use)

---

## 1. Engine Matrix: Blink vs. WebKit vs. Gecko

```text
+-----------------------+----------------------------------+----------------------------------+
| Rendering Engine      | Primary Browsers                 | Common Vendor Quirks / Risks     |
+-----------------------+----------------------------------+----------------------------------+
| **Blink**             | Google Chrome, Microsoft Edge    | Standard CSS/JS reference baseline |
| **WebKit**            | Apple Safari (macOS & iOS)       | 100vh viewport mobile bounce,    |
|                       |                                  | Date string formatting, flex gap |
| **Gecko**             | Mozilla Firefox                  | Scrollbar styling, font metrics  |
+-----------------------+----------------------------------+----------------------------------+
```

---

## 2. Multi-Engine Matrix in Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Desktop Safari (WebKit)', use: { ...devices['Desktop Safari'] } },
    { name: 'Desktop Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Safari (iPhone 14 Pro)', use: { ...devices['iPhone 14 Pro'] } },
    { name: 'Mobile Chrome (Pixel 7)', use: { ...devices['Pixel 7'] } },
  ],
});
```

---

## 3. Local Emulation vs. Real-Device Clouds

- **Local Emulation (Playwright Device Descriptors):** Simulates viewport, user-agent string, touch event emulation, and DPR ($2\times/3\times$). Extremely fast and free for PR pipelines.
- **Real Device Clouds (BrowserStack / Sauce Labs):** Runs on physical iOS and Android hardware. Essential for testing native virtual keyboards, iOS Safari hardware video rendering, and vendor-specific Android GPU layers.

---

## 4. Responsive Breakpoint & Container Query Testing

```typescript
// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test';

test('navigation collapses to hamburger menu on mobile viewport', async ({ page }) => {
  // 1. Desktop Viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByRole('navigation')).toBeVisible();
  await expect(page.getByRole('button', { name: /menu/i })).not.toBeVisible();

  // 2. Mobile Viewport Resize
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
});
```

---

## 5. When to Use vs. When NOT to Use

| When to Use Cross-Browser Testing                     | When NOT to Use Cross-Browser Testing                      |
| :---------------------------------------------------- | :--------------------------------------------------------- |
| ✅ Public consumer-facing web applications.           | ❌ Internal enterprise tools with mandated single browser. |
| ✅ Responsive layout breakpoint verification.         | ❌ Pure backend Node.js microservices.                     |
| ✅ Touch interactions, pinch-to-zoom, swipe gestures. | ❌ Pure math calculation algorithms.                       |

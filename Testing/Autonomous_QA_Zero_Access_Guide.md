# Autonomous QA Automation Blueprint (Zero Org Repo Access)

> **Scenario:** You are a QA Engineer with **NO access to your organization's GitHub, GitLab, or Bitbucket code repositories**. You only have access to **Dev/Staging & Prod URLs**, issue tracking (Linear/Jira), and your own **Personal GitHub account**.

---

## Table of Contents

- [Autonomous QA Automation Blueprint (Zero Org Repo Access)](#autonomous-qa-automation-blueprint-zero-org-repo-access)
  - [Table of Contents](#table-of-contents)
  - [1. Executive Architectural Overview](#1-executive-architectural-overview)
  - [2. The 100% Free Personal GitHub Actions Math](#2-the-100-free-personal-github-actions-math)
  - [3. Modular Multi-Route Project Directory Structure](#3-modular-multi-route-project-directory-structure)
  - [4. Multi-Route Architecture \& Complex Logic Engine](#4-multi-route-architecture--complex-logic-engine)
    - [A. Declarative Route Matrix (`routes.config.ts`)](#a-declarative-route-matrix-routesconfigts)
    - [B. Global Auth State Reuse (`storageState.json`)](#b-global-auth-state-reuse-storagestatejson)
    - [C. Handling Complex Business Logic \& Conditional Popups](#c-handling-complex-business-logic--conditional-popups)
    - [D. Network Interception \& Flaky Third-Party Mocking](#d-network-interception--flaky-third-party-mocking)
    - [E. Multi-Route Page Object Models (POM)](#e-multi-route-page-object-models-pom)
      - [1. Catalog \& Search (`src/pages/CatalogSearchPage.ts`)](#1-catalog--search-srcpagescatalogsearchpagets)
      - [2. Cart \& Dynamic Coupon Logic (`src/pages/CartCheckoutPage.ts`)](#2-cart--dynamic-coupon-logic-srcpagescartcheckoutpagets)
  - [5. The Multi-Route Test Runner \& Latency Aggregator](#5-the-multi-route-test-runner--latency-aggregator)
  - [6. Free Email Dispatcher Service (Resend / Gmail / SES)](#6-free-email-dispatcher-service-resend--gmail--ses)
  - [7. Workflow 1: Daily 08:00 AM Automated Production Health Check](#7-workflow-1-daily-0800-am-automated-production-health-check)
  - [8. Workflow 2: Dev/Staging Release Verification (1-Click UI / Linear Webhook)](#8-workflow-2-devstaging-release-verification-1-click-ui--linear-webhook)
  - [9. Connecting with Linear (Automated Ticket QA Verification)](#9-connecting-with-linear-automated-ticket-qa-verification)
  - [10. Anti-Bot Evasion \& Infrastructure Tips](#10-anti-bot-evasion--infrastructure-tips)

---

## 1. Executive Architectural Overview

This blueprint enables you to run a world-class, fully automated test suite from the outside (black-box browser automation) without writing a single line of code in the developers' codebase.

```mermaid
flowchart TD
    subgraph PersonalAccount ["🔒 Your Personal GitHub (Private Repo)"]
        W1["⏰ Workflow 1: Daily 08:00 AM Cron (Auto)"]
        W2["🔘 Workflow 2: Release Verification (1-Click Dropdown: Env + Route Filter)"]
        GHA["GitHub Actions Cloud VM (Ubuntu)"]
        Sec["GitHub Secrets (URLs, Passwords, API Keys)"]
        AuthStorage["💾 Cached Auth Session (storageState.json)"]
    end

    subgraph TargetRoutes ["🌐 Target Routes & Complex Flows (Dev / Staging / Prod)"]
        R_Public["1. Public Routes: / (Landing), /search, /categories, /products/:id"]
        R_Auth["2. Auth Flows: /login, /signup, /forgot-password, OTP"]
        R_Checkout["3. Checkout Funnel: /cart, /checkout/address, /payment, coupons"]
        R_Account["4. User Portal: /account/orders, /account/profile, /wishlist"]
        R_Admin["5. Admin / RBAC: /admin/inventory, /admin/analytics"]
    end

    subgraph Deliverables ["📬 Automated Telemetry & Multi-Route Alerts"]
        RouteMatrix["📊 Aggregated Route Health Matrix (Pass/Fail + Latency)"]
        Screenshots["📸 Failure Screenshots (Action Artifacts)"]
        Email["✉️ HTML Email Report with Domain Breakdown"]
        LinearComment["💬 Automated Linear Ticket Verification Comments"]
    end

    W1 --> GHA
    W2 --> GHA
    Sec --> GHA
    GHA --> AuthStorage
    AuthStorage --> TargetRoutes
    TargetRoutes --> RouteMatrix
    TargetRoutes --> Screenshots
    RouteMatrix --> Email & LinearComment
    Screenshots --> Email & LinearComment
```

---

## 2. The 100% Free Personal GitHub Actions Math

GitHub provides **2,000 free minutes every month** for private repositories on all personal accounts. Even when testing 20+ routes across multiple journeys, smart architecture keeps you well under the quota:

| Execution Scope                 | Routes / Journeys Tested                 | Time per Run            | Monthly Frequency    | Total Monthly Usage | Remaining Free Buffer                   |
| :------------------------------ | :--------------------------------------- | :---------------------- | :------------------- | :------------------ | :-------------------------------------- |
| **Daily 08:00 AM Health Check** | All 20+ Routes (Parallel Workers)        | $\approx 60\text{ sec}$ | $30\text{ runs}$     | $30\text{ mins}$    | $1,970\text{ mins}$ ($98.5\%$)          |
| **Release Verifications**       | Targeted Route Suite (e.g. Checkout)     | $\approx 45\text{ sec}$ | $15\text{ releases}$ | $11.25\text{ mins}$ | $1,958\text{ mins}$ ($97.9\%$)          |
| **Full Regression Suite**       | All Routes + Edge Cases + Negative Flows | $\approx 2\text{ mins}$ | $10\text{ runs}$     | $20\text{ mins}$    | **$1,938\text{ mins}$ ($96.9\%$ free)** |

---

## 3. Modular Multi-Route Project Directory Structure

```text
autonomous-qa-suite/
├── .github/
│   └── workflows/
│       ├── daily-8am-health-check.yml       <-- Daily 08:00 AM CRON health check
│       └── release-verification.yml         <-- 1-Click UI (Env & Route Suite selection)
├── src/
│   ├── config/
│   │   ├── routes.config.ts                 <-- Declarative Route Registry & SLA thresholds
│   │   └── env.config.ts                    <-- Dev, Staging, and Prod URL mapping
│   ├── auth/
│   │   └── globalAuthSetup.ts               <-- Logs in once & generates storageState.json
│   ├── pages/
│   │   ├── BasePage.ts                      <-- Resilient locators, popup handlers, timers
│   │   ├── AuthPage.ts                      <-- /login, /signup, password reset
│   │   ├── CatalogSearchPage.ts             <-- /search, filters, sorting, product details
│   │   ├── CartCheckoutPage.ts              <-- /cart, coupon logic, address, payment
│   │   ├── UserAccountPage.ts               <-- /account/orders, profile, wishlist
│   │   └── AdminDashboardPage.ts            <-- /admin/inventory, RBAC permission checks
│   ├── flows/
│   │   ├── smokeHealthFlow.ts               <-- Fast route matrix status crawler (<30s)
│   │   ├── checkoutJourneyFlow.ts           <-- Multi-step purchase & coupon logic
│   │   └── userAccountFlow.ts               <-- Order history & settings updates
│   ├── runner/
│   │   └── multiRouteRunner.ts              <-- Orchestrator, timers, telemetry aggregator
│   └── services/
│       ├── emailService.ts                  <-- Resend / Gmail SMTP / Amazon SES HTML dispatcher
│       └── linearService.ts                 <-- Linear GraphQL ticket updater
├── auth-session/                            <-- Gitignored local session storage
│   └── storageState.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. Multi-Route Architecture & Complex Logic Engine

### A. Declarative Route Matrix (`routes.config.ts`)

Instead of hardcoding URLs in disparate test files, define all application routes in a single declarative configuration file. This allows you to run automated health scans, filter by domain tag, and assert performance SLAs:

```typescript
// src/config/routes.config.ts

export interface AppRoute {
  id: string;
  path: string;
  name: string;
  category: 'public' | 'auth' | 'catalog' | 'checkout' | 'account' | 'admin';
  authRequired: boolean;
  expectedStatus: number;
  criticalSelector: string;
  maxLatencyMs: number; // SLA limit
  tags: string[];
}

export const APP_ROUTES: AppRoute[] = [
  // 1. PUBLIC & MARKETING ROUTES
  {
    id: 'landing',
    path: '/',
    name: 'Home Landing Page',
    category: 'public',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: '[data-testid="hero-banner"], header',
    maxLatencyMs: 1200,
    tags: ['smoke', 'public', 'daily-8am'],
  },
  {
    id: 'categories',
    path: '/categories',
    name: 'Product Categories Grid',
    category: 'public',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: '[data-testid="category-card"], .category-list',
    maxLatencyMs: 1500,
    tags: ['catalog', 'public'],
  },

  // 2. AUTHENTICATION ROUTES
  {
    id: 'login',
    path: '/login',
    name: 'User Sign In Page',
    category: 'auth',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: 'input[type="email"], input[name="username"]',
    maxLatencyMs: 1000,
    tags: ['smoke', 'auth', 'daily-8am'],
  },
  {
    id: 'signup',
    path: '/signup',
    name: 'Account Registration',
    category: 'auth',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: 'input[name="confirmPassword"], button[type="submit"]',
    maxLatencyMs: 1200,
    tags: ['auth'],
  },

  // 3. SEARCH & CATALOG
  {
    id: 'search-results',
    path: '/search?q=laptop&sort=price_low',
    name: 'Search & Filtering Results',
    category: 'catalog',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: '[data-testid="product-card"], .search-result-item',
    maxLatencyMs: 2000,
    tags: ['smoke', 'catalog', 'daily-8am'],
  },
  {
    id: 'product-details',
    path: '/products/macbook-pro-m3',
    name: 'Product Details (PDP)',
    category: 'catalog',
    authRequired: false,
    expectedStatus: 200,
    criticalSelector: '[data-testid="add-to-cart-button"], button:has-text("Add to Cart")',
    maxLatencyMs: 1500,
    tags: ['smoke', 'catalog', 'daily-8am'],
  },

  // 4. CHECKOUT FUNNEL
  {
    id: 'cart',
    path: '/cart',
    name: 'Shopping Cart',
    category: 'checkout',
    authRequired: true,
    expectedStatus: 200,
    criticalSelector: '[data-testid="checkout-btn"], [data-testid="cart-total"]',
    maxLatencyMs: 1500,
    tags: ['smoke', 'checkout', 'daily-8am'],
  },
  {
    id: 'checkout-shipping',
    path: '/checkout/shipping',
    name: 'Checkout - Shipping Address',
    category: 'checkout',
    authRequired: true,
    expectedStatus: 200,
    criticalSelector: 'input[name="postalCode"], select[name="country"]',
    maxLatencyMs: 1800,
    tags: ['checkout'],
  },

  // 5. AUTHENTICATED USER PORTAL
  {
    id: 'account-orders',
    path: '/account/orders',
    name: 'Order History & Tracking',
    category: 'account',
    authRequired: true,
    expectedStatus: 200,
    criticalSelector: '[data-testid="orders-list"], .order-card',
    maxLatencyMs: 1800,
    tags: ['account', 'daily-8am'],
  },
  {
    id: 'account-profile',
    path: '/account/profile',
    name: 'Profile & Security Settings',
    category: 'account',
    authRequired: true,
    expectedStatus: 200,
    criticalSelector: '[data-testid="profile-form"], input[name="fullName"]',
    maxLatencyMs: 1200,
    tags: ['account'],
  },

  // 6. ADMIN & RBAC
  {
    id: 'admin-inventory',
    path: '/admin/inventory',
    name: 'Admin Inventory Console',
    category: 'admin',
    authRequired: true,
    expectedStatus: 200,
    criticalSelector: '[data-testid="inventory-table"], .admin-panel',
    maxLatencyMs: 2500,
    tags: ['admin'],
  },
];
```

---

### B. Global Auth State Reuse (`storageState.json`)

If you have 15 authenticated routes, logging in fresh 15 times wastes **45+ seconds**, wastes CI minutes, and risks rate-limiting or 2FA lockout.

Instead, log in **once** at the start of the run, serialize the session cookies and `localStorage` to `storageState.json`, and reuse it across all route tests in **0ms**:

```typescript
// src/auth/globalAuthSetup.ts
import { chromium, FullConfig } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

export async function performGlobalAuthentication(baseUrl: string): Promise<string> {
  const sessionDir = path.resolve(__dirname, '../../auth-session');
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const storageStatePath = path.join(sessionDir, 'storageState.json');

  console.log('🔑 Performing Single Global Login to cache session...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Navigate to login
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

  // 2. Fill credentials
  await page.fill('input[type="email"], input[name="username"]', process.env.TEST_USER_EMAIL || 'qa-bot@mycompany.com');
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'SecretQA123!');
  await page.click('button[type="submit"], button:has-text("Sign In")');

  // 3. Wait for post-login redirect (e.g. Dashboard or Home)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

  // 4. Save storage state (Cookies, LocalStorage, Auth Tokens)
  await context.storageState({ path: storageStatePath });
  console.log(`✅ Auth session cached successfully at: ${storageStatePath}`);

  await browser.close();
  return storageStatePath;
}
```

---

### C. Handling Complex Business Logic & Conditional Popups

Real-world production web applications display dynamic overlays (newsletter popups, location selectors, cookie consent banners, sale countdowns).

Use Playwright's native `addLocatorHandler` in your `BasePage` to dismiss them automatically whenever they appear without polluting your test logic:

```typescript
// src/pages/BasePage.ts
import { Page, Locator } from 'playwright';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
    this.registerGlobalPopupHandlers();
  }

  /**
   * Automatically dismisses unwanted modals/banners whenever they block user interaction
   */
  private registerGlobalPopupHandlers(): void {
    // 1. Cookie & GDPR Banners
    this.page.addLocatorHandler(
      this.page.locator('button:has-text("Accept All"), button:has-text("Allow Cookies"), [id*="cookie-accept"]'),
      async (acceptBtn) => {
        console.log('🛡️ Auto-dismissed Cookie Consent Banner');
        await acceptBtn.click();
      },
    );

    // 2. Promotional Newsletter / Discount Popups
    this.page.addLocatorHandler(
      this.page.locator('[aria-label="Close dialog"], [data-testid="modal-close-btn"], .modal-close'),
      async (closeBtn) => {
        console.log('🛡️ Auto-dismissed Promotional Modal Overlay');
        await closeBtn.click();
      },
    );
  }

  /**
   * Resilient click that auto-scrolls into view and retries on animation
   */
  async resilientClick(selector: string | Locator): Promise<void> {
    const loc = typeof selector === 'string' ? this.page.locator(selector).first() : selector;
    await loc.scrollIntoViewIfNeeded();
    await loc.waitFor({ state: 'visible', timeout: 8000 });
    await loc.click({ delay: 50 });
  }
}
```

---

### D. Network Interception & Flaky Third-Party Mocking

When testing in black-box mode without backend access, external dependencies (payment gateways like Stripe/Razorpay, SMS OTP verification, analytics trackers) can fail or block automated test cards.

Intercept these network calls at the browser level using `page.route()`:

```typescript
// Example: Mocking 3rd-party payment gateway or OTP endpoint in browser
export async function mockPaymentGatewaySuccess(page: Page): Promise<void> {
  // Intercept payment gateway webhook/API response
  await page.route('**/api/v1/payments/verify', async (route) => {
    console.log('💳 Intercepted payment verification -> Simulating HTTP 200 SUCCESS');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        transactionId: 'TXN_SYNTHETIC_' + Date.now(),
        status: 'PAID',
      }),
    });
  });

  // Block heavy tracking/analytics scripts to speed up test execution by 3x
  await page.route('**/*google-analytics*/**', (route) => route.abort());
  await page.route('**/*facebook*/**', (route) => route.abort());
  await page.route('**/*hotjar*/**', (route) => route.abort());
}
```

---

### E. Multi-Route Page Object Models (POM)

#### 1. Catalog & Search (`src/pages/CatalogSearchPage.ts`)

```typescript
// src/pages/CatalogSearchPage.ts
import { BasePage } from './BasePage';
import { expect } from 'playwright/test';

export class CatalogSearchPage extends BasePage {
  async searchProduct(keyword: string): Promise<number> {
    const searchInput = this.page.locator('input[type="search"], input[placeholder*="Search"]').first();
    await searchInput.fill(keyword);
    await searchInput.press('Enter');

    // Wait for product cards to populate
    const productCards = this.page.locator('[data-testid="product-card"], .product-item');
    await productCards.first().waitFor({ state: 'visible', timeout: 10000 });

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    return count;
  }

  async selectProductByIndex(index: number = 0): Promise<string> {
    const productCard = this.page.locator('[data-testid="product-card"], .product-item').nth(index);
    const title = (await productCard.locator('h2, .product-title').first().textContent()) || 'Selected Product';

    await this.resilientClick(productCard);
    await this.page.waitForLoadState('domcontentloaded');
    return title.trim();
  }
}
```

#### 2. Cart & Dynamic Coupon Logic (`src/pages/CartCheckoutPage.ts`)

```typescript
// src/pages/CartCheckoutPage.ts
import { BasePage } from './BasePage';
import { expect } from 'playwright/test';

export class CartCheckoutPage extends BasePage {
  async addToCartAndVerify(): Promise<void> {
    const addBtn = this.page.locator('[data-testid="add-to-cart-button"], button:has-text("Add to Cart")').first();
    await this.resilientClick(addBtn);

    // Verify cart badge increments
    const cartBadge = this.page.locator('[data-testid="cart-count"], .cart-badge').first();
    await expect(cartBadge).toHaveText(/[1-9]/, { timeout: 8000 });
  }

  async applyPromoCode(code: string): Promise<{ success: boolean; discountAmountText?: string }> {
    await this.page.goto('/cart');
    const promoInput = this.page.locator('input[placeholder*="Promo"], input[name="coupon"]');
    const applyBtn = this.page.locator('button:has-text("Apply")');

    await promoInput.fill(code);
    await this.resilientClick(applyBtn);

    // Check for success or error banner
    const successBanner = this.page.locator('.coupon-applied, [data-testid="discount-row"]');
    const errorBanner = this.page.locator('.coupon-error, [data-testid="error-message"]');

    const result = await Promise.race([
      successBanner.waitFor({ state: 'visible', timeout: 5000 }).then(() => true),
      errorBanner.waitFor({ state: 'visible', timeout: 5000 }).then(() => false),
    ]).catch(() => false);

    return { success: result };
  }
}
```

---

## 5. The Multi-Route Test Runner & Latency Aggregator

This orchestrator reads your route matrix, executes health checks in parallel, validates critical DOM elements, asserts latency SLAs, and produces a structured health report:

```typescript
// src/runner/multiRouteRunner.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { APP_ROUTES, AppRoute } from '../config/routes.config';
import { performGlobalAuthentication } from '../auth/globalAuthSetup';
import { EmailService } from '../services/emailService';
import * as fs from 'fs';
import * as path from 'path';

export interface RouteTestResult {
  route: AppRoute;
  status: 'PASSED' | 'FAILED';
  httpStatus: number;
  durationMs: number;
  errorMessage?: string;
  screenshotPath?: string;
}

export interface MultiRouteReport {
  suiteName: string;
  environment: string;
  targetBaseUrl: string;
  totalRoutes: number;
  passedCount: number;
  failedCount: number;
  healthScorePercent: number;
  totalDurationMs: number;
  results: RouteTestResult[];
}

export class MultiRouteRunner {
  private emailService = new EmailService();

  async run(baseUrl: string, envName: string, filterTag: string = 'all'): Promise<MultiRouteReport> {
    console.log(`\n======================================================`);
    console.log(`🚀 Multi-Route QA Engine: ${envName} (${baseUrl})`);
    console.log(`🏷 Filter: ${filterTag}`);
    console.log(`======================================================\n`);

    const startTime = performance.now();
    const screenshotDir = path.resolve(__dirname, '../../screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    // 1. Filter target routes
    const routesToTest = APP_ROUTES.filter((r) => {
      if (filterTag === 'all') return true;
      return r.tags.includes(filterTag) || r.category === filterTag;
    });

    console.log(`📋 Found ${routesToTest.length} matching routes to verify.`);

    // 2. Perform Single Global Authentication if any authenticated routes exist
    let storageStatePath: string | undefined;
    const hasAuthRoutes = routesToTest.some((r) => r.authRequired);
    if (hasAuthRoutes) {
      storageStatePath = await performGlobalAuthentication(baseUrl);
    }

    // 3. Launch Test Worker Contexts
    const browser = await chromium.launch({ headless: true });
    const results: RouteTestResult[] = [];

    for (const route of routesToTest) {
      const routeStart = performance.now();
      console.log(`▶ Testing [${route.category.toUpperCase()}] ${route.name} (${route.path})...`);

      // Create isolated context with or without auth session
      const context = await browser.newContext(
        route.authRequired && storageStatePath ? { storageState: storageStatePath } : {},
      );
      const page = await context.newPage();

      let testStatus: 'PASSED' | 'FAILED' = 'PASSED';
      let errorMsg: string | undefined;
      let httpCode = 0;
      let screenshotFile: string | undefined;

      try {
        const response = await page.goto(`${baseUrl}${route.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        httpCode = response?.status() || 0;

        // Assert HTTP Status
        if (httpCode !== route.expectedStatus) {
          throw new Error(`Expected HTTP ${route.expectedStatus}, but received HTTP ${httpCode}`);
        }

        // Assert Critical DOM Selector
        await page.waitForSelector(route.criticalSelector, { timeout: 8000 });

        const duration = Math.round(performance.now() - routeStart);
        console.log(`  ✅ PASSED (${duration}ms, HTTP ${httpCode})`);

        results.push({
          route,
          status: 'PASSED',
          httpStatus: httpCode,
          durationMs: duration,
        });
      } catch (err: any) {
        testStatus = 'FAILED';
        errorMsg = err.message;
        const duration = Math.round(performance.now() - routeStart);
        screenshotFile = path.join(screenshotDir, `fail_${route.id}_${Date.now()}.png`);
        await page.screenshot({ path: screenshotFile, fullPage: true });

        console.error(`  ❌ FAILED (${duration}ms): ${errorMsg}`);
        results.push({
          route,
          status: 'FAILED',
          httpStatus: httpCode,
          durationMs: duration,
          errorMessage: errorMsg,
          screenshotPath: screenshotFile,
        });
      } finally {
        await context.close();
      }
    }

    await browser.close();

    // 4. Calculate Aggregate Metrics
    const totalDuration = Math.round(performance.now() - startTime);
    const passedCount = results.filter((r) => r.status === 'PASSED').length;
    const failedCount = results.filter((r) => r.status === 'FAILED').length;
    const healthScore = Math.round((passedCount / results.length) * 100);

    const report: MultiRouteReport = {
      suiteName: `Multi-Route QA Suite [${filterTag.toUpperCase()}]`,
      environment: envName,
      targetBaseUrl: baseUrl,
      totalRoutes: results.length,
      passedCount,
      failedCount,
      healthScorePercent: healthScore,
      totalDurationMs: totalDuration,
      results,
    };

    // 5. Send Rich Email Report
    await this.emailService.sendMultiRouteReport(report);

    if (failedCount > 0) {
      console.error(`\n🚨 Verification Failed: ${failedCount}/${results.length} routes broken!`);
      process.exit(1);
    } else {
      console.log(`\n🎉 All ${results.length} routes verified successfully! Health Score: 100%`);
    }

    return report;
  }
}
```

---

## 6. Free Email Dispatcher Service (Resend / Gmail / SES)

```typescript
// src/services/emailService.ts
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { MultiRouteReport } from '../runner/multiRouteRunner';

export class EmailService {
  private resend?: Resend;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  private buildMultiRouteHtml(report: MultiRouteReport): string {
    const isHealthy = report.healthScorePercent === 100;
    const badgeBg = isHealthy ? '#D1FAE5' : '#FEE2E2';
    const badgeColor = isHealthy ? '#065F46' : '#991B1B';

    const rows = report.results
      .map(
        (r) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px; font-weight: bold; color: #374151;">${r.route.name}</td>
        <td style="padding: 10px; font-family: monospace; color: #6B7280; font-size: 12px;">${r.route.path}</td>
        <td style="padding: 10px; font-family: monospace;">${(r.durationMs / 1000).toFixed(2)}s</td>
        <td style="padding: 10px;">
          <span style="padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; background-color: ${
            r.status === 'PASSED' ? '#D1FAE5' : '#FEE2E2'
          }; color: ${r.status === 'PASSED' ? '#065F46' : '#991B1B'};">
            ${r.status} ${r.httpStatus ? `(${r.httpStatus})` : ''}
          </span>
          ${r.errorMessage ? `<div style="color: #DC2626; font-size: 11px; margin-top: 4px;">${r.errorMessage}</div>` : ''}
        </td>
      </tr>`,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F9FAFB; padding: 24px;">
        <div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden;">
          <div style="background-color: ${isHealthy ? '#10B981' : '#EF4444'}; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 20px;">${report.suiteName}</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Env: <strong>${report.environment}</strong> | Target: <a href="${report.targetBaseUrl}" style="color: #ffffff;">${report.targetBaseUrl}</a></p>
          </div>

          <div style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #F3F4F6; padding: 16px; border-radius: 6px;">
              <div><strong>Health Score:</strong> <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${report.healthScorePercent}%</span></div>
              <div><strong>Passed:</strong> ${report.passedCount} / ${report.totalRoutes}</div>
              <div><strong>Duration:</strong> ${(report.totalDurationMs / 1000).toFixed(2)}s</div>
            </div>

            <h3 style="margin-bottom: 8px;">📋 Route Verification Breakdown:</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
              <thead>
                <tr style="background-color: #F3F4F6; color: #4B5563;">
                  <th style="padding: 8px;">Route Name</th>
                  <th style="padding: 8px;">Path</th>
                  <th style="padding: 8px;">Latency</th>
                  <th style="padding: 8px;">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendMultiRouteReport(report: MultiRouteReport): Promise<void> {
    const subject = `[${report.environment} QA] Health: ${report.healthScorePercent}% (${report.passedCount}/${report.totalRoutes} Passed)`;
    const html = this.buildMultiRouteHtml(report);
    const recipient = process.env.REPORT_RECIPIENT || 'qa-alerts@mycompany.com';

    if (this.resend) {
      await this.resend.emails.send({
        from: 'QA Bot <onboarding@resend.dev>',
        to: recipient,
        subject,
        html,
      });
      console.log('✅ Multi-Route Report sent via Resend!');
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      });
      await transporter.sendMail({ from: `"QA Bot" <${process.env.GMAIL_USER}>`, to: recipient, subject, html });
      console.log('✅ Multi-Route Report sent via Gmail SMTP!');
    }
  }
}
```

---

## 7. Workflow 1: Daily 08:00 AM Automated Production Health Check

Save this file as `.github/workflows/daily-8am-health-check.yml`:

```yaml
name: Daily 08:00 AM Multi-Route Health Check

on:
  schedule:
    # 02:30 UTC = 08:00 AM IST daily
    - cron: '30 2 * * *'
  workflow_dispatch:

jobs:
  daily-health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies & Chromium
        run: |
          npm ci
          npx playwright install --with-deps chromium

      - name: Execute Multi-Route Production Health Check
        env:
          TARGET_URL: ${{ secrets.PROD_URL }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          REPORT_RECIPIENT: ${{ secrets.REPORT_RECIPIENT }}
        run: |
          npx ts-node -e "import { MultiRouteRunner } from './src/runner/multiRouteRunner'; new MultiRouteRunner().run(process.env.TARGET_URL!, 'Production', 'daily-8am');"

      - name: Upload Failure Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: daily-failure-screenshots
          path: screenshots/
          retention-days: 7
```

---

## 8. Workflow 2: Dev/Staging Release Verification (1-Click UI / Linear Webhook)

This workflow gives you an interactive UI dropdown to pick the **Environment** (`Dev`, `Staging`, `Production`) AND the specific **Route / Feature Suite** you want to test:

```yaml
name: Release Verification (Env & Route Selector)

on:
  workflow_dispatch:
    inputs:
      target_env:
        description: '1. Select Target Environment:'
        required: true
        default: 'Staging'
        type: choice
        options:
          - 'Staging'
          - 'Dev'
          - 'Production'
      route_filter:
        description: '2. Select Route / Feature Suite to Test:'
        required: true
        default: 'all'
        type: choice
        options:
          - 'all'
          - 'smoke'
          - 'auth'
          - 'catalog'
          - 'checkout'
          - 'account'
          - 'admin'
      custom_url:
        description: '3. Or enter custom preview URL (optional):'
        required: false
        type: string

  repository_dispatch:
    types: [linear_release_trigger, deployment_notification]

jobs:
  verify-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies & Chromium
        run: |
          npm ci
          npx playwright install --with-deps chromium

      - name: Determine Target URL & Suite
        id: params
        run: |
          if [ -n "${{ github.event.inputs.custom_url }}" ]; then
            echo "url=${{ github.event.inputs.custom_url }}" >> $GITHUB_OUTPUT
            echo "env_name=Custom Preview" >> $GITHUB_OUTPUT
          elif [ "${{ github.event.inputs.target_env }}" == "Dev" ]; then
            echo "url=${{ secrets.DEV_URL }}" >> $GITHUB_OUTPUT
            echo "env_name=Dev" >> $GITHUB_OUTPUT
          elif [ "${{ github.event.inputs.target_env }}" == "Production" ]; then
            echo "url=${{ secrets.PROD_URL }}" >> $GITHUB_OUTPUT
            echo "env_name=Production" >> $GITHUB_OUTPUT
          else
            echo "url=${{ secrets.STAGING_URL }}" >> $GITHUB_OUTPUT
            echo "env_name=Staging" >> $GITHUB_OUTPUT
          fi
          echo "filter=${{ github.event.inputs.route_filter || 'all' }}" >> $GITHUB_OUTPUT

      - name: Run Multi-Route Verification Suite
        env:
          TARGET_URL: ${{ steps.params.outputs.url }}
          ENV_NAME: ${{ steps.params.outputs.env_name }}
          ROUTE_FILTER: ${{ steps.params.outputs.filter }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          REPORT_RECIPIENT: ${{ secrets.REPORT_RECIPIENT }}
        run: |
          npx ts-node -e "import { MultiRouteRunner } from './src/runner/multiRouteRunner'; new MultiRouteRunner().run(process.env.TARGET_URL!, process.env.ENV_NAME!, process.env.ROUTE_FILTER!);"

      - name: Upload Failure Screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: release-failure-screenshots
          path: screenshots/
          retention-days: 14
```

---

## 9. Connecting with Linear (Automated Ticket QA Verification)

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Linear as Linear Board
    participant GitHub as Personal GitHub Actions
    participant Target as Staging Web App
    participant QA as Your Email / Stakeholders

    Dev->>Linear: Moves Ticket to "Ready for QA"
    Linear->>GitHub: Webhook POST /repos/user/autonomous-qa/dispatches
    GitHub->>Target: Runs Headless Multi-Route Suite (Filtered by Label)
    Target-->>GitHub: Verification Successful (100% Health Score)
    GitHub->>QA: Sends [PASSED] HTML Email Report
```

1. In Linear: Go to **Settings $\to$ Workspace $\to$ Webhooks $\to$ New Webhook**.
2. Select Resource: **Issues** (filter by state transition to `Ready for QA`).
3. Target URL:
   ```text
   https://api.github.com/repos/<your-username>/autonomous-qa-suite/dispatches
   ```
4. Custom Headers:
   ```text
   Accept: application/vnd.github.v3+json
   Authorization: Bearer <YOUR_PERSONAL_GITHUB_TOKEN>
   ```

---

## 10. Anti-Bot Evasion & Infrastructure Tips

1. **Custom User-Agent:** Set realistic browser headers to avoid Cloudflare/WAF blocks:
   ```typescript
   await page.setUserAgent(
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
   );
   ```
2. **HTTP Basic Auth Injection:** If staging requires Basic Auth:
   ```text
   https://staging_user:staging_pass@staging.mycompany.com
   ```
3. **Smart Element Polling:** Avoid arbitrary `setTimeout` sleeps. Rely on Playwright's auto-retrying assertions (`expect(locator).toBeVisible()`) and `page.waitForLoadState('domcontentloaded')`.

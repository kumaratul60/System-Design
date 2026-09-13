# Performance & Load Testing Architecture

> **Scope:** Measuring web responsiveness, Core Web Vitals (LCP, INP, CLS), backend throughput (RPS, p95/p99 latency), and client-side memory leak audits.

---

## Table of Contents

- [Performance \& Load Testing Architecture](#performance--load-testing-architecture)
  - [Table of Contents](#table-of-contents)
  - [1. Frontend Performance: Lighthouse CI \& Core Web Vitals](#1-frontend-performance-lighthouse-ci--core-web-vitals)
  - [2. Backend \& API Load Testing with k6](#2-backend--api-load-testing-with-k6)
  - [3. Automated Memory Leak Testing with CDP](#3-automated-memory-leak-testing-with-cdp)
  - [4. When to Use vs. When NOT to Use](#4-when-to-use-vs-when-not-to-use)

---

## 1. Frontend Performance: Lighthouse CI & Core Web Vitals

Automating Core Web Vitals performance budgets in CI prevents code regressions from degrading page speed:

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/products"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interactive": ["error", { "maxNumericValue": 3500 }]
      }
    }
  }
}
```

---

## 2. Backend & API Load Testing with k6

Simulate thousands of concurrent Virtual Users (VUs) with ramp-up stages and latency assertions (p95/p99):

```javascript
// load-tests/checkout-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp-up to 50 users
    { duration: '1m', target: 200 }, // Stress test at 200 concurrent users
    { duration: '30s', target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<250', 'p(99)<500'], // 95% requests < 250ms
    http_req_failed: ['rate<0.01'], // Error rate < 1%
  },
};

export default function () {
  const payload = JSON.stringify({ productId: 'p_994', quantity: 1 });
  const params = { headers: { 'Content-Type': 'application/json' } };

  const res = http.post('https://api.staging.example.com/cart/items', payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
```

---

## 3. Automated Memory Leak Testing with CDP

Detect detached DOM nodes across route transitions using Playwright and the Chrome DevTools Protocol (`CDPSession`):

```typescript
// e2e/memory-leak.spec.ts
import { test, expect } from '@playwright/test';

test('navigating between pages does not leak DOM nodes', async ({ page }) => {
  await page.goto('/dashboard');

  const client = await page.context().newCDPSession(page);
  await client.send('HeapProfiler.enable');
  await client.send('HeapProfiler.collectGarbage');

  // Baseline metrics
  const startMetrics = await client.send('Performance.getMetrics');
  const startNodes = startMetrics.metrics.find((m) => m.name === 'Nodes')?.value ?? 0;

  // Navigate back and forth 10 times
  for (let i = 0; i < 10; i++) {
    await page.goto('/settings');
    await page.goto('/dashboard');
  }

  await client.send('HeapProfiler.collectGarbage');
  const endMetrics = await client.send('Performance.getMetrics');
  const endNodes = endMetrics.metrics.find((m) => m.name === 'Nodes')?.value ?? 0;

  // Assert DOM node delta is negligible (< 20 nodes variation)
  expect(endNodes - startNodes).toBeLessThan(20);
});
```

---

## 4. When to Use vs. When NOT to Use

| When to Use Performance Testing                           | When NOT to Use Performance Testing                       |
| :-------------------------------------------------------- | :-------------------------------------------------------- |
| ✅ High-traffic holiday sales preparation (Black Friday). | ❌ Early prototype development with unstable data models. |
| ✅ Enforcing Core Web Vitals budgets in CI pipelines.     | ❌ Pure unit testing of business logic.                   |
| ✅ Memory leak regression audits on large SPAs.           | ❌ Static documentation blogs.                            |

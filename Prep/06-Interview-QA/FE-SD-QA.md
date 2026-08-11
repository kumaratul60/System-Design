# ❓ Frontend System Design (FE SD) Q&A Bank

> **🎯 Target Audience:** Senior, Staff, and Principal Frontend Engineers
> **Format:** Self-testing collapsed `<details>` blocks with full architectural answers, code snippets, and follow-up drill-deeper questions.
> **Existing Repo Tags:** 🔗 [See Performance Q&A](file:///Users/atulkumarawasthi/projects/SystemDesign/Performance/README.md) | 🔗 [See Security Q&A](file:///Users/atulkumarawasthi/projects/SystemDesign/Security/Security_QA.md) | 🔗 [See Communication Q&A](file:///Users/atulkumarawasthi/projects/SystemDesign/Communication/Communication_QA.md)

---

## 🎨 Category 1: Rendering Strategies & Architecture

<details>
<summary>❓ 1. [Principal-Level] How do you architect a Hybrid Rendering Pipeline for a global E-Commerce platform handling 50M daily visits?</summary>

**Answer:**
Apply a multi-tier rendering strategy based on page traffic characteristics:

1. **Homepage & Product Category Pages (High Traffic, Public):** Use **ISR (Incremental Static Regeneration)** cached at Edge CDN PoPs with a 60-second revalidation TTL. TTFB is sub-50ms globally.
2. **Product Detail Pages (PDP):** Use **SSR + React Server Components (RSC)** at the Edge. Dynamic stock and pricing are fetched server-side directly from a Redis cache layer and streamed as HTML chunks via Suspense.
3. **Cart & Checkout (Dynamic, User-Specific):** Use **CSR** inside an authenticated boundary to prevent caching private data at CDN edge nodes.

**Follow-Up Drill:** How do you handle cache invalidation when a product price changes instantly across 10,000 ISR pages?

</details>

<details>
<summary>❓ 2. [Hard] How does React 18 Selective Hydration solve the blocking hydration issue in large SSR applications?</summary>

**Answer:**
Traditional SSR forces the browser to download and hydrate the _entire_ JavaScript bundle before any part of the page becomes interactive. React 18 Selective Hydration splits the page using `<Suspense>` boundaries. React streams HTML chunks early, and if a user clicks an un-hydrated component wrapped in `<Suspense>`, React **prioritizes hydrating that specific component first**, making the UI responsive to user intent instantly.

**Follow-Up Drill:** What happens if a user clicks a button inside a suspended component while hydration JS is still downloading?

</details>

---

## 🚀 Category 2: Performance & Core Web Vitals

<details>
<summary>❓ 3. [Hard] How do you diagnose and reduce Cumulative Layout Shift (CLS) on a dynamic news feed page?</summary>

**Answer:**

1. **Diagnose:** Use `PerformanceObserver` logging `layout-shift` entries to pinpoint exact elements shifting layout.
2. **Fixes:**
   - Always specify explicit `width` and `height` attributes (or CSS `aspect-ratio`) on images and video containers so the layout engine reserves space before assets load.
   - Reserve fixed height skeletons for dynamically injected Ads or third-party widgets.
   - Use `font-display: optional` or pre-loaded variable fonts to avoid FOUT layout shifts.

```typescript
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!(entry as any).hadRecentInput) {
      console.log('CLS Shift Value:', (entry as any).value, entry);
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

</details>

<details>
<summary>❓ 4. [Principal-Level] How do you design a zero-runtime-cost Design System Component Library?</summary>

**Answer:**

1. Use **Zero-Runtime CSS-in-JS** (e.g. Vanilla Extract, StyleX, or Tailwind CSS) that extracts styles at build time into static `.css` files rather than computing styles dynamically via JS runtime injection (like styled-components v5).
2. Export component assets with proper `sideEffects: false` flags in package.json to enable compiler **Tree-Shaking**.
3. Use compound component patterns (`<Accordion.Item>`) so unimported sub-components are dropped from consumer bundles.
</details>

---

## 🔒 Category 3: Frontend Security & Real-Time Systems

<details>
<summary>❓ 5. [Hard] How do you secure JWT access tokens in a Single-Page Application against XSS attacks?</summary>

**Answer:**
Never store JWT access tokens in `localStorage` or `sessionStorage` because any XSS script injection can read `window.localStorage`.
**Best Practice:**

1. Store tokens in **`httpOnly`, `Secure`, `SameSite=Strict` Cookies**. JavaScript cannot read `httpOnly` cookies via `document.cookie`.
2. Alternatively, keep short-lived access tokens purely **in-memory** inside a JS variable within a private closure, and use an `httpOnly` cookie solely for the `/refresh-token` endpoint.

**Follow-Up Drill:** How does storing tokens in `httpOnly` cookies impact CORS configuration on multi-subdomain architectures?

</details>

<details>
<summary>❓ 6. [Principal-Level] How do you handle WebSocket connection drops for 100,000 concurrent clients without crashing your backend servers (Thundering Herd)?</summary>

**Answer:**
Implement **Exponential Backoff with Full Jitter** on client reconnect logic.

```typescript
function getReconnectDelay(attempt: number, baseDelay = 1000, maxDelay = 30000): number {
  const temp = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
  // Full jitter randomizes connection attempts across clients
  return Math.floor(Math.random() * temp);
}
```

This prevents 100k clients from retrying simultaneously at exact 5-second intervals, smoothing server CPU load spikes.

</details>

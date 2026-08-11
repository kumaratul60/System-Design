# 🚀 Core Web Vitals & Web Performance Architecture

> **🎯 Target Audience:** Staff & Principal Frontend Architects
> **Focus:** Core Web Vitals (LCP, INP, CLS, TTFB), Resource Hints, Bundle Splitting, Asset Optimization, and Telemetry.
> **Existing Repo Tags:** 🔗 [See Performance Module](file:///Users/atulkumarawasthi/projects/SystemDesign/Performance/README.md) | 🔗 [See Web Vitals Metrics](file:///Users/atulkumarawasthi/projects/SystemDesign/Performance/Metrics/README.md)

---

## 📊 1. Core Web Vitals Metric Dashboard

| Metric   | Full Name                 | Good Target        | Needs Improvement              | Poor              | Root Cause                                                                       | Primary Fix                                                                 |
| :------- | :------------------------ | :----------------- | :----------------------------- | :---------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **LCP**  | Largest Contentful Paint  | $\le 2.5\text{s}$  | $2.5\text{s} - 4.0\text{s}$    | $> 4.0\text{s}$   | Slow server TTFB, render-blocking resources, unoptimized hero images             | Resource hint `<link rel="preload">`, fetchpriority="high", CDN edge        |
| **INP**  | Interaction to Next Paint | $\le 200\text{ms}$ | $200\text{ms} - 500\text{ms}$  | $> 500\text{ms}$  | Long Tasks (>50ms) blocking Main Thread event loop                               | Yielding main thread via `scheduler.yield()` / `setTimeout(0)`, Web Workers |
| **CLS**  | Cumulative Layout Shift   | $\le 0.1$          | $0.1 - 0.25$                   | $> 0.25$          | Images without `width`/`height`, web fonts causing FOIT/FOUT, dynamic ad inserts | Reserve explicit aspect-ratio containers, `font-display: optional`          |
| **TTFB** | Time to First Byte        | $\le 800\text{ms}$ | $800\text{ms} - 1800\text{ms}$ | $> 1800\text{ms}$ | Slow DB queries, lack of server cache, un-cached API gateway                     | Edge caching, Redis page cache, Streaming SSR                               |

---

## ⚡ 2. INP Optimization: Yielding to the Main Thread

```typescript
// ❌ BAD: Blocking main thread for 300ms causing severe INP penalty
function processHeavyDataset(items: Array<any>) {
  for (const item of items) {
    heavyCalculation(item); // Freezes UI interaction!
  }
}

// ✅ GOOD (Principal Standard): Yield main thread using modern scheduler API
async function processDatasetWithYield(items: Array<any>) {
  for (let i = 0; i < items.length; i++) {
    heavyCalculation(items[i]);

    // Yield every 50ms chunk so browser can paint user clicks/keypresses
    if (i % 50 === 0) {
      if ('yield' in window.scheduler) {
        await (window.scheduler as any).yield();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }
}
```

---

## 🌐 3. Resource Hints Architecture

```html
<!-- 1. DNS Prefetch: Resolve IP address early for 3rd-party domain -->
<link rel="dns-prefetch" href="https://analytics.example.com" />

<!-- 2. Preconnect: Establish early TCP + TLS handshake (saves ~100ms) -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- 3. Preload: High-priority download for critical LCP hero image -->
<link rel="preload" href="/assets/hero-banner.avif" as="image" type="image/avif" fetchpriority="high" />

<!-- 4. Prefetch: Low-priority download for next likely page navigation -->
<link rel="prefetch" href="/dashboard/analytics.js" as="script" />
```

---

## ❓ Collapsed Q&A Self-Testing Bank

<details>
<summary>❓ 1. Why did Google replace FID (First Input Delay) with INP (Interaction to Next Paint)?</summary>

**Answer:**
FID only measured the **delay** before the browser _started_ processing the very first interaction on a page loading. It ignored processing time and subsequent clicks. INP evaluates **all user interactions** (clicks, taps, keypresses) throughout the entire page lifecycle and measures the total time until the browser physically paints the next updated frame.

</details>

<details>
<summary>❓ 2. How do Web Fonts cause Cumulative Layout Shift (CLS) and how do you prevent it?</summary>

**Answer:**
When custom web fonts load asynchronously, the browser either hides text until the font downloads (**FOIT - Flash of Invisible Text**) or renders system fallback font and swaps later (**FOUT - Flash of Unstyled Text**). Differences in font glyph metrics cause surrounding text to shift layout. Fixes include using CSS `font-display: swap` combined with `size-adjust` / font metric override properties or using variable system fonts.

</details>

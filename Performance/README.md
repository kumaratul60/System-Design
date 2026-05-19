# Web Performance Optimization

Web performance is the speed at which web pages are downloaded and displayed on the user's web browser. It is a critical factor for user experience, SEO, and business success.

## 🗺️ Performance Overview

The following graph illustrates the key pillars and touchpoints of web performance optimization as discussed in this module.

```mermaid
mindmap
  root((Web Performance))
    Why performance?
      User Experience
      SEO & Rankings
      Conversion Rates
      Business Impact
    Performance Metric
      Web Vitals (LCP, FID, CLS)
      Core Web Vitals
      Custom Metrics
    Measuring Performance
      Lighthouse
      PageSpeed Insights
      Chrome DevTools
      RUM (Real User Monitoring)
    Network Optimization
      HTTP/2 & HTTP/3
      CDN Usage
      Compression (Gzip, Brotli)
      Caching Strategies
    Asset Optimization
      Image Optimization (WebP, AVIF)
      Minification (JS/CSS)
      Font Loading
    React Optimization
      Memoization (useMemo, useCallback)
      Code Splitting
      Virtualization
      Re-render Management
    Build Optimization
      Tree Shaking
      Chunking Strategies
      Brotli Compression
    Rendering Pattern
      SSR (Server Side Rendering)
      CSR (Client Side Rendering)
      SSG (Static Site Generation)
      ISR (Incremental Static Regeneration)
```

---

## 🏗️ The Browser-Server Loop

Performance is fundamentally about optimizing the data exchange and processing between the **Browser** and the **Server**.

```mermaid
graph LR
    subgraph Browser
    B[Client App]
    end

    subgraph Server
    S[Backend/CDN]
    end

    B -- Request (HTML, CSS, JS) --> S
    S -- Response (Optimized Assets) --> B
```

---

## 📁 Module Structure

This directory contains deep dives into each of the touchpoints mentioned above:

- `Metrics/`: Understanding LCP, FID, CLS, and more.
- `Network/`: Strategies for faster delivery.
- `Assets/`: Techniques for image and code optimization.
- `React/`: Framework-specific performance patterns.
- `Rendering/`: Choosing between SSR, CSR, and SSG.

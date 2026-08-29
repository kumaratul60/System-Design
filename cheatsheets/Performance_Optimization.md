# Performance Optimization in React

This guide provides deep answers to performance-related questions, focusing on both React-specific and general web performance.

## Table of Contents

- [Performance Optimization in React](#performance-optimization-in-react)
  - [Table of Contents](#table-of-contents)
  - [1. Memoization: `React.memo`, `useMemo`, and `useCallback`](#1-memoization-reactmemo-usememo-and-usecallback)
    - [When to Use:](#when-to-use)
    - [When They Hurt Performance (Anti-Patterns):](#when-they-hurt-performance-anti-patterns)
  - [2. Layout Thrashing](#2-layout-thrashing)
  - [3. Web Vitals \& Improving Them](#3-web-vitals--improving-them)
  - [4. Virtualization for Large Datasets](#4-virtualization-for-large-datasets)
    - [Core Mechanics:](#core-mechanics)
    - [Critical Production Edge Cases \& Solutions:](#critical-production-edge-cases--solutions)
  - [5. Code Splitting, Lazy Loading \& Waterfall Prevention](#5-code-splitting-lazy-loading--waterfall-prevention)
    - [Splitting Architecture Patterns:](#splitting-architecture-patterns)
  - [6. Bundle Analysis, Tree Shaking \& Build Optimization](#6-bundle-analysis-tree-shaking--build-optimization)
    - [1. Bundle Analysis Workflow:](#1-bundle-analysis-workflow)
    - [2. How Tree Shaking Works (and Why It Breaks):](#2-how-tree-shaking-works-and-why-it-breaks)
  - [7. Web Workers: Offloading the Main Thread](#7-web-workers-offloading-the-main-thread)
  - [8. React 18 Concurrent Features: `useTransition` \& `useDeferredValue`](#8-react-18-concurrent-features-usetransition--usedeferredvalue)
  - [Senior/Staff Level "Grill" Questions](#seniorstaff-level-grill-questions)
    - [Q1: Why is "Over-optimization" with `useMemo` potentially worse than not using it at all?](#q1-why-is-over-optimization-with-usememo-potentially-worse-than-not-using-it-at-all)
    - [Q2: What is the "Zombie Child" problem and how does it relate to performance/correctness?](#q2-what-is-the-zombie-child-problem-and-how-does-it-relate-to-performancecorrectness)
    - [Q3: Explain "Cumulative Layout Shift" (CLS) and why Skeleton Screens can sometimes _increase_ it.](#q3-explain-cumulative-layout-shift-cls-and-why-skeleton-screens-can-sometimes-increase-it)
    - [Q4: How does "Tree Shaking" actually work and what are "Side Effects"?](#q4-how-does-tree-shaking-actually-work-and-what-are-side-effects)
  - [9. Diagnosing Page Slowness After Adding Multiple API-Driven Components](#9-diagnosing-page-slowness-after-adding-multiple-api-driven-components)
    - [Systematic Diagnostic Pipeline:](#systematic-diagnostic-pipeline)
      - [Step 1: Network Layer Triage (Chrome DevTools Network Tab)](#step-1-network-layer-triage-chrome-devtools-network-tab)
      - [Step 2: Main Thread \& CPU Profiling (Chrome DevTools Performance Tab)](#step-2-main-thread--cpu-profiling-chrome-devtools-performance-tab)
      - [Step 3: React Reconciliation Profiling (React DevTools Profiler)](#step-3-react-reconciliation-profiling-react-devtools-profiler)
  - [10. Caching \& Avoiding Duplicate API Requests](#10-caching--avoiding-duplicate-api-requests)
    - [1. In-Flight Request Deduplication (Single-Flight Promise Cache)](#1-in-flight-request-deduplication-single-flight-promise-cache)
    - [2. Stale-While-Revalidate (SWR / TanStack Query) Lifecycle](#2-stale-while-revalidate-swr--tanstack-query-lifecycle)
    - [3. HTTP Gateway \& Caching Headers](#3-http-gateway--caching-headers)

---

## 1. Memoization: `React.memo`, `useMemo`, and `useCallback`

**Question:** When should we use `React.memo`, `useMemo`, and `useCallback` — and when do they actually hurt performance?

**Answer:**
Memoization is not a free performance optimization. It introduces memory and CPU trade-offs and must only be applied where the cost of re-rendering or recalculation clearly exceeds the cost of memoization overhead.

### When to Use:

1. **`React.memo` (Component-level):** Wrap pure leaf or heavy subtree components that re-render frequently with **identical props** because an ancestor re-rendered due to unrelated state (e.g., parent timer tick, mouse position, sibling input keystrokes).
2. **`useMemo` (Computation-level):**
   - Expensive data transformations taking $\ge 1\text{ms}$ (e.g., sorting, filtering, or mapping arrays with $>1,000$ items).
   - Preserving referential identity (`===`) for complex objects or arrays passed as props to a child wrapped in `React.memo`.
3. **`useCallback` (Function reference-level):**
   - Preserving function referential identity for callbacks passed down to `React.memo` components.
   - Supplying stable function references to dependency arrays of other hooks (`useEffect`, `useMemo`).

### When They Hurt Performance (Anti-Patterns):

1. **Shallow Comparison Overhead Exceeds Render Cost:**
   - On every parent render, React runs an $O(N)$ loop comparing every prop shallowly (`prevProp === nextProp`).
   - For simple components (e.g., `<Button label={text} onClick={onClick} />`), creating the Virtual DOM JSX object takes a fraction of a microsecond. The shallow comparison check + fiber `memoizedState` lookup actually consumes **more CPU cycles** than simply letting the component render.
2. **Memory Allocation & Retained Closures:**
   - Every `useMemo` and `useCallback` allocates an internal hook record on the fiber, storing the returned value and the dependency array indefinitely.
   - `useCallback` preserves closures over outer scope variables. If an outer object or array is captured in a callback's closure, it cannot be garbage-collected, creating subtle in-memory leaks.
3. **Broken Referential Equality (The Optimization Illusion):**
   - If a parent wraps a child in `React.memo`, but passes an inline object literal, array, or inline arrow function:
     ```jsx
     // ❌ Anti-pattern: React.memo is 100% wasted work!
     <MemoizedListItem
       config={{ theme: 'dark' }} // New reference every parent render
       onSelect={() => handleSelect(id)} // New reference every parent render
     />
     ```
     Here, the shallow comparison executes on every render, **fails every time**, and the component re-renders anyway. You pay the cost of memoization checks _plus_ the full render.
4. **Passing `children` to Memoized Components:**
   - In JSX, `<MemoizedCard><p>Text</p></MemoizedCard>` translates to `React.createElement(MemoizedCard, { children: React.createElement('p', null, 'Text') })`.
   - The `children` prop is a brand-new object on every parent render, completely breaking `React.memo` unless `children` itself is memoized.
5. **Modern Context — The React Compiler (React 19 / "Forget"):**
   - The React Compiler automates memoization at the AST compiler level via static analysis, eliminating manual hook boilerplate and human mistakes (such as missing dependencies or unnecessary memoization). Manual over-memoization clutters code without adding value in compiled codebases.

---

## 2. Layout Thrashing

**Question:** What is layout thrashing and how can we prevent it?

**Answer:**
**Layout Thrashing** occurs when the browser is forced to perform multiple "Reflows" and "Repaints" before a single frame is finished. This typically happens when you write to the DOM (e.g., setting a style) and then immediately read from it (e.g., reading `offsetWidth`) in a loop.

**Prevention Strategies:**

1.  **Batch DOM reads and writes:** Perform all reads first, then all writes.
2.  **Use `requestAnimationFrame`:** Schedule DOM updates to happen right before the next repaint.
3.  **Avoid forced synchronous layout:** Be aware of properties that trigger reflow (e.g., `offsetTop`, `scrollLeft`, `getComputedStyle`).
4.  **Use CSS for animations:** Prefer CSS transitions/animations or `transform`/`opacity` which can be handled by the GPU (compositor layer) rather than the main thread.

> [!NOTE]
> For detailed execution timeline visuals, forced reflow APIs, and task scheduling details, see [Layout Thrashing & Microtask/Macrotask Timings](../../Performance/Network/README.md#q2-requestanimationframe-raf) and [CSS Selector Complexity & Layout Containment](../../Performance/Assets/README.md#q5-how-does-css-selector-complexity-affect-style-calculation-and-how-does-layout-containment-the-css-contain-property-optimize-rendering).

---

## 3. Web Vitals & Improving Them

**Question:** What are Web Vitals and how do you improve them?

**Answer:**
Web Vitals are a set of metrics that Google uses to measure user experience.

- **LCP (Largest Contentful Paint):** Measures loading performance. Goal: < 2.5s.
  - _Improve:_ Optimize images, use CDN, remove render-blocking JS/CSS.
- **INP (Interaction to Next Paint):** Measures responsiveness to user input. Goal: < 200ms.
  - _Improve:_ Optimize event handlers, use `useTransition` to mark low-priority updates.
- **CLS (Cumulative Layout Shift):** Measures visual stability. Goal: < 0.1.
  - _Improve:_ Set dimensions for images/videos, avoid inserting content above existing content dynamically.

> [!NOTE]
> For a detailed guide on performance timelines, lab vs. field metrics (CrUX), and developer tooling audits, see [Core Web Vitals & Performance Metrics](../../Performance/Metrics/README.md).

---

## 4. Virtualization for Large Datasets

**Question:** How do you architect virtualization for massive datasets (10,000+ items), and what are the complex edge cases in production?

**Answer:**
Virtualization (Windowing) maintains a small, fixed window of DOM elements (e.g., 15–30 nodes) that updates dynamically as the user scrolls, preventing DOM tree bloat, severe memory consumption, and frame drops.

### Core Mechanics:

1. **Container & Phantom Spacer:** The scrollable parent calculates total virtual height ($N \times \text{itemHeight}$) to allow native scrollbars to function correctly.
2. **Viewport Calculation:** Given `scrollTop` and container `clientHeight`, calculate `startIndex` and `endIndex`.
3. **Overscan Buffer:** Render an extra 3–5 items above and below the visible frame so items are pre-rendered before entering the viewport.
4. **Positioning:** Position active nodes using GPU-accelerated `transform: translateY(...)` or absolute positioning.

### Critical Production Edge Cases & Solutions:

1. **Dynamic & Variable Item Heights:**
   - _Problem:_ Fixed-height calculations break when items contain variable user text, images, or collapsible sections.
   - _Solution:_ Use `@tanstack/react-virtual`. Mount items, measure rendered DOM elements using `ResizeObserver`, cache calculated heights in a prefix-sum / binary-indexed tree, and dynamically recalculate positions.
2. **Scroll Jumps & Stutter During Rapid Momentum Scrolling:**
   - _Problem:_ Fast scrolling causes items to enter the viewport before the JS thread computes their position, causing "white/blank frames" or layout jumps when height estimates are corrected.
   - _Solution:_
     - Increase `overscan` dynamically during high scroll velocity.
     - Provide accurate estimated heights rather than wild underestimates.
     - Add CSS `contain: strict` or `content-visibility: auto` to isolate item layout and repaint boundaries.
3. **Accessibility & Find-in-Page (`Ctrl + F`):**
   - _Problem:_ Virtualized items that are offscreen do not exist in the DOM; native browser `Ctrl + F` cannot find them, and screen readers cannot announce the full list.
   - _Solution:_
     - Build an in-app search that queries the underlying dataset in memory, calculates the target index, and triggers `virtualizer.scrollToIndex(index, { align: 'center' })`.
     - Expose proper ARIA attributes (`role="feed"`, `aria-rowcount={totalItems}`, `aria-rowindex={index}`).
4. **Focus & Form Input State Preservation:**
   - _Problem:_ If a user is typing into an input inside row 15, and scrolling slightly causes row 15 to exit the overscan window, unmounting the component destroys its focus and local input state.
   - _Solution:_ Colocate input state in an external store or parent index map, and track active focus element to prevent virtualization eviction while focused.

---

## 5. Code Splitting, Lazy Loading & Waterfall Prevention

**Question:** How do you architect code splitting and lazy loading without creating navigation waterfalls or degraded user experience?

**Answer:**
Code splitting breaks monolithic bundles into smaller chunks loaded on demand. However, naive splitting often creates **Suspense waterfalls** (waiting sequentially for parent chunk $\rightarrow$ child chunk $\rightarrow$ child API request).

### Splitting Architecture Patterns:

1. **Route-Based Splitting:**
   - Wrap top-level routes in `React.lazy(() => import('./routes/Analytics'))` and `<Suspense>`.
2. **Interaction-Based Splitting (Hover & Idle Prefetching):**
   - Do not wait for a user to click to start downloading a 200KB chunk.
   - Preload the chunk on `onMouseEnter` or `onFocus`:

     ```tsx
     const loadSettings = () => import('./SettingsModal');
     const SettingsModal = React.lazy(loadSettings);

     <button onMouseEnter={loadSettings} onClick={() => setOpen(true)}>
       Open Settings
     </button>;
     ```

3. **Intent-Based Viewport Prefetching:**
   - Use `IntersectionObserver` to prefetch chunks when a link enters the viewport (e.g., Next.js Link prefetching).
4. **Preventing Suspense Waterfalls:**
   - _Problem:_ Page chunk downloads $\rightarrow$ Page mounts $\rightarrow$ Inner dynamic widget chunk downloads $\rightarrow$ Inner widget fetches API data.
   - _Solution:_ Hoist data loaders and secondary chunk prefetching to the router level (e.g., React Router loaders or TanStack Router `loader: () => Promise.all([loadChunk(), loadData()])`).

---

## 6. Bundle Analysis, Tree Shaking & Build Optimization

**Question:** How do you perform bundle analysis and ensure tree shaking actually eliminates dead code?

**Answer:**

### 1. Bundle Analysis Workflow:

- **Tools:** `webpack-bundle-analyzer`, `rollup-plugin-visualizer`, or `source-map-explorer`.
- **Target 1: Duplicate Dependencies:** Look for multiple versions of the same package (e.g., `lodash-es` vs `lodash`, two versions of `date-fns` caused by mismatched peer dependencies). Fix with `package.json` `resolutions` or `overrides`.
- **Target 2: Barrel File Traps:**
  - Importing `import { Button } from '@/components'` where `components/index.ts` re-exports 80 components including large chart libraries. Even if you only use `Button`, bundlers may bundle all 80 components if any file has side effects.
  - _Fix:_ Import directly from `@/components/Button` or configure bundler modularize imports (e.g. `transform-imports`).
- **Target 3: Legacy Heavyweight Libraries:** Replace `moment.js` (un-shakable due to locale mutation) with `date-fns` or native `Intl` APIs.

### 2. How Tree Shaking Works (and Why It Breaks):

- **Static Analysis:** Tree shaking relies on ES Module syntax (`import`/`export`) which can be statically parsed into an Abstract Syntax Tree (AST) before runtime execution.
- **Why CommonJS Fails:** CommonJS `require()` and `module.exports` are dynamic and evaluated at runtime (`if (condition) require('a')`). Bundlers cannot prove whether an export is unused, so they bundle the entire module.
- **`"sideEffects": false` in `package.json`:**
  - Bundlers will not prune unused code if they suspect the file has global side effects (e.g., modifying `window`, injecting styles into `<head>`, or mutating prototypes).
  - Explicitly specifying `"sideEffects": false` (or an array of side-effecting files like `"sideEffects": ["*.css", "*.scss"]`) grants the bundler permission to discard unimported exports safely.
- **Transpiler Traps:** Compiling ES6 classes with older Babel plugins transforms them into IIFEs that assign to prototypes. Many bundlers cannot verify that the IIFE is pure, retaining unused classes unless tagged with `/*#__PURE__*/`.

---

## 7. Web Workers: Offloading the Main Thread

**Question:** How do you handle heavy computational tasks (like image processing or complex data parsing) without freezing the UI?

**Answer:**
Use **Web Workers**. They allow you to run JavaScript in a background thread, separate from the main execution thread of the browser.

- **Communication:** via `postMessage` and `onmessage` event listeners.
- **Use Case:** Large data transformations, encryption/decryption, or any CPU-intensive logic that exceeds 16ms (to maintain 60fps).
- **React Integration:** Use a library like `comlink` or handle the worker lifecycle within a `useEffect`.

> [!TIP]
> Refer to [Web Workers](../../Performance/Network/README.md#1-web-workers-offloading-heavy-calculations) in the Network & Asset module for advanced multi-threading configurations.

---

## 8. React 18 Concurrent Features: `useTransition` & `useDeferredValue`

**Question:** How does React 18 help with UI responsiveness during heavy re-renders?

**Answer:**
React 18 introduced **Concurrent Rendering**, allowing React to interrupt a render to handle a high-priority event (like typing).

1.  **`useTransition`:** Returns a `startTransition` function that allows you to mark a state update as "non-urgent." React will prioritize urgent updates (like input typing) and render the transition update in the background.
2.  **`useDeferredValue`:** Similar to debouncing but managed by React. it "defers" a value update, allowing the UI to stay responsive while a heavy component (like a large filtered list) catches up.

**Explain Me:** Unlike `setTimeout` (which is a fixed delay), these hooks are "interruptible." If a new update comes in while React is rendering the deferred/transition state, it will abort the current render and start fresh with the new data.

> [!NOTE]
> For concurrent rendering pipelines and internal mechanics, see the [Concurrent React](../../Performance/React/README.md#-concurrent-react-react-18) details in the React optimization module.

---

## Senior/Staff Level "Grill" Questions

### Q1: Why is "Over-optimization" with `useMemo` potentially worse than not using it at all?

> **Answer:** Every `useMemo` has three costs:
>
> 1. **Memory:** Storing the previous value and dependency array.
> 2. **CPU:** Performing a shallow comparison of the dependency array on every render.
> 3. **Complexity:** Making the code harder to read and maintain.
>
> - **The "Staff" Nuance:** If the calculation takes < 1ms (most JS logic), the cost of the dependency check and memory overhead is often _higher_ than just re-calculating the value. Always measure with the **React Profiler** before memoizing.

### Q2: What is the "Zombie Child" problem and how does it relate to performance/correctness?

> **Answer:** This occurs in older state management libraries (or custom stores) where a parent and child are both subscribed to a store.
>
> - **The Scenario:** The store updates, and the update would cause the child to be unmounted. However, because the child is subscribed, its listener might fire _before_ the parent's render completes, causing the child to try to render with data that is no longer valid or intended for it (behaving like a "Zombie").
> - **The Fix:** React 18's **`useSyncExternalStore`** solves this by ensuring all components see a consistent "snapshot" of the store during a single render cycle.

### Q3: Explain "Cumulative Layout Shift" (CLS) and why Skeleton Screens can sometimes _increase_ it.

> **Answer:** CLS measures visual stability. Skeletons are meant to improve perceived performance, but if they don't _exactly_ match the dimensions of the final content (e.g., the skeleton is 200px tall but the image is 250px), the content will "jump" when it arrives.
>
> - **The Fix:** Use fixed-height containers with `aspect-ratio` or pre-calculate the height of dynamic content on the server so the skeleton is pixel-perfect.

### Q4: How does "Tree Shaking" actually work and what are "Side Effects"?

> **Answer:** Tree shaking is the process of removing unused code. It relies on **Static Analysis** of ES Modules (`import`/`export`).
>
> - **The Pitfall:** If a module has **Side Effects** (e.g., adding a property to `window` or modifying a prototype), the bundler _cannot_ safely remove it even if you don't use its exports.
> - **The Fix:** Mark your library as `"sideEffects": false` in `package.json` to tell the bundler it's safe to prune.
> - **Reference:** For details on ESM/CJS duplicate dependency resolution and bundling optimizations, see [Tree-Shaking & sideEffects deep-dive](../../Performance/Assets/README.md#q6-how-does-tree-shaking-actually-evaluate-sideeffects-in-packagejson-and-what-is-the-cjsesm-duplicate-dependency-trap).

---

## 9. Diagnosing Page Slowness After Adding Multiple API-Driven Components

**Question:** A page becomes noticeably slow after adding multiple API-driven components — how do you systematically isolate and resolve the bottleneck?

**Answer:**
Page slowness following multi-API component additions usually stems from bottlenecks across four distinct layers: **Network Contention**, **Main Thread CPU Exhaustion**, **React State Churn**, or **Browser Layout Thrashing**.

```
[User Action / Page Load]
          │
          ├── Layer 1: Network (HTTP/1.1 6-conn limit, waterfalls, uncompressed payloads)
          ├── Layer 2: Main Thread / CPU (JSON.parse of 5MB+ payloads, data mapping)
          ├── Layer 3: React Reconciliation (Multiple API completions -> cascading context renders)
          └── Layer 4: Browser Layout (Multiple components mounting & triggering forced reflows)
```

### Systematic Diagnostic Pipeline:

#### Step 1: Network Layer Triage (Chrome DevTools Network Tab)

1. **Connection Stalling & Queueing:**
   - _Symptom:_ Requests spend $>100\text{ms}$ in the `Queueing` or `Stalled` state.
   - _Root Cause:_ Under **HTTP/1.1**, browsers enforce a hard limit of **6 concurrent TCP connections per origin**. If 12 components fetch simultaneously, 6 requests block while waiting for connections to free up.
   - _Solution:_ Verify HTTP/2 or HTTP/3 multiplexing is enabled on the CDN/origin; consolidate micro-endpoints via a Backend-For-Frontend (BFF) or GraphQL batch query.
2. **Sequential Waterfalls:**
   - _Symptom:_ Staircase request graph where Component B only starts fetching after Component A resolves.
   - _Root Cause:_ Nested `<Suspense>` boundaries or components waiting for parent state before fetching.
   - _Solution:_ Hoist queries to route loaders or use TanStack Query parallel fetching (`useQueries`).

#### Step 2: Main Thread & CPU Profiling (Chrome DevTools Performance Tab)

1. Record a 5-second trace covering page load and component mounting.
2. Inspect the **Main Thread Flame Chart** for **Long Tasks (> 50ms)**:
   - **Heavy Scripting (Yellow):**
     - Search for `JSON.parse` or massive object deserialization. A 10MB JSON response blocks the main thread for $\approx 100\text{ms}$.
     - _Solution:_ Filter unnecessary fields at the API gateway; stream large payloads or offload JSON parsing to a **Web Worker**.
   - **Forced Synchronous Layouts (Purple):**
     - Look for red warning markers: "Forced reflow is a likely performance bottleneck".
     - _Root Cause:_ Components reading DOM metrics (`offsetWidth`, `getBoundingClientRect`) in `useEffect` or `useLayoutEffect` immediately upon mounting, causing repeated layout recalculations.
     - _Solution:_ Batch measurements or migrate to CSS layout containment (`contain: strict`).

#### Step 3: React Reconciliation Profiling (React DevTools Profiler)

1. Enable **"Record why each component rendered"** in React DevTools settings.
2. **Detect Render Avalanches:**
   - If 10 components resolve their APIs at 100ms, 120ms, 140ms, etc., and each component updates a shared global store/context, the entire tree re-renders 10 times consecutively.
   - _Solution:_ Colocate state locally, split monolithic contexts, or batch state updates.

---

## 10. Caching & Avoiding Duplicate API Requests

**Question:** How do you architect API caching, request deduplication, and avoid redundant network traffic across components?

**Answer:**

### 1. In-Flight Request Deduplication (Single-Flight Promise Cache)

When 5 independent components mount simultaneously and all need the current user's profile, naive code fires 5 identical HTTP calls. A deduplication layer shares a single in-flight promise:

```typescript
const inFlightRequests = new Map<string, Promise<any>>();

export function deduplicatedFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const cacheKey = `${init?.method || 'GET'}:${url}`;

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  const requestPromise = fetch(url, init)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .finally(() => {
      // Clean up in-flight reference once resolved/rejected
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
```

### 2. Stale-While-Revalidate (SWR / TanStack Query) Lifecycle

- **`staleTime` (Freshness Window):** Defines how long data is considered fresh. Components mounting within `staleTime` read directly from in-memory cache with **zero network traffic**.
- **`gcTime` (Garbage Collection Window):** Defines how long unused query cache remains in memory before eviction once all consuming components have unmounted.
- **Request Cancellation on Unmount (`AbortController`):**

  ```typescript
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/heavy-data', { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });

    return () => controller.abort(); // Cancels pending TCP transfer if user navigates away!
  }, []);
  ```

### 3. HTTP Gateway & Caching Headers

- **`Cache-Control: public, max-age=60, stale-while-revalidate=300`:** Allows the browser and CDN to return cached data immediately while fetching an update in the background.
- **`ETag` and `If-None-Match`:** Allows the server to respond with `304 Not Modified` (headers only, 0 byte body) when the resource has not changed.

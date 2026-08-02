# Architecture & Performance Guidelines

A comprehensive reference for frontend system design, state ownership, concurrency patterns, performance tuning, and staff-level engineering decisions.

---

## 1. State Ownership Matrix

Before choosing a state library or hook, evaluate the scope, lifetime, and owner of the state.

| State Category                    | Best Target Location / Tool                             |
| :-------------------------------- | :------------------------------------------------------ |
| **Input / Modal / Toggle**        | Local Component state (`useState` / `useReducer`)       |
| **Complex Local Flow**            | Component state (`useReducer`)                          |
| **Scoped Context / Theme**        | React Context API                                       |
| **Shareable Filter / Pagination** | URL Query Parameters (`useSearchParams` / React Router) |
| **Cached API Data**               | RTK Query / react-query / Loader Loader Data            |
| **Cross-Feature Domain State**    | Redux Toolkit / Zustand global store                    |
| **DOM Reference / Timers**        | Mutable ref container (`useRef`)                        |
| **Derived State**                 | Calculate on render / Selector queries (`useMemo`)      |

---

## 2. Async & Concurrency Pattern Selection

Choose the appropriate strategy depending on the user flow requirements:

```text
User enters query
  -> Immediate local input update (High Priority)
  -> Debounce network request (Prevent overload)
  -> Cancel/ignore stale outstanding responses (AbortController / takeLatest)
  -> Defer heavy rendering updates if needed (useDeferredValue / Transitions)
```

### Pattern Helpers

- **`AbortController`**: Core browser API to cancel network fetches.
- **`takeLatest` (Saga)**: Cancels stale worker generator threads when a new request is made.
- **`debounce`**: Waits for inactivity before invoking side-effects.
- **`throttle`**: Capped execution frequency for continuous events (e.g. scroll, resize).
- **`Promise.all`**: Runs independent async actions concurrently.
- **`race` (Saga)**: Cancels other actions when the first wins (e.g. timeout triggers).
- **`startTransition`**: Lowers React rendering priority (not network priority).

---

## 3. Error Boundaries by Layer

Design error catching interfaces contextually to avoid crashing the entire application:

```text
Application Root Error Boundary (Critical recovery page)
  └─ Route Error Boundary (Sub-page recovery wrapper)
      └─ Feature Error Boundary (Localized widget crash state)
          └─ Inline Async State Error (Component error state)
```

### Error Separation Checklist

- **Transport errors**: Network disconnection. Handled inline or via toasts.
- **Protocol errors**: 4xx / 5xx responses. Handled via APIs or forms.
- **Validation errors**: User inputs. Handled with forms.
- **Programming errors**: Render crashes. Handled by Error Boundaries.
- **Auth errors**: 401/403. Handled at route layouts (redirection).

---

## 4. Performance Decision Framework

Never optimize prematurely. Follow this cycle:

```text
Measure (Profiler, Vitals)
  -> Find bottleneck
  -> Identify cause (JS CPU, paint layout, network, memory)
  -> Apply targeted optimization
  -> Measure again to verify
```

### Common Optimizations

1. **Move state down**: Keep local state as close to its rendering consumers as possible.
2. **Code splitting**: Lazy load pages and heavy chunks using `lazy` + `Suspense`.
3. **Virtualization**: Render only visible viewport rows for extremely large lists.
4. **Stable identities**: Use `useCallback` and `useMemo` when components are wrapped in `React.memo` or stability is required by dependencies.
5. **Normalize cache schemas**: Avoid redundant nested structures.

---

## 5. Common Frontend Architecture Traps

```text
❌ useEffect used to compute derived state (compute directly during render instead)
❌ Using array index as rendering key for dynamic lists
❌ useMemo and useCallback applied everywhere without measuring performance
❌ Context API used as a high-frequency global state store (causes massive re-renders)
❌ Copying loader/RTK Query responses into local useState slices
❌ Using Redux-Saga for simple, standard GET/POST request lifecycles
❌ Using any at API/form boundaries
❌ Using Type Assertions (as) instead of runtime schema validations
❌ pathname.includes('/dashboard') checking instead of router-aware match selectors
```

---

## 6. System Architecture Layout

```text
Browser / URL Context
       ↓
React Router (Single URL controller)
  ├── path params & search query params
  ├── loaders & action triggers
  └── routing layout boundaries
       ↓
Feature UI Components
  ├── local state: useState / useReducer
  ├── scoped contexts: configurations/themes
  ├── network queries: RTK Query / react-query
  └── global domain: Redux Toolkit / Zustand
       ↓
Side-Effect Middleware
  ├── thunks / RTK listeners
  └── Redux-Saga (for complex long-running operations)
       ↓
Network API / WebSocket
```

---

## 7. Fast Selection Cheat Sheet

- Need component state? -> `useState`
- Multi-state related changes? -> `useReducer`
- DOM Node / timer handle? -> `useRef`
- Sync with external system? -> `useEffect`
- Pre-paint measurements? -> `useLayoutEffect`
- Subtree configuration injection? -> `Context`
- Sync to external store? -> `useSyncExternalStore`
- Cache expensive calculation? -> `useMemo`
- Stable callback identity? -> `useCallback`
- Non-urgent visual renders? -> `useTransition` / `startTransition`
- Async render loading placeholder? -> `Suspense`
- Catch component exceptions? -> `ErrorBoundary`
- Code splitting chunks? -> `lazy`
- Shareable page configuration? -> URL Search Params
- Safe unknown boundary check? -> `unknown` + runtime validator
- Conform type without losing narrowness? -> `satisfies`

---

## 8. Staff-Level Design Questions

For every architectural block, be ready to defend:

1.  **Ownership**: Who is the single source of truth?
2.  **Lifetime**: When is this state created and cleaned up?
3.  **Consistency**: How are concurrent requests and optimistic rollbacks resolved?
4.  **Failure**: What happens during off-line, timeouts, and partial breakdowns?
5.  **SSR/Hydration**: Are SSR outcomes deterministic across server and browser?
6.  **Accessibility**: Are screen readers, keyboard focus, and layouts compliant?
7.  **Observability**: Are errors, page load speeds, and API latency measured?
8.  **Maintainability**: Is the code clear, testable, and documented?
9.  **Migration**: Can this layout evolve incrementally without total rewrites?

---

## 9. Senior/Staff Scenario & Debugging Grill

### Scenario 1: "Tell me about a system you built and the trade-offs you made."

#### 🏆 The Architectural Framework

```text
Problem ──► Constraints ──► Design ──► Trade-offs ──► Results
```

#### Real-World Example: In-house React Component Library (Tessera)

- **Problem**: High UI duplication and design inconsistency across multiple distinct product lines.
- **Constraints**:
  - Coordinating updates across multiple autonomous teams.
  - Maintaining strict backward compatibility to avoid breaking production apps.
  - Enabling rapid, independent release schedules.
  - Adhering to corporate-wide consistent UX guidelines.
- **Design/Decision**:
  - Adopted **Atomic Design** principles (atoms, molecules, organisms) for composition.
  - Implemented strict **TypeScript** contracts for props.
  - Built a isolated interactive testing ground using **Storybook**.
  - Synchronized design styles (colors, spacing) using shared design tokens.
- **Trade-offs**:
  - _Upfront Cost:_ Initial development and alignment took significantly longer.
  - _Migration Drag:_ Product teams were forced to pause feature work to migrate legacy components.
  - _Decision:_ We accepted a larger upfront engineering investment to guarantee major long-term maintenance and alignment savings.
- **Results**:
  - Accelerated feature delivery speeds post-adoption.
  - Consistent, bug-free corporate visual identity.
  - Significantly easier onboarding for new frontend developers.
  - Erased duplicated UI code across repositories.

---

### Scenario 2: "Your API is slow under load. How do you debug it?"

#### 🏆 The Request Lifecycle Path

Do not jump straight to adding caches. Walk through the request path step-by-step:

```text
Browser ──► CDN ──► Load Balancer ──► API Gateway ──► Application ──► Cache ──► Database ──► External Services
```

#### Diagnostic Steps at Each Layer

1.  **Is the Network layer slow?**
    - Check DNS resolution times, TLS handshake latency, HTTP/2 multiplexing limits, and payload transfer sizes.
2.  **Is the Server/Runtime saturated?**
    - Monitor CPU usage, memory leaks, thread pool capacity, or event loop lag (e.g. blocking CPU tasks in Node).
3.  **Is the Database the bottleneck?**
    - Search for slow queries (check `EXPLAIN ANALYZE`), missing search indexes, write/read locks, connection pool exhaustion, or N+1 query loops.
4.  **Is Caching efficient?**
    - Analyze Cache Hit Ratios, high cache miss rates, or Redis node connection latencies.
5.  **Are External dependencies blocking?**
    - Measure response latencies from payment gateways, oauth identity providers, or third-party tracking APIs.

#### 📊 Observability Checklist

- **Logs**: Audit system errors and HTTP response status frequencies.
- **Metrics**: Monitor hardware metrics (CPU, RAM, disk I/O) and load averages.
- **Traces**: Use distributed tracing (e.g. Jaeger, OpenTelemetry) to track span duration across database, memory cache, and network requests.

> **Staff Interview Answer:**
> _"I would isolate the bottleneck by inspecting distributed tracing metrics to locate where the request spends the most time. If database query spans dominate, I'd analyze index coverage and check for database connection pool exhaustion. If the runtime CPU is saturated, I'd profile the event loop and consider horizontal scaling. I avoid guess-and-test optimizations."_

---

### Scenario 3: "UI data is loading slowly. What would you do?"

#### 🏆 The Rendering Pipeline Path

Isolate whether the lag is client-side network, rendering scripting, or painting:

```text
User Click ──► Request Sent ──► API Responds ──► JS Processing ──► React Render ──► Browser Paint
```

#### Layered Debugging Strategy

- **Step 1: Measure first.**
  - Use Chrome DevTools Network and Performance panels.
  - Identify: Is TTFB (Time to First Byte) high? Is content download slow? Is JS execution blocking the main thread?
- **Step 2: If the Network is the bottleneck:**
  - Implement Brotli/Gzip compression, reduce payload sizes, introduce pagination, use GraphQL field selection, and utilize CDN edge caching.
- **Step 3: If JavaScript parsing is slow:**
  - Split bundle files using dynamic imports (`lazy`), defer third-party scripts, and offload computational processing (e.g. data parsing) to Web Workers.
- **Step 4: If React Rendering is slow:**
  - Profile using React DevTools. Apply `React.memo`, `useMemo`, or `useCallback` where parent re-renders are causing expensive children updates. Implement **List Virtualization** (e.g. `react-window`) for long scroll feeds.
- **Step 5: If Browser Painting is slow:**
  - Reduce DOM tree size, avoid layout thrashing (mutating DOM layout properties recursively), optimize CSS selectors, and leverage lazy-loading for images.

---

## 10. The Debugging Mindset Interviewers Love

For every performance problem, follow this strict loop. **Measure first, optimize second:**

```text
1. Reproduce ──► 2. Measure ──► 3. Isolate ──► 4. Identify Bottleneck ──► 5. Fix ──► 6. Re-Measure ──► 7. Monitor
```

- **Avoid the Common Trap**: Never jump straight to solutions (like "let's use `React.memo` everywhere" or "let's add a Redis layer") without hard metrics.
- **The Senior Engineer standard**: Demonstrate that you locate the exact source of lag by measuring first, isolating the layer, correcting it, and verifying with comparative profiles.

# System Design & Frontend Master Reference

> A modular reference guide for System Design (Databases, Flows), React, React Router, state management, Redux Toolkit, Redux-Saga, TypeScript, performance, architecture, and interview-level trade-offs.

---

## 📚 Categorized Cheat Sheets

For in-depth references, code blocks, and architectural choices, visit the categorized sheets:

- 🧱 **[Backend & System Design Fundamentals](Backend_System_Design_Fundamentals.md)**: Master reference covering what each concept solves, why it's needed, and when to use it across Database & Consistency (Indexing, ACID, Isolation levels, Optimistic/Pessimistic locking, Race conditions), Scalability (LB, Rate limiting, Caching, Scaling paths), Async Reliability (Message queues, Idempotency, Fault tolerance, Backoff & jitter, Circuit breakers, Observability), OS Primitives (Process vs Thread, Thread pools), and API Communication (Simplex/Half/Full-Duplex, Pagination, REST, WebSockets, SSE, CDN).
- 🗄️⚡ **[Database Scaling Architecture Master Cheatsheet](Database_Scaling_Cheatsheet.md)**: Complete guide to scaling databases (Structured vs. Non-Structured SQL/NoSQL showdown, Indexing, Query Optimization, Connection Pooling, Sharding, Read Replicas, Materialized Views, CQRS, Functional Domain Split, Table Partitioning, Redis Caching, CDC & Write Buffering, Distributed SQL), animations, pros & cons, trade-offs, and scaling ladder.
- 🗄️ **[Database Decisions & Architectures](dbdecision.md)**: A structured framework for choosing databases, selection matrix, case studies, and interview design flows.
- 🛡️ **[Rate Limiting & Deadlocks Master Cheatsheet](RateLimiting_and_Deadlocks.md)**: Distributed rate limiting algorithms, Redis Lua scripts, horizontal vs vertical scaling, fail-open/closed fallback strategies, Coffman conditions, ABBA mutex code fix, and deadlock prevention.
- ⚖️ **[Load Balancing Algorithms & Architectures](Load_Balancing_Algorithms.md)**: Frontend client-side balancing, Web Worker thread pools, GeoDNS & BGP Anycast, L4 vs L7, HTTP/2 & gRPC single-connection trap, Round Robin, Least Connections, Consistent Hashing (V-Nodes), Power of Two Choices (P2C), and Maglev.
- 🌳 **[Document Object Model (DOM)](DOM.md)**: Live vs Static collections, Shadow DOM, Event delegation, element metrics, and optimization paths.
- 🧪 **[Periodic Table of HTML Elements](https://blog.alena.rocks/en/artifacts/html-elements/)**: Interactive periodic table covering all 115 HTML Living Standard elements categorized across 11 spec sections with void elements and MDN documentation links.
- 🎨 **[CSS Object Model (CSSOM)](CSSOM.md)**: Critical Rendering Path, inline vs computed styles, CSS variables, performance optimizations, and Font metrics (Ascenders / Descenders).
- 📐 **[CSS Units & Sizing Master Guide](cssUnits.md)**: Exhaustive breakdown of absolute (`px`, `pt`), relative (`rem`, `em`, `ch`, `lh`), viewport (`vw`, `vh`, `dvh`, `svh`), and container query units (`cqi`, `cqw`).
- 🌐🔗 **[How the Web Works: High-Level](web.md)**: Visual 17-step web touchpoints flow, browser pre-checks, and Critical Rendering Path (CRP) maps.
- ⚙️ **[WebAssembly (WASM) & Web SDK](webassembly-web-sdk.md)**: WASM compilation, Memory Grow trapping, Workers integration, multithreading isolation, public SDK design, loading snippet queues, and storage partitioning.
- ⚛️ **[React Core & Component State Patterns](ReactInternals/index.md)**: React Hooks, rendering lifecycle, and the loading/success/error/empty 4-state component pattern.
- 🔀 **[React Router](ReactInternals/index.md)**: Navigation, search params, loaders/actions, and safe usage of `useMatch`.
- 💾 **[State Management](state-management.md)**: 5 State Buckets, Execution Lifecycles & Pipelines (`useState`, `useReducer`, RTK Thunk, Redux-Saga, Zustand, MobX, XState v5/v6 Actor Model) with Mermaid sequence diagrams, complete API references, and "Which & When to Use" decision tree matrix.
- ⚡ **[Advanced State Architecture & Production Patterns](state-management-advanced.md)**: Atomic state & Signals (Jotai, Solid), Form state engineering (React Hook Form + Zod, 60fps input lag fix), Optimistic UI updates with rollback, Offline Outbox pattern, Cross-Tab synchronization (`BroadcastChannel`), SSR hydration safety (`useSyncExternalStore`), and top 5 performance traps.
- 📦 **[Package Managers, Monorepos & Workspace Architecture](package-managers.md)**: `pnpm` vs `yarn` vs `npm` hierarchy, Content-Addressable Storage (CAS), Phantom Dependencies, Corepack zero-install toolchains, pnpm workspaces (`workspace:*`), and Monorepo build orchestrators (**Turborepo vs Nx**).
- 📄 **[API Pagination Architecture (Offset vs. Keyset vs. Cursor)](pagination.md)**: Complete guide covering Limit/Offset vs. Keyset/Cursor, $O(N)$ deep paging trap, $O(1)$ index seeks, compound Base64 tokens, GraphQL Relay spec, and 60 FPS infinite scroll client caching.
- 📘 **[TypeScript & Typings](typescript.md)**: Types vs Interfaces, enum alternatives, utility types, and React prop/event integration.
- 🏗️ **[Architecture & Performance](architecture.md)**: State ownership, concurrency patterns, virtualization, traps, and staff-level design questions.
- 🌐 **[Browser Object Model (BOM)](BOM.md)**: Window execution, location controls, screen boundaries, and cross-tab communication.
- 🧹 **[Clean Code Guidelines](cleancode.md)**: SOLID principles, code smells, UI separation of concerns, and clean async state management.
- 🎨 **[CSS Hub & Modular Architecture](css/index.md)**: Master index of modular CSS sheets:
  - 📐 [01. CSS Units & Values](css/01_css_units_and_values.md) — Relative (`rem`, `em`, `ch`, `lh`), Viewport (`dvh`, `svh`), Container (`cqi`), Absolute (`px`, `pt`, `fr`).
  - 📱 [02. Responsive Design & Media Queries](css/02_responsive_design_and_media_queries.md) — Media types, Range comparison syntax, 5-device Breakpoint Matrix, Mobile-First, Fluid `clamp()`.
  - 🏗️ [03. Layout Engines, Grid, Subgrid & Box Model](css/03_layout_engines_grid_subgrid_and_box_model.md) — Flex (1D) vs Grid (2D), CSS Positioning Matrix, Stacking Contexts & `isolation: isolate`, `box-sizing` paradox, Subgrid, `aspect-ratio`.
  - 🎯 [04. Modern Selectors, Nesting & Cascade](css/04_modern_selectors_nesting_and_cascade.md) — Native Nesting rules, `:has()`, `:has(:not())` vs `:not(:has())`, `:is()` vs `:where()`, Cascade Layers (`@layer`), `:user-invalid`, `sibling-index()`.
  - ⚡ [05. Transitions, Animations & Scroll Effects](css/05_transitions_animations_and_scroll.md) — Compositor performance, `@keyframes`, Scroll-Driven Animations, `overflow: clip`, Mac vs Windows layout shift & `scrollbar-gutter: stable`.
  - 🎨 [06. Colors, Math & Advanced Mechanics Q&A](css/06_colors_math_and_advanced_mechanics_qa.md) — `oklch()`, `color-mix()`, `sign()`, Motion Path (`offset-path: border-box`), Layout interview Q&A.
  - 📈 [07. Evolution of CSS](css/07_evolution_of_css.md) — Paradigm evolution from table layouts to Sass, BEM, CSS-in-JS, Tailwind, and Modern Native specs.
  - 🧩 [08. Layout & Box Model Mechanics Q&A](css/08_qa_layout_and_box_model_mechanics.md) — Grid RAM clamp, `100%` + margin overflow paradox, vertical % margin width dependency, Subgrid, `100vw` desktop scrollbar bug.
  - 📐 [09. Units, Viewports & Container Queries Q&A](css/09_qa_units_viewports_and_container_queries.md) — Container query fallback (`svi`/`svw`), `cqi` vs `cqw`, container pitfalls, `sign()` conditional radius, DPR, `100dvh` vs `100svh`, `rem` vs `em`.
  - 🚀 [10. Modern Features, Animations & Fallbacks Q&A](css/10_qa_modern_features_animations_and_fallbacks.md) — `offset-path: border-box`, `sibling-index()`, `:user-invalid`, `oklch()`, modern CSS feature adoption framework, scroll-driven entry persistence (`forwards`).
- ♿ **[Web Accessibility (a11y) & WCAG Architectural Guide](WCAG_Accessibility.md)**: WCAG 2.1/2.2 compliance, POUR principles, ARIA rules, accessible design patterns, focus management, SPA route announcer, and Staff/Architect interview grill.
- ⚙️ **[ESLint Master Configuration & Architecture Cheatsheet](eslint.md)**: Enterprise ESLint setup, Strict a11y, TypeScript type-checked rules, React Compiler, Storybook CSF3, i18n FormatJS, security, testing queries, and Flat/Legacy config templates.
- 🛡️ **[Security Architecture Interview Grill](Security_Architect.md)**: SDE-1 to Staff/Architect security concepts, OAuth2/OIDC, CSRF/XSS, CSP, IDOR, Zero Trust, and secure system design.
- ⚡ **[Performance Optimization](Performance_Optimization.md)**: Core Web Vitals, browser rendering performance, bundle splitting, memory leak debugging, and network optimization.
- 🔍 **[Regular Expressions (RegEx)](regex.md)**: Match patterns, character classes, quantifiers, lookarounds, logic flow engine, and performance tips.
- 👷 **[Web Workers & Service Workers](service-workers-and-web-workers.md)**: Dedicated & Shared Workers, Service Worker lifecycle, Caching strategies, Structured Clone vs Transferable Objects, and Background Sync.
- 📱 **[Progressive Web Applications (PWA)](PWA_Application.md)**: Web App Manifest, Installability lifecycle (`beforeinstallprompt`), App Shell & PRPL, Offline Outbox Sync, and Project Fugu Hardware APIs.
- 🤖 **[AI, GenAI & Agentic Systems Engineering Cheatsheet](AI_Engineering_Cheatsheet.md)**: Evolution from chatbots to agents, AI a11y, SDLC lifecycle, LLMs, tokens, chunking, context windows, embeddings, Vector DBs, RAG, tool calling, structured outputs, agentic loops, rules (`CLAUDE.md`, `GEMINI.md`, `SKILL.md`), MCP, and safety guardrails.
- 💳 **[Payment Architecture Part 1: Hardware, Terminal & Network Switching](Payment_Card_ATM_Voucher_Part1_Hardware_and_Switching.md)**: Physical interfaces (Magstripe Track 1/2, EMV Chip, NFC Tap, Tokenization/DPAN), ISO 8583 / ISO 20022 messaging, Dual-Message vs Single-Message clearing, ATM cash withdrawal & reversal mechanics, and Closed-Loop vs Open-Loop gift card architectures with comprehensive Mermaid diagrams.
- 💳 **[Payment Architecture Part 2: Software, Subscriptions & Operations](Payment_Card_ATM_Voucher_Part2_Software_and_Operations.md)**: PAN & BIN anatomy, 4 distinct CVV flavors (CVV1, CVV2, iCVV, dCVV), Frontend Hosted Fields & client Luhn Mod-10, Backend idempotency & signed webhooks, 3DS2 frictionless/challenge flows, chargeback disputes, offline in-flight Store-and-Forward (SAF), and Auto-Debit Subscriptions (CIT vs. MIT, Visa VAU/Mastercard ABU).
- 📡 **[HTTP Headers & Status Codes Master Cheatsheet](Headers.md)**: The 12 headers worth knowing (`Authorization`, `Content-Type`, `Accept`, `Cache-Control`, `ETag`, `If-None-Match`, `Location`, `Retry-After`, `Idempotency-Key`, `traceparent`, `Set-Cookie`, `Content-Encoding`), the Fab 5 security/caching headers (`Vary`, `HSTS`, `CSP`, `Origin`/CORS, `Upgrade`), and complete 1xx–5xx status code decision trees.
- 🚀 **[System Scalability & Performance Blueprint](Scalability.md)**: Throughput vs Latency golden signals, horizontal vs vertical scaling, read/write database scaling, SLA/SLO/SLI nines, rate limiting algorithms, and consistent hashing rings.
- 🏢 **[Frontend Architecture & Scaling](Architecture_Scaling.md)**: Technical and organizational scaling, rendering strategies (CSR, SSR, SSG, ISR), `"use client"` nuances, state density, and scalable testing.
- 🧩 **[Micro-Frontends Architecture](MicroFrontends.md)**: Module Federation, runtime vs build-time integration, cross-MFE state sharing, CSS isolation, and independent deployment versioning.
- 🎨 **[Design Patterns (GoF)](Design_Patterns.md)**: Creational (Factory, Singleton, Builder), Structural (Adapter, Decorator, Facade), and Behavioral (Observer, Strategy, Command, State) patterns with TypeScript code implementations.
- 💻 **[Machine Coding Preparation Guide](machine_code.md)**: 90-minute live coding execution blueprint, structural separation of concerns, state management scaffolds, and edge-case handling.
- 🖥️ **[Browser, Build & Networking](Browser_Build_Networking.md)**: Module bundlers (Vite, Webpack, Rollup), tree-shaking, code-splitting, critical rendering path, and HTTP/2 multiplexing.
- 📊 **[Console Master Cheatsheet](Console_Master_Cheatsheet.md)**: Advanced Chrome DevTools console APIs (`console.table`, `console.time`, `console.group`, `console.profile`), heap snapshot triggers, and telemetry debugging.
- 🌿 **[Git Internals & Architecture](Git.md)**: Directed Acyclic Graph (DAG), blob/tree/commit objects, fast-forward vs three-way merges, interactive rebase, and conflict resolution mechanics.
- 🔍 **[Git Pre-Read Analysis](Git%20Pre-Read%20Analysis.md)**: Commit history heuristics, identifying architectural churn hotspots, and tracking code stability.
- 🎯 **[Senior & Staff Interviewer Reference](Interviewer_Reference.md)**: Comprehensive evaluation rubrics, candidate signal detection (Junior vs Senior vs Staff), and grading frameworks across security, state, and scaling.
- ❓ **[System Design & Architecture Questions Bank](ques.md)**: High-frequency system design interview scenarios, trade-off breakdowns, and failure mode grill questions.
- ⚡ **[Evolution of React](evolutionReact.md)**: Historical architectural progression from Create-Class and Class Components to React Hooks, Concurrent Fiber, Selective Hydration, and React Server Components (RSC).
- ⌨️ **[Terminal & CLI Mastery Cheatsheet](terminal.md)**: Unix shell productivity, process inspection (`lsof`, `kill`, `ps`), piping, curl diagnostics, and workflow shortcuts.
- 📖 **[Tech Acronyms Dictionary](tech-acronyms.md)**: Comprehensive industry dictionary covering networking, security, distributed systems, and frontend terminology.
- 💡 **[Miscellaneous System Design & Frontend Edge Cases](Misc.md)**: Edge cases, memory retention patterns, browser sandbox boundaries, and rare interview scenarios.
- 🏛️ **[Core Engineering Pillars & Senior Developer Competency Guide](Core_Engineering_Pillars.md)**: The 12 fundamental engineering pillars (Heap vs Stack, Closures, V8 Garbage Collection, Event Loop, HTTP/3 & Networking, NDJSON streaming, Zod runtime API validation, Core Web Vitals, a11y, i18n, Security, and Resilient Error Handling).

---

## 🎯 Quick Lookup: API Index by Job

Use this high-level list to find the correct primitive for your specific problem. For detailed usage, click the links above.

### Remember and share data

- [`useState`](ReactInternals/index.md#state--data) — Remember a value owned by one component.
- [`useReducer`](ReactInternals/index.md#state--data) — Centralize several related state updates.
- [`useLinkedState`](ReactInternals/index.md#state--data) _(Custom)_ — Keep local editable state in sync with a changing external value.
- [`createContext`](ReactInternals/index.md#state--data) — Create information a subtree can provide.
- [`use` / `useContext`](ReactInternals/index.md#state--data) — Read context; `use` also reads Promises.
- [`useSyncExternalStore`](ReactInternals/index.md#state--data) — Subscribe to a store managed outside React.

### Connect to the browser

- [`useRef`](ReactInternals/index.md#dom--effects) — Keep a DOM node or mutable value without rendering.
- [`useEffect`](ReactInternals/index.md#dom--effects) — Synchronize with an external system after paint.
- [`useLayoutEffect`](ReactInternals/index.md#dom--effects) — Measure or adjust layout before paint.
- [`useInsertionEffect`](ReactInternals/index.md#dom--effects) — Insert styles before layout effects; mainly for libraries.
- [`useEffectEvent`](ReactInternals/index.md#dom--effects) — Call the latest logic from an effect without reacting to it.
- [`useId`](ReactInternals/index.md#dom--effects) — Create an accessible ID stable across server and client.
- [`useImperativeHandle`](ReactInternals/index.md#dom--effects) — Customize the value exposed through a ref.

### Load and reveal UI

- [Hydrate / `hydrateRoot`](ReactInternals/index.md#loading--concurrency) — Keep server HTML dormant and load its behavior on demand.
- [`Suspense`](ReactInternals/index.md#loading--concurrency) — Show a fallback while descendants wait.
- [`ErrorBoundary`](ReactInternals/index.md#loading--concurrency) — Replace a failed subtree with an error fallback.
- [`lazy`](ReactInternals/index.md#loading--concurrency) — Load a component's code on demand.
- [`startTransition`](ReactInternals/index.md#loading--concurrency) — Mark an update as non-urgent.
- [`useTransition`](ReactInternals/index.md#loading--concurrency) — Start a transition and read its pending state.
- [`useDeferredValue`](ReactInternals/index.md#loading--concurrency) — Let a slow child temporarily use an older value.
- [`Activity`](ReactInternals/index.md#loading--concurrency) — Hide or prerender a subtree while suppressing its effects.

### Handle actions and forms

- [`useActionState`](ReactInternals/index.md#forms--actions-react-19) — Track an action's result and pending state.
- [`useFormStatus`](ReactInternals/index.md#forms--actions-react-19) — Read the nearest parent form's active action.
- [`useOptimistic`](ReactInternals/index.md#forms--actions-react-19) — Show an expected result before an action finishes.
- [`requestFormReset`](ReactInternals/index.md#forms--actions-react-19) — Request an uncontrolled-form reset from an action or transition.

### Compose and optimize

- [`Fragment`](ReactInternals/index.md#optimization-apis) — Group siblings without an extra DOM element.
- [`memo`](ReactInternals/index.md#optimization-apis) — Skip a component render when its props are unchanged.
- [`useMemo`](ReactInternals/index.md#optimization-apis) — Reuse an expensive calculated value.
- [`useCallback`](ReactInternals/index.md#optimization-apis) — Reuse a function identity when a consumer needs it.
- [`createPortal`](ReactInternals/index.md#optimization-apis) — Render into another DOM container.
- [View Transition APIs](ReactInternals/index.md#optimization-apis) — Coordinate browser View Transitions.

### Roots, resources, and library tools

- [`createRoot` / `hydrateRoot`](ReactInternals/index.md#resource--root-apis) — Start a client tree or adopt server HTML.
- [Resource Hints](ReactInternals/index.md#resource--root-apis) (`preload`, `preinit`, `preconnect`, `prefetchDNS`) — Tell the browser about resources early.
- [`createElement` / `cloneElement`](ReactInternals/index.md#resource--root-apis) — Create or adapt element descriptors.
- [`isValidElement` / `Children`](ReactInternals/index.md#resource--root-apis) — Inspect component children in library code.
- [`flushSync` / `act`](ReactInternals/index.md#resource--root-apis) — Integrate synchronous DOM work or test updates.
- [`useDebugValue`](ReactInternals/index.md#resource--root-apis) — Compatibility hook; development tool labeling.
- [`setSsrSuspenseTimeout`](ReactInternals/index.md#resource--root-apis) — Configure the server's global deadline for unresolved async data.
- [`version`](ReactInternals/index.md#resource--root-apis) — Read the installed React version.

---

### Databases, Systems & Sharding

- [CAP Theorem](Scalability.md#4-database-scaling-the-bottleneck) — Consistency, Availability, Partition tolerance tradeoffs.
- [Database Selection Matrix](dbdecision.md#3-database-selection-matrix) — Choose between Relational, Key-Value, Document, Wide-Column, Graph, and Time-Series.
- [Multi-Database Case Studies](dbdecision.md#5-case-studies-multi-database-architectures) — Real-world database layouts of Uber, Instagram, WhatsApp, and YouTube.
- [Functional vs Non-Functional Requirements](dbdecision.md#1-requirements-engineering-functional-fr-vs-non-functional-nfr) — Distinguish FRs vs NFRs with e-commerce mental models.
- [**API Pagination Architecture**](pagination.md) — Master guide on Offset vs Keyset vs Cursor, SQL deep paging traps, compound Base64 tokens, and GraphQL Relay specs.

---

### Browser DOM & BOM APIs

- [`event.target` vs `event.currentTarget`](BOM.md#63-event-propagation--delegation) — Distinguish triggered elements from listener nodes.
- [Event Delegation](BOM.md#event-delegation-pattern) — Handle clicks on wrapper nodes to improve performance.
- [`window.postMessage`](BOM.md#11-cross-origin-window-messaging-postmessage) — Secure cross-origin communication with origin validation.
- [`history.pushState`](BOM.md#21-state-pushes-and-browser-back-navigation) — Navigate SPA routes programmatically without document reloads.
- [Scroll Coordinates & Infinite Scroll](BOM.md#64-scroll--viewport-formulas) — Screen measurements using `scrollY`, `innerHeight`, and `scrollHeight`.
- [**IntersectionObserver & Scroll Architecture**](IntersectionObserver_and_Scroll.md) — Production deep dive: `IntersectionObserver` vs `window.scrollY`, `threshold`, `rootMargin`, the Sentinel Pattern, and Layout Thrashing prevention.
- [Shadow DOM Style Scoping](DOM.md#4-the-shadow-dom--web-components) — Create styling boundaries isolated from parent stylesheets.
- [High-Level Web Rendering Flowchart](web.md#1-web-touchpoints-flow) — 17-step chronological connection and layout flow from URL to pixels.

---

### CSSOM & Layout Configurations

- [Computed vs Inline Styles](CSSOM.md#3-reading-styles-inline-vs-computed-styles) — Prevent performance regressions caused by forcing layouts recalculation.
- [Font Ascent & Descent Metrics](CSSOM.md#7-deep-dive-font-metrics--alignment-ascenders--descenders) — Control baseline layouts using `ascent-override`, `descent-override`, and `line-gap-override`.
- [Cumulative Layout Shift (CLS)](CSSOM.md#6-css-performance--loading-optimization) — Secure web vitals using aspect ratios and dynamic image reservations.
- [Cascade Layers (`@layer`)](evolutionCSS.md#era-6-modern-native-css-spec-advancements) — Control cascade overrides without raising class specificity.

---

### WebAssembly & Offloading

- [Memory Grow Trapping](webassembly-web-sdk.md#23-the-memory-grow-trap-typed-array-invalidation) — Handle JS view detachment after `memory.grow()` calls.
- [Cross-Origin Isolation Headers](webassembly-web-sdk.md#52-threads--cross-origin-isolation-coopcoep) — Secure `SharedArrayBuffer` using COOP/COEP headers.
- [Asynchronous Queue Loader](webassembly-web-sdk.md#82-the-snippet-loader-pattern-asynchronous-queueing) — Buffer commands inside arrays before scripts finish loading.
- [Storage Partitioning](webassembly-web-sdk.md#192-storage-partitioning--third-party-restrictions) — Handle partitioned `localStorage` inside third-party iframe boundaries.

---

### Web Accessibility (a11y) & WCAG Architectural Patterns

- [5 Golden Rules of ARIA](WCAG_Accessibility.md#the-5-golden-rules-of-aria) — Native HTML vs ARIA polyfills and when not to use ARIA.
- [`tabIndex` Master Guide (`0`, `-1`, `<0`, `>0`)](WCAG_Accessibility.md#3-the-tabindex-master-guide-0--1-0-0) — Browser navigation behavior, programmatic focus, and why positive values are an anti-pattern.
- [`inert` vs `aria-hidden` vs `display:none` vs `.sr-only`](WCAG_Accessibility.md#2-hiding-elements-inert-vs-aria-hidden-vs-displaynone-vs-sr-only) — Trade-offs and accessibility tree visibility.
- [Roving `tabIndex` vs `aria-activedescendant`](WCAG_Accessibility.md#4-focus-management-roving-tabindex-vs-aria-activedescendant) — Focus management strategies for composite widgets.
- [Modal Focus Trapping & Restoration](WCAG_Accessibility.md#pattern-1-modal-dialogs--focus-trapping-native-dialog-vs-custom-portal) — Native `<dialog>` top layer vs portal focus traps.
- [SPA Route Announcer](WCAG_Accessibility.md#pattern-3-single-page-application-spa-route-transitions--focus-reset) — Dynamic client-side routing focus reset and screen reader announcements.
- [A11y CI/CD Pipeline & Automated Governance](WCAG_Accessibility.md#accessibility-testing--governance-pipeline) — Shift-left testing with `axe-core`, Playwright, and ESLint.

---

### Backend & System Design Fundamentals

- [Process vs. Thread](Backend_System_Design_Fundamentals.md#process-vs-thread) — Memory isolation (virtual address space vs. shared heap), context switching overhead, and IPC.
- [Thread Pool Architecture & Goetz Formula](Backend_System_Design_Fundamentals.md#thread-pool-architecture) — Formula $N_{\text{threads}} = N_{\text{CPU}} \times U_{\text{CPU}} \times (1 + \frac{W}{C})$, task queue buffering, and caller-runs backpressure.
- [Simplex vs. Half-Duplex vs. Full-Duplex](Backend_System_Design_Fundamentals.md#communication-channels-simplex-vs-half-duplex-vs-full-duplex) — Unidirectional (telemetry) vs. alternating (HTTP/1.1) vs. simultaneous bidirectional (WebSockets / HTTP/2 multiplexing).
- [Database Indexing (B+ Tree vs Hash vs LSM)](Backend_System_Design_Fundamentals.md#database-indexing) — $O(\log N)$ range scans vs. $O(1)$ point lookups vs. write-optimized append logs.
- [ACID Transactions & Isolation Levels](Backend_System_Design_Fundamentals.md#acid-transactions-in-depth) — WAL atomicity, durability fsync, and 4 isolation levels mapped against Dirty, Non-Repeatable, and Phantom reads.
- [Optimistic vs. Pessimistic Locking](Backend_System_Design_Fundamentals.md#optimistic-vs-pessimistic-locking) — Version CAS checks vs. `SELECT FOR UPDATE` row locks with sequence flows.
- [Race Conditions & Check-Then-Act](Backend_System_Design_Fundamentals.md#race-conditions) — Concurrent state corruption and atomic database update patterns.
- [Exponential Backoff with Full Jitter](Backend_System_Design_Fundamentals.md#retry-with-exponential-backoff--jitter) — Mitigating thundering herds with mathematically de-synchronized retries.
- [Circuit Breaker State Machine](Backend_System_Design_Fundamentals.md#circuit-breaker) — Closed $\to$ Open $\to$ Half-Open transitions preventing cascading failure.
- [The Three Pillars of Observability](Backend_System_Design_Fundamentals.md#observability-the-three-pillars) — Metrics (what broke), Traces (where it broke), and Structured Logs (why it broke).

---

### HTTP Headers & Status Codes Quick Lookup

- [The 12 Headers Worth Knowing](Headers.md#the-12-headers-worth-knowing-fast-recall) — Fast recall matrix for `Authorization`, `Content-Type`, `Accept`, `Cache-Control`, `ETag`, `If-None-Match`, `Location`, `Retry-After`, `Idempotency-Key`, `traceparent`, `Set-Cookie`, `Content-Encoding`.
- [The Fab 5 Security/Caching Headers](Headers.md#critical-complementary-headers-the-5-you-must-also-know) — `Vary`, `Strict-Transport-Security` (HSTS), `Content-Security-Policy` (CSP), `Origin`/CORS, and `Upgrade` (WebSockets).
- [Idempotency-Key Deep Dive](Headers.md#1-idempotency-key-safe-mutation-retries) — Safe retries for mutating operations (Stripe/IETF standard).
- [W3C `traceparent` Anatomy](Headers.md#2-traceparent-w3c-distributed-tracing) — `version-traceId-parentId-traceFlags` for OpenTelemetry cross-service tracing.
- [Status Code Decision Logic](Headers.md#status-code-decision-logic) — When to return `201 Created` vs `204 No Content`, `401 Unauthorized` vs `403 Forbidden`, `400 Bad Request` vs `422 Unprocessable Entity`, `502 Bad Gateway` vs `504 Gateway Timeout`.

---

### Package Managers, Monorepos & Tooling

- [pnpm vs yarn vs npm Architecture](package-managers.md#10-master-comparison-matrix-including-bun) — Content-Addressable Storage (CAS), hard links, symlinks, and phantom dependency elimination.
- [Phantom Dependencies Explored](package-managers.md#the-phantom-dependency-trap-hoisting-bug) — Why flat `node_modules` causes invisible runtime crashes in production.
- [Monorepo Workspaces & `workspace:*`](package-managers.md#pnpm-workspaces-pnpm-workspaceyaml) — Linking internal packages without local symlink rot.
- [Turborepo vs Nx Build Orchestrators](package-managers.md#turborepo-vs-nx-comparison) — Computation Caching, Distributed Task Execution (DTE), Project Graph analysis, and Remote Cache pipelines.

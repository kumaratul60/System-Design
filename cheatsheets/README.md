# System Design & Frontend Master Reference

> A modular reference guide for System Design (Databases, Flows), React, React Router, state management, Redux Toolkit, Redux-Saga, TypeScript, performance, architecture, and interview-level trade-offs.

---

## 📚 Categorized Cheat Sheets

For in-depth references, code blocks, and architectural choices, visit the categorized sheets:

- 🗄️ **[Database Decisions & Architectures](dbdecision.md)**: A structured framework for choosing databases, selection matrix, case studies, and interview design flows.
- 🌳 **[Document Object Model (DOM)](DOM.md)**: Live vs Static collections, Shadow DOM, Event delegation, element metrics, and optimization paths.
- 🎨 **[CSS Object Model (CSSOM)](cssom.md)**: Critical Rendering Path, inline vs computed styles, CSS variables, performance optimizations, and Font metrics (Ascenders / Descenders).
- 🌐🔗 **[How the Web Works: High-Level](web.md)**: Visual 17-step web touchpoints flow, browser pre-checks, and Critical Rendering Path (CRP) maps.
- ⚙️ **[WebAssembly (WASM) & Web SDK](webassembly-web-sdk.md)**: WASM compilation, Memory Grow trapping, Workers integration, multithreading isolation, public SDK design, loading snippet queues, and storage partitioning.
- ⚛️ **[React Core & Component State Patterns](react.md)**: React Hooks, rendering lifecycle, and the loading/success/error/empty 4-state component pattern.
- 🔀 **[React Router](react-router.md)**: Navigation, search params, loaders/actions, and safe usage of `useMatch`.
- 💾 **[State Management](state-management.md)**: Redux Toolkit (RTK), RTK Query, Listener middleware, and Redux-Saga generators.
- 📘 **[TypeScript & Typings](typescript.md)**: Types vs Interfaces, enum alternatives, utility types, and React prop/event integration.
- 🏗️ **[Architecture & Performance](architecture.md)**: State ownership, concurrency patterns, virtualization, traps, and staff-level design questions.
- 🌐 **[Browser Object Model (BOM)](BOM.md)**: Window execution, location controls, screen boundaries, and cross-tab communication.
- 🧹 **[Clean Code Guidelines](cleancode.md)**: SOLID principles, code smells, UI separation of concerns, and clean async state management.
- 📐 **[CSS Units & Layouts](cssUnits.md)**: Responsive typography (`rem`, `em`), exact hairlines (`px`), viewports (`vw`, `vh`, `dvh`), and Container Queries (`cqw`, `cqh`).
- 📈 **[Evolution of CSS](evolutionCSS.md)**: Styling evolution timeline from inline tables to Preprocessors, CSS-in-JS, Tailwind, and Modern specifications.
- ♿ **[Web Accessibility (a11y) & WCAG Architectural Guide](WCAG_Accessibility.md)**: WCAG 2.1/2.2 compliance, POUR principles, ARIA rules, accessible design patterns, focus management, SPA route announcer, and Staff/Architect interview grill.
- 🛡️ **[Security Architecture Interview Grill](Security_Architect.md)**: SDE-1 to Staff/Architect security concepts, OAuth2/OIDC, CSRF/XSS, CSP, IDOR, Zero Trust, and secure system design.
- ⚡ **[Performance Optimization](Performance_Optimization.md)**: Core Web Vitals, browser rendering performance, bundle splitting, memory leak debugging, and network optimization.
- 🔍 **[Regular Expressions (RegEx)](regex.md)**: Match patterns, character classes, quantifiers, lookarounds, logic flow engine, and performance tips.

---

## 🎯 Quick Lookup: API Index by Job

Use this high-level list to find the correct primitive for your specific problem. For detailed usage, click the links above.

### Remember and share data

- [`useState`](react.md#usestate) — Remember a value owned by one component.
- [`useReducer`](react.md#usereducer) — Centralize several related state updates.
- [`useLinkedState`](react.md#uselinkedstate-custom-hook-pattern) _(Custom)_ — Keep local editable state in sync with a changing external value.
- [`createContext`](react.md#createcontext) — Create information a subtree can provide.
- [`use` / `useContext`](react.md#usecontext) — Read context; `use` also reads Promises.
- [`useSyncExternalStore`](react.md#usesyncexternalstore) — Subscribe to a store managed outside React.

### Connect to the browser

- [`useRef`](react.md#useref) — Keep a DOM node or mutable value without rendering.
- [`useEffect`](react.md#useeffect) — Synchronize with an external system after paint.
- [`useLayoutEffect`](react.md#uselayouteffect) — Measure or adjust layout before paint.
- [`useInsertionEffect`](react.md#useinsertioneffect) — Insert styles before layout effects; mainly for libraries.
- [`useEffectEvent`](react.md#useeffectevent) — Call the latest logic from an effect without reacting to it.
- [`useId`](react.md#useid) — Create an accessible ID stable across server and client.
- [`useImperativeHandle`](react.md#useimperativehandle) — Customize the value exposed through a ref.

### Load and reveal UI

- [Hydrate / `hydrateRoot`](react.md#hydration--hydrateroot) — Keep server HTML dormant and load its behavior on demand.
- [`Suspense`](react.md#suspense) — Show a fallback while descendants wait.
- [`ErrorBoundary`](react.md#error-boundary) — Replace a failed subtree with an error fallback.
- [`lazy`](react.md#lazy) — Load a component's code on demand.
- [`startTransition`](react.md#starttransition--usetransition) — Mark an update as non-urgent.
- [`useTransition`](react.md#starttransition--usetransition) — Start a transition and read its pending state.
- [`useDeferredValue`](react.md#usedeferredvalue) — Let a slow child temporarily use an older value.
- [`Activity`](react.md#activity) — Hide or prerender a subtree while suppressing its effects.

### Handle actions and forms

- [`useActionState`](react.md#useactionstate) — Track an action's result and pending state.
- [`useFormStatus`](react.md#useformstatus) — Read the nearest parent form's active action.
- [`useOptimistic`](react.md#useoptimistic) — Show an expected result before an action finishes.
- [`requestFormReset`](react.md#requestformreset) — Request an uncontrolled-form reset from an action or transition.

### Compose and optimize

- [`Fragment`](react.md#fragment) — Group siblings without an extra DOM element.
- [`memo`](react.md#memo) — Skip a component render when its props are unchanged.
- [`useMemo`](react.md#usememo) — Reuse an expensive calculated value.
- [`useCallback`](react.md#usecallback) — Reuse a function identity when a consumer needs it.
- [`createPortal`](react.md#createportal) — Render into another DOM container.
- [View Transition APIs](react.md#view-transitions) — Coordinate browser View Transitions.

### Roots, resources, and library tools

- [`createRoot` / `hydrateRoot`](react.md#createroot) — Start a client tree or adopt server HTML.
- [Resource Hints](react.md#resource-hints) (`preload`, `preinit`, `preconnect`, `prefetchDNS`) — Tell the browser about resources early.
- [`createElement` / `cloneElement`](react.md#library-apis) — Create or adapt element descriptors.
- [`isValidElement` / `Children`](react.md#library-apis) — Inspect component children in library code.
- [`flushSync` / `act`](react.md#library-apis) — Integrate synchronous DOM work or test updates.
- [`useDebugValue`](react.md#library-apis) — Compatibility hook; development tool labeling.
- [`setSsrSuspenseTimeout`](react.md#library-apis) — Configure the server's global deadline for unresolved async data.
- [`version`](react.md#library-apis) — Read the installed React version.

---

### Databases, Systems & Sharding

- [CAP Theorem](dbdecision.md#4-database-scaling-the-bottleneck) — Consistency, Availability, Partition tolerance tradeoffs.
- [Database Selection Matrix](dbdecision.md#database-selector-matrix) — Choose between Relational, Key-Value, Document, Wide-Column, Graph, and Time-Series.
- [Multi-Database Case Studies](dbdecision.md#3-multi-database-production-case-studies) — Real-world database layouts of Uber, Instagram, WhatsApp, and YouTube.
- [Functional vs Non-Functional Requirements](dbdecision.md#1-requirements-engineering-functional-vs-non-functional-requirements) — Distinguish FRs vs NFRs with e-commerce mental models.

---

### Browser DOM & BOM APIs

- [`event.target` vs `event.currentTarget`](BOM.md#63-event-propagation--delegation) — Distinguish triggered elements from listener nodes.
- [Event Delegation](BOM.md#event-delegation-pattern) — Handle clicks on wrapper nodes to improve performance.
- [`window.postMessage`](BOM.md#11-cross-origin-window-messaging-postmessage) — Secure cross-origin communication with origin validation.
- [`history.pushState`](BOM.md#21-state-pushes-and-browser-back-navigation) — Navigate SPA routes programmatically without document reloads.
- [Scroll Coordinates & Infinite Scroll](BOM.md#64-scroll--viewport-formulas) — Screen measurements using `scrollY`, `innerHeight`, and `scrollHeight`.
- [Shadow DOM Style Scoping](DOM.md#shadow-dom) — Create styling boundaries isolated from parent stylesheets.
- [High-Level Web Rendering Flowchart](web.md#1-web-touchpoints-flow) — 17-step chronological connection and layout flow from URL to pixels.

---

### CSSOM & Layout Configurations

- [Computed vs Inline Styles](cssom.md#2-inline-vs-computed-styles) — Prevent performance regressions caused by forcing layouts recalculation.
- [Font Ascent & Descent Metrics](cssom.md#font-metrics-ascenders-vs-descenders) — Control baseline layouts using `ascent-override`, `descent-override`, and `line-gap-override`.
- [Cumulative Layout Shift (CLS)](cssom.md#3-preventing-layout-shifts-cls-optimization) — Secure web vitals using aspect ratios and dynamic image reservations.
- [Cascade Layers (`@layer`)](evolutionCSS.md#era-6-modern-native-css-spec-advancements) — Control cascade overrides without raising class specificity.

---

### WebAssembly & Offloading

- [Memory Grow Trapping](webassembly-web-sdk.md#1-wasm-linear-memory-grow-traps) — Handle JS view detachment after `memory.grow()` calls.
- [Cross-Origin Isolation Headers](webassembly-web-sdk.md#2-multithreading-security-sharedarraybuffer--coopcoep) — Secure `SharedArrayBuffer` using COOP/COEP headers.
- [Asynchronous Queue Loader](webassembly-web-sdk.md#4-client-side-asynchronous-snippet-queue-loader) — Buffer commands inside arrays before scripts finish loading.
- [Storage Partitioning](webassembly-web-sdk.md#5-storage-partitioning-browser-privacy-sandboxing) — Handle partitioned `localStorage` inside third-party iframe boundaries.

---

### Web Accessibility (a11y) & WCAG Architectural Patterns

- [5 Golden Rules of ARIA](WCAG_Accessibility.md#-the-5-golden-rules-of-aria) — Native HTML vs ARIA polyfills and when not to use ARIA.
- [`tabIndex` Master Guide (`0`, `-1`, `<0`, `>0`)](WCAG_Accessibility.md#3-the-tabindex-master-guide-0--1-0-0) — Browser navigation behavior, programmatic focus, and why positive values are an anti-pattern.
- [`inert` vs `aria-hidden` vs `display:none` vs `.sr-only`](WCAG_Accessibility.md#2-hiding-elements-inert-vs-aria-hidden-vs-displaynone-vs-sr-only) — Trade-offs and accessibility tree visibility.
- [Roving `tabIndex` vs `aria-activedescendant`](WCAG_Accessibility.md#4-focus-management-roving-tabindex-vs-aria-activedescendant) — Focus management strategies for composite widgets.
- [Modal Focus Trapping & Restoration](WCAG_Accessibility.md#pattern-1-modal-dialogs--focus-trapping-native-dialog-vs-custom-portal) — Native `<dialog>` top layer vs portal focus traps.
- [SPA Route Announcer](WCAG_Accessibility.md#pattern-3-single-page-application-spa-route-transitions--focus-reset) — Dynamic client-side routing focus reset and screen reader announcements.
- [A11y CI/CD Pipeline & Automated Governance](WCAG_Accessibility.md#-accessibility-testing--governance-pipeline) — Shift-left testing with `axe-core`, Playwright, and ESLint.

# Frontend Architecture, Leadership & Production Engineering Reference

> **Purpose:** Deep-dive answers, operational frameworks, and production patterns across Leadership, Performance, Scalability, Micro Frontends, and CI/CD.

---

## 📑 Table of Contents

- [Frontend Architecture, Leadership & Production Engineering Reference](#frontend-architecture-leadership--production-engineering-reference)
  - [📑 Table of Contents](#-table-of-contents)
  - [👔 Section 1: Leadership, Governance & Engineering Operations](#-section-1-leadership-governance--engineering-operations)
    - [Q1: A critical production release introduces a frontend performance regression — what would you do?](#q1-a-critical-production-release-introduces-a-frontend-performance-regression--what-would-you-do)
      - [🎯 Architectural Response Framework:](#-architectural-response-framework)
    - [Q2: Two teams want different architectural approaches — how would you evaluate and resolve the trade-off?](#q2-two-teams-want-different-architectural-approaches--how-would-you-evaluate-and-resolve-the-trade-off)
      - [🎯 Evaluation Framework:](#-evaluation-framework)
      - [Resolution Steps:](#resolution-steps)
    - [Q3: How would you migrate a large legacy React application without stopping feature development?](#q3-how-would-you-migrate-a-large-legacy-react-application-without-stopping-feature-development)
      - [🎯 The Strangler Fig Architecture Pattern:](#-the-strangler-fig-architecture-pattern)
    - [Q4: How would you scale frontend development when 5–10 teams are working on the same product?](#q4-how-would-you-scale-frontend-development-when-510-teams-are-working-on-the-same-product)
      - [🎯 Architectural Scaling Pillars:](#-architectural-scaling-pillars)
    - [Q5: How do you establish standards through code reviews, testing, CI/CD and engineering guidelines?](#q5-how-do-you-establish-standards-through-code-reviews-testing-cicd-and-engineering-guidelines)
      - [🎯 The "Zero Human Memory" Governance Framework:](#-the-zero-human-memory-governance-framework)
  - [⚡ Section 2: Performance \& Optimization](#-section-2-performance--optimization)
    - [Q6: A page becomes slow after adding multiple API-driven components — how would you identify the bottleneck?](#q6-a-page-becomes-slow-after-adding-multiple-api-driven-components--how-would-you-identify-the-bottleneck)
    - [Q7: When would you use React.memo, useMemo and useCallback — and when can they actually hurt performance?](#q7-when-would-you-use-reactmemo-usememo-and-usecallback--and-when-can-they-actually-hurt-performance)
    - [Q8: Code splitting, lazy loading, bundle analysis and tree shaking](#q8-code-splitting-lazy-loading-bundle-analysis-and-tree-shaking)
    - [Q9: Core Web Vitals and optimizing initial load time](#q9-core-web-vitals-and-optimizing-initial-load-time)
    - [Q10: Virtualization for large datasets](#q10-virtualization-for-large-datasets)
    - [Q11: Caching and avoiding duplicate API requests](#q11-caching-and-avoiding-duplicate-api-requests)
    - [Q12: Handling complex state without creating tightly coupled components](#q12-handling-complex-state-without-creating-tightly-coupled-components)
      - [🎯 Decoupled State Architecture:](#-decoupled-state-architecture)
  - [🏗️ Section 3: Scalability \& Frontend Architecture](#️-section-3-scalability--frontend-architecture)
    - [Q13: How would you architect a frontend application expected to grow across multiple teams?](#q13-how-would-you-architect-a-frontend-application-expected-to-grow-across-multiple-teams)
      - [🎯 Modular Feature Architecture (Domain-Driven Design):](#-modular-feature-architecture-domain-driven-design)
    - [Q14: Designing scalable component libraries and design systems](#q14-designing-scalable-component-libraries-and-design-systems)
      - [🎯 3-Tier Design System Architecture:](#-3-tier-design-system-architecture)
    - [Q15: Managing shared state across large applications](#q15-managing-shared-state-across-large-applications)
      - [🎯 State Categorization Matrix:](#-state-categorization-matrix)
    - [Q16: API abstraction and separation of business logic from UI](#q16-api-abstraction-and-separation-of-business-logic-from-ui)
      - [🎯 Clean Architecture \& The Repository Pattern:](#-clean-architecture--the-repository-pattern)
    - [Q17: Handling backward compatibility while evolving frontend architecture](#q17-handling-backward-compatibility-while-evolving-frontend-architecture)
      - [🎯 Non-Breaking Evolutionary Patterns:](#-non-breaking-evolutionary-patterns)
  - [🧩 Section 4: Micro Frontends (MFE)](#-section-4-micro-frontends-mfe)
    - [Q18: When would you choose Micro Frontends over a modular monolith?](#q18-when-would-you-choose-micro-frontends-over-a-modular-monolith)
      - [🎯 The MFE Decision Rule:](#-the-mfe-decision-rule)
    - [Q19: Module Federation and runtime integration](#q19-module-federation-and-runtime-integration)
      - [🎯 Webpack 5 / Rsbuild Module Federation Core Architecture:](#-webpack-5--rsbuild-module-federation-core-architecture)
    - [Q20: Sharing dependencies without creating version conflicts](#q20-sharing-dependencies-without-creating-version-conflicts)
      - [🎯 Singleton Configuration \& Strict Semver Enforcement:](#-singleton-configuration--strict-semver-enforcement)
    - [Q21: Communication between independently deployed micro frontends](#q21-communication-between-independently-deployed-micro-frontends)
      - [🎯 The "Share-Nothing" Event-Driven Architecture:](#-the-share-nothing-event-driven-architecture)
    - [Q22: Handling authentication, routing and shared design systems in MFE](#q22-handling-authentication-routing-and-shared-design-systems-in-mfe)
  - [🚀 Section 5: CI/CD \& Production Engineering](#-section-5-cicd--production-engineering)
    - [Q23: Designing an enterprise frontend CI/CD pipeline](#q23-designing-an-enterprise-frontend-cicd-pipeline)
    - [Q24: Automated testing, linting and quality gates](#q24-automated-testing-linting-and-quality-gates)
      - [🎯 The Testing Trophy Strategy:](#-the-testing-trophy-strategy)
    - [Q25: Build -\> Test -\> Deploy -\> Rollback strategy](#q25-build---test---deploy---rollback-strategy)
    - [Q26: Environment configuration and feature flags](#q26-environment-configuration-and-feature-flags)
    - [Q27: Canary and Blue-Green deployment strategies](#q27-canary-and-blue-green-deployment-strategies)
    - [Q28: Monitoring production errors and frontend performance (RUM \& APM)](#q28-monitoring-production-errors-and-frontend-performance-rum--apm)

---

## 👔 Section 1: Leadership, Governance & Engineering Operations

### Q1: A critical production release introduces a frontend performance regression — what would you do?

#### 🎯 Architectural Response Framework:

In an active production incident, **mitigation takes precedence over investigation**.

```
[Incident Trigger]
       │
       ├── Phase 1: Triage & Blast Radius Evaluation (RUM, APM, Sentry)
       ├── Phase 2: Instant Mitigation (Rollback vs Feature Flag Kill-Switch)
       ├── Phase 3: Root Cause Analysis (Git Bisect, Performance Profile)
       └── Phase 4: Post-Mortem & Prevention (Synthetic CI Performance Budgets)
```

1. **Phase 1: Assess Blast Radius & Business Impact (First 5 mins)**
   - Query Real User Monitoring (RUM) dashboards (Datadog, Cloudflare Web Analytics, SpeedCurve).
   - Determine: Is the regression global or isolated to a specific browser engine (e.g., Safari iOS 16), geography, or user cohort?
   - Identify degraded metrics: Is it LCP (+2s), INP (+400ms), or client-side runtime crash rate?

2. **Phase 2: Immediate Mitigation (Rule: Never debug forward in production)**
   - **Scenario A (Feature Flagged):** Toggle off the offending feature flag in LaunchDarkly / Unleash. Propagation takes $<30$ seconds with zero deployment risk.
   - **Scenario B (Direct Code Release):** Execute an immediate pipeline rollback to the previous immutable Docker image or CDN static commit hash.
   - Post an internal incident status message: announce mitigation, affected user percentage, and SLA status.

3. **Phase 3: Root Cause Analysis (RCA in Staging)**
   - Run `git bisect` between the healthy tag and the faulty release tag paired with automated Lighthouse CI runs.
   - Profile via Chrome DevTools Performance Trace:
     - _Common Culprit 1:_ An un-memoized global context provider re-rendering root trees.
     - _Common Culprit 2:_ A newly introduced 800KB uncompressed charting library breaking bundle budgets.
     - _Common Culprit 3:_ Missing CDN caching headers causing TTFB spikes on Edge assets.

4. **Phase 4: Post-Mortem & Continuous Prevention**
   - Publish a blameless post-mortem document covering: Root Cause, Time to Detect (TTD), Time to Mitigate (TTM), and Action Items.
   - Enforce automated **Lighthouse CI / Bundlesize Quality Gates** in GitHub Actions that fail PR merges if JS bundle size increases by $>5\%$ or INP exceeds 200ms.

---

### Q2: Two teams want different architectural approaches — how would you evaluate and resolve the trade-off?

#### 🎯 Evaluation Framework:

When two teams disagree (e.g., Team A wants GraphQL + Relay; Team B wants REST + TanStack Query), a Staff Engineer depersonalizes the decision through an objective **Architectural Decision Record (ADR)** and weighted matrix.

```
Step 1: Frame Decision Criteria (Business, DX, Performance, Maintenance)
Step 2: Prototype Time-Boxed Spike (1-week proof of concept)
Step 3: Score via Weighted Decision Matrix
Step 4: Align or "Disagree and Commit" with clear rollback triggers
```

| Evaluation Dimension                | Weight | Approach A (e.g., GraphQL Federation)          | Approach B (e.g., REST + TanStack Query)       |
| :---------------------------------- | :----: | :--------------------------------------------- | :--------------------------------------------- |
| **Performance (CWV / Over-fetch)**  |  25%   | High: Eliminates over-fetching; single query   | Medium: Multiple round-trips without BFF       |
| **Operational & Server Complexity** |  25%   | Low: Requires GraphQL Gateway, Schema Registry | High: Simple CDN cacheable HTTP endpoints      |
| **Team Learning Curve & Velocity**  |  25%   | Low: Strict schema typing, heavy tooling       | High: Familiar standard Fetch/REST conventions |
| **Long-term Maintenance & Vendor**  |  25%   | Medium: Schema drift risks across teams        | High: Decoupled independent service contracts  |

#### Resolution Steps:

1. **Define Non-Negotiable Constraints:** What are the hard limits? (e.g., team bandwidth, target TTFB $\le 500\text{ms}$, tight delivery deadline).
2. **Time-Boxed Spike (PoC):** Have 1 engineer from each team build the identical user flow within 3 business days and record bundle size, network waterfalls, and developer satisfaction.
3. **Write the ADR:** Document the problem context, considered alternatives, rationale for the winning choice, and explicit review conditions (e.g., _"We revisit this choice if client queries exceed 50 distinct endpoints"_).
4. **Enforce Commitment:** Ensure leadership signs off and both teams agree to the standardized path.

---

### Q3: How would you migrate a large legacy React application without stopping feature development?

#### 🎯 The Strangler Fig Architecture Pattern:

Never propose a "Grand Rewrite". Complete rewrites take 2–3x longer than anticipated and freeze business delivery. Instead, migrate incrementally using the **Strangler Fig Pattern**.

```
                   [Reverse Proxy / Edge Router (Cloudflare / NGINX)]
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼ (Path: /legacy/*)                           ▼ (Path: /app/v2/*)
       [Legacy React 16 App]                         [Modern React 19 / Next.js]
                 │                                             │
                 └─────────────── Shared State ────────────────┘
                            (BroadcastChannel / LocalStorage)
```

1. **Phase 1: Edge Routing & Domain Boundaries**
   - Place an Edge Proxy (Cloudflare Worker, AWS CloudFront, or NGINX) in front of the application.
   - Route legacy paths (`/settings`, `/reports`) to the existing legacy bundle.
   - Route newly rewritten paths (`/dashboard`, `/checkout`) to the new modern stack.
2. **Phase 2: Micro-Module Embedding (Inside-Out)**
   - If migrating within a single screen, use Webpack Module Federation or custom Web Component wrappers. The modern component compiles independently and renders inside the legacy React 16 DOM tree.
3. **Phase 3: Cross-Stack State & Auth Bridge**
   - Store auth sessions in `httpOnly` secure cookies so both legacy and modern apps authenticate seamlessly without token re-prompting.
   - Share cross-application event communications via `window.postMessage` or a typed `BroadcastChannel`.
4. **Phase 4: Deprecation & Sunset**
   - Track legacy traffic via analytics. When legacy route traffic drops to zero, decommission the legacy build pipelines and servers.

---

### Q4: How would you scale frontend development when 5–10 teams are working on the same product?

#### 🎯 Architectural Scaling Pillars:

When an organization scales past 50 frontend engineers, communication overhead becomes the primary bottleneck (Conway's Law).

1. **Repository Topology: Enterprise Monorepo (Turborepo / Nx)**
   - Houses apps and packages in one repository with **Distributed Computation Caching**. If Team A touches `apps/checkout`, Team B's `apps/account` tests are skipped on CI via hash checking.
2. **Domain Ownership via CODEOWNERS:**
   - Enforce strict path-based ownership. Changes to `packages/design-system` require mandatory sign-off from the Core UI team, while `apps/billing` requires billing leads.
3. **Strict Package Boundaries & Dependency Rules:**
   - Use ESLint rules (`eslint-plugin-boundaries` or Nx Module Boundaries) preventing feature modules from importing each other directly (`packages/auth` cannot import from `apps/marketing`).
4. **Guild & RFC Model:**
   - Establish a **Frontend Architecture Guild** meeting bi-weekly. Major structural changes require an RFC (Request for Comments) with a 7-day review window before implementation.

---

### Q5: How do you establish standards through code reviews, testing, CI/CD and engineering guidelines?

#### 🎯 The "Zero Human Memory" Governance Framework:

Standards that rely on human memory or code review vigilance fail at scale. **Automate everything that can be automated.**

```
Developer Saves Code ──> Pre-commit Hook (Husky + lint-staged)
                               │
PR Opened ────────────> GitHub Actions CI Quality Gate
                               │
                       ├── 1. ESLint / TypeScript Strict / Biome
                       ├── 2. Unit & Integration Tests (>80% Coverage)
                       ├── 3. BundleSize Budget Check (+/- 2% threshold)
                       ├── 4. Visual Regression (Chromatic / Playwright)
                       └── 5. PR Title Conventional Commits (Semantic Release)
                               │
Code Review Focus ─────> Architecture, Business Edge Cases, Security ONLY
```

- **Code Review SLA:** Establish a 24-hour review SLA; PRs must be smaller than 400 lines of diff.
- **Linters as Architecture Law:** Configure ESLint to forbid banned patterns (e.g., forbidding direct `localStorage` access without a wrapper, forbidding relative imports across feature modules).
- **Living Documentation:** Host an interactive Storybook and Architecture Handbook updated automatically on every main-branch merge.

---

## ⚡ Section 2: Performance & Optimization

### Q6: A page becomes slow after adding multiple API-driven components — how would you identify the bottleneck?

_(See full step-by-step diagnostic triage tree, network connection quotas, and flame-chart analysis in [`cheatsheets/Performance_Optimization.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/cheatsheets/Performance_Optimization.md#9-diagnosing-page-slowness-after-adding-multiple-api-driven-components))._

---

### Q7: When would you use React.memo, useMemo and useCallback — and when can they actually hurt performance?

_(See in-depth breakdown of shallow comparison overhead, closure leakage, and broken referential identity in [`cheatsheets/Performance_Optimization.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/cheatsheets/Performance_Optimization.md#1-memoization-reactmemo-usememo-and-usecallback))._

---

### Q8: Code splitting, lazy loading, bundle analysis and tree shaking

_(See interaction prefetching, waterfall prevention, barrel file traps, and `sideEffects: false` evaluation in [`cheatsheets/Performance_Optimization.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/cheatsheets/Performance_Optimization.md#5-code-splitting-lazy-loading--waterfall-prevention))._

---

### Q9: Core Web Vitals and optimizing initial load time

_(See LCP, INP, CLS, TTFB metrics, `scheduler.yield()`, and resource hints in [`Prep/03-Frontend-SD/02-Performance-CWV.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/Prep/03-Frontend-SD/02-Performance-CWV.md))._

---

### Q10: Virtualization for large datasets

_(See dynamic height calculations, ResizeObserver, momentum scroll blank frames, and accessibility in [`cheatsheets/Performance_Optimization.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/cheatsheets/Performance_Optimization.md#4-virtualization-for-large-datasets))._

---

### Q11: Caching and avoiding duplicate API requests

_(See single-flight in-flight promise caching, SWR staleTime/gcTime, and AbortController request cancellation in [`cheatsheets/Performance_Optimization.md`](file:///Users/atulkumarawasthi/projects/SystemDesign/cheatsheets/Performance_Optimization.md#10-caching--avoiding-duplicate-api-requests))._

---

### Q12: Handling complex state without creating tightly coupled components

#### 🎯 Decoupled State Architecture:

When multiple distant UI components need to react to shared state, naive prop drilling or monolithic Context objects create brittle coupling and render cascades.

```
       [State Domain Engine (Zustand / Finite State Machine)]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 [FilterPanel]            [ResultsGrid]            [ExportButton]
(Subscribes to filters)  (Subscribes to items)   (Subscribes to count)
```

1. **Atomic State & Granular Selectors:**
   - Use an atomic store (Zustand / Jotai). Components subscribe **strictly** to the slice of state they consume:
     ```typescript
     // FilterPanel re-renders ONLY when filter criteria change:
     const filters = useSearchStore((state) => state.filters);
     // ExportButton re-renders ONLY when totalCount changes:
     const totalCount = useSearchStore((state) => state.totalCount);
     ```
2. **Inversion of Control via Compound Components:**
   - Separate state orchestration from UI presentation using React Compound Components:
     ```tsx
     <Table data={orders}>
       <Table.FilterRow />
       <Table.Body renderRow={(order) => <OrderRow key={order.id} order={order} />} />
       <Table.Pagination />
     </Table>
     ```
3. **Finite State Machines (XState) for Complex Multi-Step Workflows:**
   - For checkout flows or multi-stage wizards, model states explicitly (`idle`, `validating`, `submitting`, `error`). Prevents impossible UI states (e.g., showing both a success banner and a submit button enabled simultaneously).

---

## 🏗️ Section 3: Scalability & Frontend Architecture

### Q13: How would you architect a frontend application expected to grow across multiple teams?

#### 🎯 Modular Feature Architecture (Domain-Driven Design):

Organize codebases by **Domain / Feature**, never by technical role (`/components`, `/hooks`, `/services`):

```
src/
├── app/                  # Route shells, providers, global layout
├── domains/              # Business capabilities (Owned by Squads)
│   ├── checkout/         # Squad A
│   │   ├── api/          # DTOs, Fetch queries
│   │   ├── components/   # Checkout-specific UI
│   │   ├── hooks/        # Checkout business logic
│   │   └── index.ts      # Public API barrel (Strictly encapsulated)
│   └── billing/          # Squad B
└── shared/               # Cross-cutting agnostic infrastructure
    ├── ui/               # Core design system primitives (Button, Modal)
    ├── http/             # Base Axios / Fetch client with auth interceptors
    └── utils/            # Pure helper utilities
```

- **Enforce Encapsulation:** Domain internals are private. Squad B cannot import `domains/checkout/components/InternalCard.tsx`; they may only import through the published contract `domains/checkout/index.ts`.

---

### Q14: Designing scalable component libraries and design systems

#### 🎯 3-Tier Design System Architecture:

```
Tier 1: Design Tokens (JSON / CSS Variables)
        - Colors, Spacing, Typography, Radii (e.g., --color-primary-500)
        │
Tier 2: Headless Primitives (Zero CSS / Pure Logic & A11y)
        - Radix UI, React Aria (Handles Keyboard focus, ARIA tags, Screen readers)
        │
Tier 3: Styled Themed Components (Corporate Design Language)
        - Button, Modal, Dropdown styled via Tailwind or Zero-runtime CSS
```

- **Zero-Runtime CSS:** Use Tailwind CSS, Vanilla Extract, or StyleX to ensure style computation is extracted at build time, yielding 0ms runtime JS styling cost.
- **Strict Semantic Versioning & Deprecation Warnings:**
  - Deprecate props gracefully using runtime console warnings in non-production builds before breaking changes in the next major version:
    ```typescript
    if (process.env.NODE_ENV !== 'production' && props.legacyVariant) {
      console.warn('[DesignSystem] legacyVariant is deprecated. Migrate to variant="secondary" by v4.0.');
    }
    ```

---

### Q15: Managing shared state across large applications

#### 🎯 State Categorization Matrix:

| State Category       | Definition                                             | Recommended Tool                  | Invalidation / Lifetime                              |
| :------------------- | :----------------------------------------------------- | :-------------------------------- | :--------------------------------------------------- |
| **Server State**     | Asynchronous data owned by the backend (Users, Orders) | TanStack Query / SWR / RTK Query  | Cache TTL, `staleTime`, manual mutation invalidation |
| **Client UI State**  | Local interactions (Modals, Active Tabs, Drawer open)  | `useState`, `useReducer`, Zustand | Component lifecycle unmount                          |
| **URL State**        | Filter criteria, Page index, Search queries            | URL Search Params (`nuqs`)        | Deep-linkable, browser back/forward history          |
| **Global Ephemeral** | Auth tokens, Toast notifications, Real-time status     | Lightweight Zustand store         | Session lifetime                                     |

> **Staff Principle:** Never duplicate Server State into Client Global State (e.g., copying `query.data` into a Redux store). Treat server data as an in-memory cache managed by query libraries.

---

### Q16: API abstraction and separation of business logic from UI

#### 🎯 Clean Architecture & The Repository Pattern:

Components should only be responsible for rendering and user interaction. They must never know whether data comes from REST, GraphQL, or IndexedDB.

```
UI Component (JSX)
       │
       ▼ (Invokes custom hook)
Application Hook (Business Rules / Orchestration)
       │
       ▼ (Calls abstract repository)
API Client Repository (DTO Validation & Endpoint Mapping)
       │
       ▼ (Network Fetch)
Backend Microservice
```

```typescript
// 1. Domain DTO & Schema Validation (Zod)
export const UserSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;

// 2. Abstract API Gateway / Repository
export class UserRepository {
  static async getProfile(userId: string): Promise<User> {
    const raw = await httpClient.get(`/api/v1/users/${userId}`);
    return UserSchema.parse(raw); // Guarantees runtime contract safety
  }
}

// 3. Decoupled Business Hook
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => UserRepository.getProfile(userId),
  });
}
```

---

### Q17: Handling backward compatibility while evolving frontend architecture

#### 🎯 Non-Breaking Evolutionary Patterns:

1. **The Expand-and-Contract Pattern:**
   - _Phase 1 (Expand):_ Add new architectural interface alongside the legacy interface without breaking changes.
   - _Phase 2 (Migrate):_ Update internal consumers incrementally to adopt the new interface.
   - _Phase 3 (Contract):_ Remove legacy interface in the next major semver milestone.
2. **Feature Flags as Dynamic Circuit Breakers:**
   - Wrap architecture-level changes (e.g., migrating from Redux to Zustand) behind remote feature flags. If telemetry indicates an anomaly, flip the flag to restore the legacy path instantly.
3. **Automated Codemods (jscodeshift):**
   - Provide automated transformation scripts that rewrite breaking syntax across 50 consumer repos in seconds rather than requiring manual developer toil.

---

## 🧩 Section 4: Micro Frontends (MFE)

### Q18: When would you choose Micro Frontends over a modular monolith?

#### 🎯 The MFE Decision Rule:

> **"Micro Frontends solve organizational scaling problems, NOT technical performance problems."**

- **Choose Micro Frontends ONLY when:**
  1. **Organizational Scale:** You have $>5$ autonomous engineering squads ($>40$ engineers) blocked by a monolithic release pipeline.
  2. **Deployment Decoupling:** Team Checkout ships 10 times a day, while Team Compliance ships once a month after regulatory audits.
  3. **Technology Heterogeneity:** Integrating distinct stacks (e.g., embedding a legacy Angular dashboard into a modern Next.js shell).
- **Choose a Modular Monolith when:**
  - You have $<4$ teams. The operational tax of MFEs (version drift, CSS collisions, duplicate bundle downloads, end-to-end testing complexity) will severely degrade engineering velocity.

---

### Q19: Module Federation and runtime integration

#### 🎯 Webpack 5 / Rsbuild Module Federation Core Architecture:

Module Federation allows a JavaScript application to dynamically load code from another independent build at runtime over HTTP:

```
[Host / Shell Application] (Port 3000)
       │
       ├── Loads Remote Entry: https://cdn.example.com/checkout/remoteEntry.js
       │
       └── Dynamically Mounts: import('checkoutApp/CheckoutWidget')
```

```javascript
// Host webpack.config.js
new ModuleFederationPlugin({
  name: 'hostApp',
  remotes: {
    checkoutApp: 'checkoutApp@https://cdn.example.com/checkout/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.2.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
  },
});
```

---

### Q20: Sharing dependencies without creating version conflicts

#### 🎯 Singleton Configuration & Strict Semver Enforcement:

- **`singleton: true`:** Guarantees that only ONE copy of a package is loaded across the entire page (mandatory for React, React DOM, and React Router).
- **`strictVersion: true`:** If the Remote requires React `^18.2.0` and Host provides `17.0.0`, the runtime immediately throws an error rather than allowing undefined behavior.
- **`eager: false`:** Ensures shared chunks are loaded asynchronously, giving the Module Federation runtime time to negotiate and pick the highest compatible semver version.

---

### Q21: Communication between independently deployed micro frontends

#### 🎯 The "Share-Nothing" Event-Driven Architecture:

Never share a global state store (e.g., shared Redux) between micro frontends. That re-introduces tight coupling.

```typescript
// 1. Strongly-Typed Custom Event Bus Contract
export interface MFEEventMap {
  CART_ITEM_ADDED: { itemId: string; quantity: number };
  USER_LOGGED_OUT: { timestamp: number };
}

export class MFEEventBus {
  static emit<K extends keyof MFEEventMap>(event: K, detail: MFEEventMap[K]) {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  }

  static on<K extends keyof MFEEventMap>(event: K, handler: (detail: MFEEventMap[K]) => void) {
    const listener = (e: Event) => handler((e as CustomEvent).detail);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }
}
```

---

### Q22: Handling authentication, routing and shared design systems in MFE

1. **Authentication:**
   - Owned exclusively by the **Host / Shell**. The shell validates the JWT session via `httpOnly` cookies and injects the active user context or bearer token into child MFEs via props or a minimal Shell context.
2. **Routing:**
   - The Host application owns the top-level URL routes (`/checkout/*`, `/dashboard/*`).
   - The child MFE uses memory routing or relative sub-routing (`/*`), emitting navigation events back to the Shell when internal transitions occur.
3. **Shared Design Systems:**
   - Export design system components as a federated remote or shared singleton library to eliminate duplicate CSS and markup divergence across MFE teams.

---

## 🚀 Section 5: CI/CD & Production Engineering

### Q23: Designing an enterprise frontend CI/CD pipeline

```
Developer Push ──> [PR Opened]
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
[Lint & Typecheck] [Unit Tests]    [Bundle Budget Check]
 (ESLint / TSC)     (Vitest)       (Fail if PR adds >2%)
      │                 │                 │
      └─────────────────┼─────────────────┘
                        │
                        ▼
            [Visual Regression / E2E] (Playwright on preview deployment)
                        │
                        ▼
            [Merge to Main] ──> Immutable Build (SHA-tagged Docker / S3)
                        │
                        ▼
            [Canary Deployment] (10% traffic -> Error rate check -> 100%)
```

---

### Q24: Automated testing, linting and quality gates

#### 🎯 The Testing Trophy Strategy:

- **70% Integration Tests (Vitest + React Testing Library):** Tests real user interactions across full component trees and mocked network calls (MSW - Mock Service Worker).
- **20% End-to-End Tests (Playwright):** Smoke test critical business paths (Sign up, Search, Checkout) against deployed preview staging environments.
- **10% Pure Unit Tests:** Algorithmic calculations, pricing utilities, data transformers.
- **Quality Gates:** Enforce 80% coverage threshold for modified files; PR blocked if any lint or TypeScript check fails.

---

### Q25: Build -> Test -> Deploy -> Rollback strategy

1. **Build Once, Deploy Many:**
   - Compile static assets **once** per Git SHA. Store compiled artifacts in an immutable bucket (S3 / Cloud Storage).
   - Inject environment variables at runtime via a `window.__CONFIG__` script or edge worker rather than recompiling per environment.
2. **Instant Rollback Blueprint:**
   - Never initiate a rollback by rebuilding a previous commit.
   - Point CDN Origin routing or Edge DNS back to the previous immutable Git SHA directory in S3. **Rollback execution completes in $<15\text{ seconds}$.**

---

### Q26: Environment configuration and feature flags

1. **Runtime Configuration Pattern:**
   - Avoid hardcoding `process.env.VITE_API_URL` during build.
   - Serve a tiny runtime config payload:
     ```html
     <script src="/config.js"></script>
     <!-- Sets window.APP_CONFIG = { API_URL: "https://api.prod.example.com" } -->
     ```
2. **Feature Flagging Infrastructure (LaunchDarkly / Statsig):**
   - **Kill-Switches:** Emergency shut-off for degraded features.
   - **Targeted Beta Cohorts:** Enable features for internal users (`@company.com`) before public rollout.
   - **Stale Flag Pruning:** Schedule bi-monthly flag cleanup sprints to delete merged flags and prevent technical debt.

---

### Q27: Canary and Blue-Green deployment strategies

```
                      [Global CDN / Cloudflare Load Balancer]
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼ (90% Traffic)                               ▼ (10% Canary Traffic)
           [Version 1.4.0 (Stable)]                      [Version 1.5.0 (Canary)]
                 │                                             │
                 └───────────── Real-Time Sentry Alerts ───────┘
                     (Crash rate > 0.05% -> Auto-rollback to 0%)
```

- **Edge Traffic Splitting:** The CDN evaluates a cookie or random hash to direct 10% of users to Canary assets.
- **Automated Health Probes:** Datadog / Sentry monitors the 4xx/5xx HTTP error rates and JS runtime crash rate. If error thresholds trip, traffic automatically reverts to Stable (0% Canary) without manual human intervention.

---

### Q28: Monitoring production errors and frontend performance (RUM & APM)

1. **Real User Monitoring (RUM) & Core Web Vitals:**
   - Capture real-world user metrics via `web-vitals` library and report to telemetry pipelines:

     ```typescript
     import { onCLS, onINP, onLCP } from 'web-vitals';

     function sendToAnalytics(metric: any) {
       navigator.sendBeacon('/analytics/vitals', JSON.stringify(metric));
     }

     onCLS(sendToAnalytics);
     onINP(sendToAnalytics);
     onLCP(sendToAnalytics);
     ```

2. **Error Tracking & Breadcrumbs (Sentry / Datadog):**
   - Capture error stack traces resolved with uploaded source maps.
   - Record user interaction breadcrumbs (clicks, recent network responses, navigation events) leading up to the uncaught exception.
   - Set up automated alerting when error spikes exceed 0.1% of active user sessions.

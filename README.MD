# System Design & Architecture Laboratory

A comprehensive repository for exploring, implementing, and documenting core System Design patterns, Networking protocols, and Communication strategies.

> **🌟 Key Feature:** This repository has been **"Grill-Hardened"** for Senior and Staff-level engineering roles. Each module contains a **"Senior/Staff Level Grill"** section covering architectural trade-offs, edge-case failures, and deep protocol nuances.

## Table of Contents

- [System Design \& Architecture Laboratory](#system-design--architecture-laboratory)
  - [Table of Contents](#table-of-contents)
  - [🎯 Principal Staff Architect Preparation](#-principal-staff-architect-preparation)
  - [Project Structure](#project-structure)
  - [🚀 Key Modules](#-key-modules)
    - [1. Infrastructure \& Observability](#1-infrastructure--observability)
    - [2. Logging \& Monitoring](#2-logging--monitoring)
    - [3. Database \& Caching](#3-database--caching)
    - [4. Communication Strategies](#4-communication-strategies)
    - [5. Networking Protocols](#5-networking-protocols)
    - [6. Security Engineering](#6-security-engineering)
    - [7. Performance Optimization](#7-performance-optimization)
    - [8. Interview \& Concept Deep Dives](#8-interview--concept-deep-dives)
    - [9. Web Fundamentals](#9-web-fundamentals)
    - [10. Low-Level Design (LLD) \& Object-Oriented Design](#10-low-level-design-lld--object-oriented-design)
    - [11. Web Accessibility (a11y) \& WCAG Architecture](#11-web-accessibility-a11y--wcag-architecture)
    - [12. ESLint \& Automated Quality Suite](#12-eslint--automated-quality-suite)
    - [13. Categorized Cheatsheets \& Master Reference](#13-categorized-cheatsheets--master-reference)
  - [🛠️ Quick Start \& Local Development](#️-quick-start--local-development)
    - [Development scripts:](#development-scripts)
  - [🤝 Contributing](#-contributing)
  - [🔗 Useful Resources](#-useful-resources)

---

## 🎯 Principal Staff Architect Preparation

🚀 **Looking to crack Staff / Principal Architect roles?** Access the dedicated, 80/20 frontend-focused preparation system here:
👉 **[Principal Staff Architect Preparation System](./Prep/README.md)**

- **8-Week Master Roadmap:** [ROADMAP.md](./Prep/ROADMAP.md)
- **Low-Level Design (LLD):** [01-LLD](./Prep/01-LLD/README.md) (OOP, SOLID, Design Patterns, UML, Machine Coding, Concurrency)
- **High-Level Design (HLD):** [02-HLD](./Prep/02-HLD/README.md) (Architecture Patterns, Distributed Systems, Classic Systems)
- **Frontend System Design (80% Focus):** [03-Frontend-SD](./Prep/03-Frontend-SD/README.md) (Rendering, Web Vitals, Browser Internals, React Architecture)
- **Backend Awareness (20% Node/Express):** [04-Backend-Awareness](./Prep/04-Backend-Awareness/README.md)
- **Networks & Web Protocols:** [05-Networks-Web](./Prep/05-Networks-Web/README.md) (DNS → TCP → TLS → HTTP/3)
- **Interactive Q&A Bank:** [06-Interview-QA](./Prep/06-Interview-QA/README.md) (100+ Collapsed Q&A with Answers & Tradeoffs)

---

## Project Structure

```text
├── Infrastructure/             # Traffic routing & Observability
├── Logging-Monitoring/         # Telemetry, Log Collection & Monitoring
│   ├── CorrelationID/           # Distributed tracing & Correlation ID setup
│   └── Logging_Monitoring_QA.md # 17 Core Logging & Monitoring Q&A Guide
├── Database&Caching/           # Distributed & Client-side Storage & Caching
│   ├── apiCaching/             # Client-side heap caches & fetch policies
│   ├── cookie/                 # Secure cookie policies & transmission
│   ├── httpCaching/            # Browser network caching & validation
│   ├── indexeddb/              # Transactional client databases & upgrades
│   ├── localstorage/           # Persistent synchronous client storage
│   ├── normalization/          # Normalized client-side state maps
│   ├── serviceWorker/          # Custom proxy interceptors & offline assets
│   ├── sessionstorage/         # Tab-isolated session storage
│   ├── stateManagement/        # Client state libraries & hook paradigms
│   └── Database_Caching_QA.md  # 21 Core Database & Caching Q&A Guide
├── Communication/               # Real-time & Event-driven patterns
│   ├── ShortPolling/            # Basic interval-based polling
│   ├── LongPolling/             # Optimized hanging requests
│   ├── Webhooks/                # Server-to-server POST callbacks
│   ├── ServerSentEvent/         # Unidirectional streaming (SSE)
│   ├── WebSocket/               # Full-duplex bidirectional streams
│   ├── WebRTC.md                # Peer-to-peer real-time connection
│   └── Communication_QA.md      # 15 Core Communication Q&A Guide
├── Networking/                  # API Architectural Styles
│   ├── RestAPI/                 # Standard REST implementation
│   ├── Graphql/                 # Schema-driven query language
│   ├── gRPC/                    # High-performance RPC (Protocol Buffers)
│   └── Networking_QA.md         # 28 Core Networking Q&A Guide
├── Security/                    # End-to-End Security Architecture
│   ├── Auth/                    # Identity & Session Management
│   ├── CORS/                    # Cross-Origin Resource Sharing
│   ├── ClientSideStorage/       # Secure cookies, localStorage & sessionStorage
│   ├── FeatureFlags/            # Feature toggle management
│   ├── SecurityHeaders/         # Security headers (HSTS, CSP, X-Frame-Options)
│   ├── SubresourceIntegrity/    # SRI hashes verification
│   ├── Validation/              # Input validation and sanitization
│   ├── XSS/                     # Cross-Site Scripting & CSP
│   ├── CSRF.md                  # Detailed CSRF Mitigations
│   ├── SSRF&JI.md               # SSRF, Injection & XXE
│   ├── Compliance&Regulations.md # GDPR, HIPAA, SOC 2
│   └── Security_QA.md           # 33 Core Security Q&A Guide
├── Performance/                 # Web Performance Optimization
│   ├── Metrics/                 # Web Vitals (LCP, FID/INP, CLS) & measurement
│   ├── Assets/                  # Image & font optimization
│   ├── Network/                 # Network optimization, HTTP/3, compression
│   ├── React/                   # React rendering lifecycle & memoization hooks
│   └── Rendering/               # SSR, CSR, SSG & ISR patterns
├── Questions/                   # Interview Prep & Deep Dives
│   ├── Detailed/                # Scaling, Performance, Design Patterns, React
│   │   ├── Architecture_Scaling.md
│   │   ├── Browser_Build_Networking.md
│   │   ├── Design_Patterns.md
│   │   ├── Misc.md
│   │   ├── Performance_Optimization.md
│   │   ├── ReactInternals/          # React rendering lifecycle & engine deep dives
│   │   │   ├── index.md
│   │   │   ├── React_Deep_Dive_Advanced.md
│   │   │   ├── React_Deep_Dive_Cheat_Sheet.md
│   │   │   └── React_Deep_Dive_Internals.md
│   │   └── Security_Architect.md
│   ├── machine_code.md          # Machine coding round preparation
│   └── Interviewer_Reference.md # Key concepts for interviews
├── Accessibility/               # Web Accessibility (a11y) & WCAG Architecture
│   ├── README.md                # 10 Pillars Taxonomy Mindmap & Microsoft Inclusive Matrix
│   ├── KeyboardAccessibility.md # Master Keyboard Navigation, Roving tabindex & Focus Traps
│   ├── FocusManagement.md       # LIFO Focus Stack, SPA Route Announcers, inert attribute
│   ├── ColorContrast.md         # WCAG Ratios (4.5:1 / 3:1), APCA, Forced Colors Mode
│   ├── ScreenReader.md          # AccTree Compilation, NVDA/VoiceOver, aria-live regions
│   ├── AccessbilityTools.md     # 4-Tier Testing Pyramid (ESLint, Jest-axe, Playwright)
│   └── WCAG_Accessibility.md    # 770+ Line WCAG 2.1/2.2 Spec & Staff Architect Interview Grill
├── cheatsheets/                 # Quick-Reference Cheatsheets & System Architecture
│   ├── eslint/                  # 10 Modular ESLint & Quality Gate Guides
│   │   ├── 01-a11y-strict.md    # jsx-a11y/strict WCAG rule mapping & AI pitfalls
│   │   ├── 02-typescript-typechecked.md # Type-aware linting & zero-unsafe rules
│   │   ├── 04-storybook-a11y-automation.md # Axe Test-Runner automated CI pipeline
│   │   └── 09-production-configs.md # Copy-paste Flat (v9+) & Legacy configs
│   ├── eslint.md                # Consolidated Single-File ESLint Master Reference
│   ├── dbdecision.md            # Database decision framework & PACELC matrix
│   ├── typescript.md            # TypeScript types vs interfaces & utility types
│   └── Performance_Optimization.md # Core Web Vitals & bundle optimization
├── LLD/                         # Low-Level Design & Object-Oriented Design
└── Web/                         # Fundamentals & Web Infrastructure
    ├── Headers.md               # Deep dive into HTTP Headers
    ├── Scalability.md           # Horizontal vs Vertical scaling
    ├── Git.md                   # Version control & Git internals
    ├── Git Pre-Read Analysis.md # Deep analysis of Git workflows
    ├── MicroFrontends.md        # Micro Frontend design and loading patterns
    ├── terminal.md              # Terminal & CLI productivity
    ├── tech-acronyms.md         # Comprehensive tech glossary
    └── web.md                   # Core web concepts and protocols
```

---

```text
├── Prep/                       # Master Preparation System
│   ├── 01-LLD/                 # Low-Level Design, OOP, SOLID, Design Patterns, UML
│   ├── 02-HLD/                 # High-Level Design, Microservices, Distributed Systems
│   ├── 03-Frontend-SD/         # Frontend Architecture, Rendering, Performance, CWV
│   ├── 04-Backend-Awareness/   # Node.js Async I/O, REST/GraphQL/gRPC, Data Modeling
│   ├── 05-Networks-Web/        # HTTP/3, TLS 1.3, DNS, CDNs, WebSockets
│   ├── 06-Interview-QA/        # Scenario Edge Cases & Staff Grill Q&A
│   └── 07-Problem-Bank/        # 55 Master System Design Problems & Blueprints
│       ├── Games & Puzzles/
│       ├── Data Structures & Search/
│       ├── Managing States/
│       ├── Management Systems/
│       ├── Communication & Messaging/
│       ├── Financial & Payment Systems/
│       ├── E-commerce & Booking Systems/
│       ├── Developer Tools & Infrastructure/
│       ├── Social & Content Platforms/
│       └── DOMAIN-SEARCH-COMPARISON.md  # Google vs Amazon vs Social Search Architectures
├── Communication/              # Real-time & Event-driven patterns (SSE, WebSockets, WebRTC)
├── Database&Caching/          # Caching (Redis, Cache-Aside), Client Storage, Sharding
├── Infrastructure/             # Traffic Routing, Gateways, Load Balancers, CDN Edge
├── Logging-Monitoring/        # Distributed Tracing, Telemetry, OpenTelemetry, Correlation IDs
├── Networking/                 # API Architectural Styles (REST, GraphQL, gRPC)
├── Performance/                # Web Performance, Core Web Vitals, Asset & Network Optimization
└── Security/                   # End-to-End Security Architecture (OAuth2/PKCE, CSP, XSS, CSRF)
```

## 🚀 Key Modules

### 1. [Infrastructure & Observability](./Infrastructure/README.md)

Master the "Nervous System" of distributed systems. Covers L4/L7 Load Balancing, Service Mesh (Istio), the 3 Pillars of Observability (Metrics, Logs, Tracing), and advanced deployment strategies like Blue/Green and Canary.

### 2. [Logging & Monitoring](./Logging-Monitoring/README.md)

A deep dive into data collection and telemetry. Covers capturing user interactions, performance metrics (Web Vitals), resource errors, and utilization tracking. Access the [17 Core Logging & Monitoring Q&A Guide](./Logging-Monitoring/Logging_Monitoring_QA.md) directly.

### 3. [Database & Caching](./Database&Caching/README.md)

Full-stack storage and caching strategies. Covers PACELC database selection, distributed caching (Cache-Aside, Write-Through/Back), cache coherency, message idempotency, HTTP caching, client-side databases (IndexedDB, localStorage, sessionStorage, cookies), service worker proxy routing, API cache policies, state normalization, and client-side state management libraries (Redux, MobX, Context, Vuex, NgRx, Zustand, XState). Access the [21 Core Database & Caching Q&A Guide](./Database&Caching/Database_Caching_QA.md) directly.

### 4. [Communication Strategies](./Communication/README.md)

Explore how services talk to each other. Includes a decision tree for choosing between WebSockets, SSE, Webhooks, and Polling based on real-time requirements and scalability. Access the [15 Core Communication Q&A Guide](./Communication/Communication_QA.md) directly.

### 5. [Networking Protocols](./Networking/README.md)

Practical implementations of the three most common API styles (REST, GraphQL, gRPC). Access the [28 Core Networking Q&A Guide](./Networking/Networking_QA.md) directly.

- **REST:** Traditional stateless resource-based APIs.
- **GraphQL:** Client-specified data fetching to prevent over-fetching.
- **gRPC:** Binary protocol using Protocol Buffers for high-efficiency microservices communication.

### 6. [Security Engineering](./Security/README.md)

Comprehensive coverage of web and architectural security:

- **Browser Security:** CORS, HSTS, SameSite Cookies, and CSP.
- **Attack Mitigations:** In-depth guides on XSS, CSRF (vulnerabilities and tokens), SSRF, and SQLi.
- **Architecture:** Zero Trust, OAuth2/OIDC, and secure JWT management.
- **Compliance:** Practical insights into GDPR, SOC 2, and HIPAA.
- **Interview Q&A:** [33 Core Security Q&A Guide](./Security/Security_QA.md) covering web-security vulnerabilities, headers, and compliance.

### 7. [Performance Optimization](./Performance/README.md)

A deep dive into the 8 pillars of web performance:

- **Metrics:** Core Web Vitals (LCP, FID, CLS).
- **Optimization:** Network, Asset, Build, and Framework-specific (React) techniques.
- **Patterns:** SSR, CSR, SSG, and ISR trade-offs.

### 8. [Interview & Concept Deep Dives](./Questions/ques.md)

A curated collection of system design questions, architecture scaling strategies, and performance optimization techniques for senior engineering roles. Directly jump to detailed topics:

- **[React Deep Dive: Layout Phase & General Internals](./Questions/Detailed/ReactInternals/index.md)**: Nuances on Ref accuracy, reference equality, and lifecycle leaks.
- **[React Deep Dive: Core Engine & Architecture (Part 1)](./Questions/Detailed/ReactInternals/React_Deep_Dive_Internals.md)**: useRef stable instance storage, Virtual DOM reconciliation (Myers vs Zhang-Shasha algorithms), recursive Stack vs Concurrent Fiber, rendering pipeline (Render/Commit/Paint), state management quirks, `useSyncExternalStore` subscription tearing, and tricky hooks.
- **[React Deep Dive: Advanced Concurrency & Hooks (Part 2)](./Questions/Detailed/ReactInternals/React_Deep_Dive_Advanced.md)**: Deep hook mechanics (circular update queue, eager bailouts, WorkTags), transition interruption, 32-bit bitmask Lanes priorities, bubbled-up `childLanes`, React 19 compiler integration, Actions and `useOptimistic` engine, selective hydration, and system telemetry auditing.
- **[React Deep Dive: Grill Questions & Timing Cheat Sheet (Part 3)](./Questions/Detailed/ReactInternals/React_Deep_Dive_Cheat_Sheet.md)**: 14 Consolidated Senior/Staff level "Grill" questions, Internals quick-reference flags matrix, timing API differences, Event Loop execution stages, and high-performance Double-rAF animation synchronization pattern.
- **[Security Architecture](./Questions/Detailed/Security_Architect.md)**: Zero Trust, OAuth2/OIDC, XSS/CSRF mitigations, SSRF, SQLi, and compliance (GDPR, SOC 2, HIPAA).
- **[Architecture & Scaling](./Questions/Detailed/Architecture_Scaling.md)**: Scaling patterns, database sharding, CAP/PACELC theorems, and distributed caching.
- **[Performance Optimization](./Questions/Detailed/Performance_Optimization.md)**: Core Web Vitals diagnostic breakdown, image/font optimizations, and rendering patterns.
- **[Design Patterns](./Questions/Detailed/Design_Patterns.md)**: Gang of Four design patterns, structural layouts, and object-oriented architectures.
- **[Browser, Build & Networking](./Questions/Detailed/Browser_Build_Networking.md)**: Module compilation, bundlers, tree-shaking, HTTP headers, and browser render pipelines.
- **[Machine Coding Preparation](./Questions/machine_code.md)**: Guidelines, patterns, and templates for machine coding round success.
- **[Interviewer Reference Guide](./Questions/Interviewer_Reference.md)**: High-level reference sheets and conceptual checks.

### 9. [Web Fundamentals](./Web/web.md)

Exhaustive documentation on the building blocks of the web:

- **Protocols & Headers:** HTTP internals and header management.
- **Infrastructure:** Scalability patterns and terminal mastery.
- **Workflow:** Git internals and tech acronyms for industry-standard communication.

### 10. [Low-Level Design (LLD) & Object-Oriented Design](./LLD/LLD.md)

A comprehensive guide to writing clean, modular, extensible, and high-performance software. Covers the progression from Beginner OOP fundamentals to Staff-level lock-free design:

- **Core Elements:** Distinguishing Elements, Components, Documents, and Composition mechanisms.
- **SOLID & GoF Design Patterns:** Creational, Structural, and Behavioral patterns with real-world scenarios.
- **Advanced Concurrency & DDD:** Thread-safe architectures, object pooling, and domain boundary isolation.
- **High-Performance Primitives:** Lock-free structures (CAS), CPU cache lines, custom DSL engines, and LLD governance.

### 11. [Web Accessibility (a11y) & WCAG Architecture](./Accessibility/README.md)

Comprehensive enterprise guide for building 100% accessible, WCAG 2.1/2.2 AA compliant applications:

- **10 Core Pillars:** Taxonomy mindmap, Microsoft Inclusive Design Model (Permanent, Temporary, Situational), and Assistive Tech deep-dives.
- **[Keyboard Accessibility](./Accessibility/KeyboardAccessibility.md):** Complete event pipelines, `tabindex` decision engines, focus trapping hooks (`useFocusTrap`), Roving `tabindex` vs virtual focus (`aria-activedescendant`), and Playwright E2E suites.
- **[Focus Management](./Accessibility/FocusManagement.md):** LIFO Focus History stack, SPA client-side route announcers, and native `inert` isolation.
- **[Color Contrast & Themes](./Accessibility/ColorContrast.md):** WCAG formulas, APCA (WCAG 3.0), Forced Colors mode, and Color Vision Deficiencies.
- **[Screen Readers & AccTree](./Accessibility/ScreenReader.md):** AccTree compilation pipeline, NVDA/VoiceOver/JAWS/TalkBack heuristics, and live region queues.
- **[WCAG Interview Grill](./Accessibility/WCAG_Accessibility.md):** 770+ line spec and Staff-level scenario grill.

### 12. [ESLint & Automated Quality Suite](./cheatsheets/eslint/README.md)

Modular, production-ready linting and test-runner automation architecture:

- **[01. a11y Strict Mode](./cheatsheets/eslint/01-a11y-strict.md):** Non-negotiable WCAG error rules and standard AI code pitfalls.
- **[02. TypeScript Type-Checked](./cheatsheets/eslint/02-typescript-typechecked.md):** Type-aware linting (`projectService: true`), unhandled promise catches, zero-`any` rules.
- **[03. React & Compiler](./cheatsheets/eslint/03-react-hooks-compiler.md):** React 19 compiler rules, hooks dependency integrity, reconciliation key safety.
- **[04. Storybook a11y Pipeline](./cheatsheets/eslint/04-storybook-a11y-automation.md):** Storybook + Axe Test-Runner automated CI pipeline (`a11yParams.json`, `a11y-report.mjs`).
- **[09. Production Configs](./cheatsheets/eslint/09-production-configs.md):** Copy-paste Modern Flat Config (`eslint.config.mjs`) & Legacy (`.eslintrc.json`).

### 13. [Categorized Cheatsheets & Master Reference](./cheatsheets/README.md)

Quick-lookup architectural cheat sheets spanning Database Selection, DOM/CSSOM, WASM & Web SDKs, React Fiber & Lanes, Redux Toolkit & Sagas, and Performance Optimization.

---

## 🛠️ Quick Start & Local Development

This repository contains both theoretical documentation and an interactive, real-time **State Management & LLD Showcase Application** under the `LLD` directory.

To run the interactive laboratory and feature showcase locally:

1. **Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.
2. **Navigate to the LLD project folder:**
   ```bash
   cd LLD
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the local development server:**
   ```bash
   npm run dev
   ```
5. **Open your browser:** Visit `http://localhost:5173` (or the port specified in your terminal, e.g. `http://localhost:5174`) to interact with the showcase!

### Development scripts:

- `npm run dev` - Start local development server (Vite-powered showcase app).
- `npm run lint` - Run ESLint checks across the codebase.
- `npm run typecheck` - Run TypeScript compiler checks.
- `npm run build` - Compile production-ready bundles for all apps and packages in the monorepo workspace.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you are fixing bugs, improving documentation, adding new design patterns, or introducing new interactive modules, please check out our [CONTRIBUTING.md](./CONTRIBUTING.md) guide to get started.

---

## 🔗 Useful Resources

- **Design Patterns:** [kumaratul60/design-patterns](https://github.com/kumaratul60/design-patterns)
- **React Web Development:** [kumaratul60/web-dev/Notes](https://github.com/kumaratul60/web-dev/tree/main/Notes)
- **JavaScript in Depth:** [kumaratul60/javascript-interview](https://github.com/kumaratul60/javascript-interview)
- **System Design:** [kumaratul60/System-Design](https://github.com/kumaratul60/System-Design)
- **Online JavaScript Editor:** [Runlet Practice Environment](https://runlet.vercel.app)
- **Frontend-Lab:** [Practice Machine Coding Questions](https://fe-battle.vercel.app)
- **React Playground:** [Practice pure React JS, HTML, and CSS (write component tests without libraries)](https://fe-battle.vercel.app/interview/playground)

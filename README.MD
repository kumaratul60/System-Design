# System Design & Architecture Laboratory

A comprehensive repository for exploring, implementing, and documenting core System Design patterns, Networking protocols, and Communication strategies.

> **🌟 Key Feature:** This repository has been **"Grill-Hardened"** for Senior and Staff-level engineering roles. Each module contains a **"Senior/Staff Level Grill"** section covering architectural trade-offs, edge-case failures, and deep protocol nuances.

## Table of Contents

- [System Design \& Architecture Laboratory](#system-design--architecture-laboratory)
  - [Table of Contents](#table-of-contents)
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
  - [🛠️ Quick Start \& Local Development](#️-quick-start--local-development)
    - [Development scripts:](#development-scripts)
  - [🤝 Contributing](#-contributing)
  - [🔗 Useful Resources](#-useful-resources)

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

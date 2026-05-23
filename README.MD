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
  - [🔗 Useful Resources](#-useful-resources)

---

## Project Structure

```text
├── Infrastructure/             # Traffic routing & Observability
├── Logging-Monitoring/         # Telemetry, Log Collection & Monitoring
│   └── CorrelationID/           # Distributed tracing & Correlation ID setup
├── Database&Caching/           # Distributed & Client-side Storage & Caching
├── Communication/               # Real-time & Event-driven patterns
│   ├── ShortPolling/            # Basic interval-based polling
│   ├── LongPolling/             # Optimized hanging requests
│   ├── Webhooks/                # Server-to-server POST callbacks
│   ├── ServerSentEvent/         # Unidirectional streaming (SSE)
│   ├── WebSocket/               # Full-duplex bidirectional streams
│   └── WebRTC.md                # Peer-to-peer real-time connection
├── Networking/                  # API Architectural Styles
│   ├── RestAPI/                 # Standard REST implementation
│   ├── Graphql/                 # Schema-driven query language
│   └── gRPC/                    # High-performance RPC (Protocol Buffers)
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
│   └── Compliance&Regulations.md # GDPR, HIPAA, SOC 2
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
│   │   ├── React_Fundamentals.md
│   │   └── Security_Architect.md
│   ├── machine_code.md          # Machine coding round preparation
│   └── Interviewer_Reference.md # Key concepts for interviews
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

A deep dive into data collection and telemetry. Covers capturing user interactions, performance metrics (Web Vitals), resource errors, and utilization tracking.

### 3. [Database & Caching](./Database&Caching/README.md)

Full-stack storage and caching strategies. Covers PACELC database selection, distributed caching (Cache-Aside, Write-Through/Back), cache coherency, message idempotency, HTTP caching, and client-side database options (IndexedDB, localStorage).

### 4. [Communication Strategies](./Communication/README.md)

Explore how services talk to each other. Includes a decision tree for choosing between WebSockets, SSE, Webhooks, and Polling based on real-time requirements and scalability.

### 5. [Networking Protocols](./Networking/README.md)

Practical implementations of the three most common API styles:

- **REST:** Traditional stateless resource-based APIs.
- **GraphQL:** Client-specified data fetching to prevent over-fetching.
- **gRPC:** Binary protocol using Protocol Buffers for high-efficiency microservices communication.

### 6. [Security Engineering](./Security/README.md)

Comprehensive coverage of web and architectural security:

- **Browser Security:** CORS, HSTS, SameSite Cookies, and CSP.
- **Attack Mitigations:** In-depth guides on XSS, CSRF (vulnerabilities and tokens), SSRF, and SQLi.
- **Architecture:** Zero Trust, OAuth2/OIDC, and secure JWT management.
- **Compliance:** Practical insights into GDPR, SOC 2, and HIPAA.

### 7. [Performance Optimization](./Performance/README.md)

A deep dive into the 8 pillars of web performance:

- **Metrics:** Core Web Vitals (LCP, FID, CLS).
- **Optimization:** Network, Asset, Build, and Framework-specific (React) techniques.
- **Patterns:** SSR, CSR, SSG, and ISR trade-offs.

### 8. [Interview & Concept Deep Dives](./Questions/ques.md)

A curated collection of system design questions, architecture scaling strategies, and performance optimization techniques for senior engineering roles. Directly jump to detailed topics:

- **[React Fundamentals](./Questions/Detailed/React_Fundamentals.md)**: State management quirks, Fiber architecture, hooks lifecycle, render props, context, and JSX internals.
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

---

## 🔗 Useful Resources

- **Design Patterns:** [kumaratul60/design-patterns](https://github.com/kumaratul60/design-patterns)
- **React Web Development:** [kumaratul60/web-dev/Notes](https://github.com/kumaratul60/web-dev/tree/main/Notes)
- **JavaScript in Depth:** [kumaratul60/javascript-interview](https://github.com/kumaratul60/javascript-interview)
- **System Design:** [kumaratul60/System-Design](https://github.com/kumaratul60/System-Design)
- **Online JavaScript Editor:** [Runlet Practice Environment](https://runlet.vercel.app)

# System Design & Architecture Laboratory

A comprehensive repository for exploring, implementing, and documenting core System Design patterns, Networking protocols, and Communication strategies.

> **🌟 Key Feature:** This repository has been **"Grill-Hardened"** for Senior and Staff-level engineering roles. Each module contains a **"Senior/Staff Level Grill"** section covering architectural trade-offs, edge-case failures, and deep protocol nuances.

## Project Structure

```text
├── Infrastructure/             # Traffic routing & Observability
├── Data/                       # Distributed Storage & Caching
├── Communication/               # Real-time & Event-driven patterns
│   ├── ShortPolling/            # Basic interval-based polling
│   ├── LongPolling/             # Optimized hanging requests
│   ├── Webhooks/                # Server-to-server POST callbacks
│   ├── ServerSentEvent/         # Unidirectional streaming (SSE)
│   └── WebSocket/               # Full-duplex bidirectional streams
├── Networking/                  # API Architectural Styles
│   ├── RestAPI/                 # Standard REST implementation
│   ├── Graphql/                 # Schema-driven query language
│   └── gRPC/                    # High-performance RPC (Protocol Buffers)
├── Security/                    # End-to-End Security Architecture
│   ├── Auth/                    # Identity & Session Management
│   ├── XSS/                     # Cross-Site Scripting & CSP
│   ├── CSRF.md                  # Detailed CSRF Mitigations
│   ├── SSRF&JI.md               # SSRF, Injection & XXE
│   └── Compliance&Regulations.md # GDPR, HIPAA, SOC 2
├── Performance/                 # Web Performance Optimization
│   ├── README.md                # Comprehensive performance overview
│   ├── Metrics/                 # Web Vitals & measurement
│   └── Assets/                  # Image & code optimization
├── Questions/                   # Interview Prep & Deep Dives
│   ├── Detailed/                # Scaling, Performance, Design Patterns
│   ├── machine_code.md          # Machine coding round preparation
│   └── Interviewer_Reference.md # Key concepts for interviews
└── Web/                         # Fundamentals & Web Infrastructure
    ├── Headers.md               # Deep dive into HTTP Headers
    ├── Scalability.md           # Horizontal vs Vertical scaling
    ├── Git.md                   # Version control & Git internals
    ├── Git Pre-Read Analysis.md # Deep analysis of Git workflows
    ├── terminal.md              # Terminal & CLI productivity
    ├── tech-acronyms.md         # Comprehensive tech glossary
    └── web.md                   # Core web concepts and protocols
```

---

## 🚀 Key Modules

### 1. [Infrastructure & Observability](./Infrastructure/README.md)

Master the "Nervous System" of distributed systems. Covers L4/L7 Load Balancing, Service Mesh (Istio), the 3 Pillars of Observability (Metrics, Logs, Tracing), and advanced deployment strategies like Blue/Green and Canary.

### 2. [Distributed Data & Caching](./Data/README.md)

Masterclass on storage selection using the **PACELC Theorem**. Deep dive into Caching strategies (Cache-Aside, Write-Back), Cache Coherency, and high-scale messaging patterns like the Outbox Pattern and Idempotent Consumers.

### 3. [Communication Strategies](./Communication/README.md)

Explore how services talk to each other. Includes a decision tree for choosing between WebSockets, SSE, Webhooks, and Polling based on real-time requirements and scalability.

### 2. [Networking Protocols](./Networking/README.md)

Practical implementations of the three most common API styles:

- **REST:** Traditional stateless resource-based APIs.
- **GraphQL:** Client-specified data fetching to prevent over-fetching.
- **gRPC:** Binary protocol using Protocol Buffers for high-efficiency microservices communication.

### 3. [Security Engineering](./Security/README.md)

Comprehensive coverage of web and architectural security:

- **Browser Security:** CORS, HSTS, SameSite Cookies, and CSP.
- **Attack Mitigations:** In-depth guides on XSS, CSRF (vulnerabilities and tokens), SSRF, and SQLi.
- **Architecture:** Zero Trust, OAuth2/OIDC, and secure JWT management.
- **Compliance:** Practical insights into GDPR, SOC 2, and HIPAA.

### 4. [Performance Optimization](./Performance/README.md)

A deep dive into the 8 pillars of web performance:

- **Metrics:** Core Web Vitals (LCP, FID, CLS).
- **Optimization:** Network, Asset, Build, and Framework-specific (React) techniques.
- **Patterns:** SSR, CSR, SSG, and ISR trade-offs.

### 5. [Interview & Concept Deep Dives](./Questions/Detailed/Security_Architect.md)

A curated collection of system design questions, architecture scaling strategies, and performance optimization techniques for senior engineering roles.

### 6. [Web Fundamentals](./Web/web.md)

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

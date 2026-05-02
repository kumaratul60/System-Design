# System Design & Architecture Laboratory

A comprehensive repository for exploring, implementing, and documenting core System Design patterns, Networking protocols, and Communication strategies.

## Project Structure

```text
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

### 1. [Communication Strategies](./Communication/README.md)

Explore how services talk to each other. Includes a decision tree for choosing between WebSockets, SSE, Webhooks, and Polling based on real-time requirements and scalability.

### 2. [Networking Protocols](./Networking/README.md)

Practical implementations of the three most common API styles:

- **REST:** Traditional stateless resource-based APIs.
- **GraphQL:** Client-specified data fetching to prevent over-fetching.
- **gRPC:** Binary protocol using Protocol Buffers for high-efficiency microservices communication.

### 3. [Interview & Concept Deep Dives](./Questions/Interviewer_Reference.md)

A curated collection of system design questions, architecture scaling strategies, and performance optimization techniques for senior engineering roles.

### 4. [Web Fundamentals](./Web/web.md)

Exhaustive documentation on the building blocks of the web:

- **Protocols & Headers:** HTTP internals and header management.
- **Infrastructure:** Scalability patterns and terminal mastery.
- **Workflow:** Git internals and tech acronyms for industry-standard communication.

---

## 🛠️ Tech Stack & Concepts

- **Node.js & Express:** Core for most service implementations.
- **TypeScript:** Used in the GraphQL implementation for type safety.
- **Protocol Buffers:** For gRPC service definitions.
- **Event-Driven Architecture:** Focused on Webhooks and WebSockets.
- **Full-Duplex vs. Half-Duplex:** Explored through various communication modes.

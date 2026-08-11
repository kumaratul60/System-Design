# 🗓️ 8-Week Principal Staff Architect Study Roadmap

> **Target Role:** Staff Engineer / Principal Engineer / Architect
> **Focus:** 80% Frontend Depth | 20% Backend Integration | LLD + HLD + System Design + Networks
> **Time commitment:** 2–4 hours/day, 5–6 days/week.

---

## 📊 8-Week Timeline (Gantt)

```mermaid
gantt
    title Principal/Staff Architect — 8-Week Master Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  Week %W

    section LLD
    Week 1: OOP, SOLID, Design Principles       :w1, 2026-08-10, 7d
    Week 2: Design Patterns + Machine Coding     :w2, after w1, 7d
    Week 3: UML + Requirements + Concurrency     :w3, after w2, 7d

    section HLD
    Week 4: Architecture + Distributed Systems   :w4, after w3, 7d
    Week 5: Caching, DB, Messaging, Scaling      :w5, after w4, 7d

    section Frontend
    Week 6: Rendering, CWV, Browser Internals    :w6, after w5, 7d
    Week 7: React Arch, Real-time, Micro-FE      :w7, after w6, 7d

    section Synthesis
    Week 8: Full Mock Interviews + QA Review     :w8, after w7, 7d
```

---

## 🔁 Daily 3-Step Practice Loop (Non-Negotiable)

Run this **every day**, regardless of what week you are in (45–60 mins):

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  DAILY PRACTICE LOOP                                                    │
│                                                                         │
│  ① PICK   (5 min)                                                       │
│     → Choose 1 LLD, HLD, or Frontend System Design problem.             │
│                                                                         │
│  ② DESIGN  (25–35 min)                                                  │
│     → Apply FUN-SCALE framework: FR, NFR, Scale, Mermaid Diagram,       │
│       State Model, TS Code, Bottlenecks.                                │
│                                                                         │
│  ③ SPEAK ALOUD (10–15 min)                                              │
│     → Narrate your design aloud: "I chose X over Y because..."          │
│       Defend trade-offs, edge cases, and failure modes.                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Week 1 — LLD Foundation: OOP, SOLID & Design Principles

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Build the bedrock. Master OOP 4 pillars, SOLID principles with TS before/after code, and core design principles (DRY, KISS, YAGNI, Law of Demeter, Coupling/Cohesion).

### 📚 Study Files to Read

- 📖 [`01-LLD/README.md`](./01-LLD/README.md) — LLD 7-Phase Framework & Signals
- 📖 [`01-LLD/01-OOP-Concepts.md`](./01-LLD/01-OOP-Concepts.md) — 4 Pillars, TS Code, Scale Failures
- 📖 [`01-LLD/02-SOLID.md`](./01-LLD/02-SOLID.md) — S.O.L.I.D. with TS + Notification System Case Study
- 📖 [`01-LLD/03-Design-Principles.md`](./01-LLD/03-Design-Principles.md) — DRY, KISS, YAGNI, Law of Demeter, Coupling & Cohesion

### ✍️ Practice Exercises & Q&A

- Self-test with 28 collapsed Q&A blocks in [`01-LLD/01-OOP-Concepts.md`](./01-LLD/01-OOP-Concepts.md) & [`01-LLD/02-SOLID.md`](./01-LLD/02-SOLID.md).

---

## 📅 Week 2 — Design Patterns & Machine Coding

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

High-ROI design patterns (Factory, Singleton, Adapter, Decorator, Strategy, Observer) and executable Machine Coding in TypeScript.

### 📚 Study Files to Read

- 📖 [`01-LLD/04-Design-Patterns.md`](./01-LLD/04-Design-Patterns.md) — High-ROI Patterns with TS Code & Decision Flowchart
- 📖 [`01-LLD/06-Machine-Coding.md`](./01-LLD/06-Machine-Coding.md) — Executable LRU Cache, Splitwise Debt Minimizer, Rate Limiter in TS

### ✍️ Practice Exercises & Q&A

- Implement LRU Cache in TS (`Map` + Doubly LinkedList with Sentinel nodes).
- Practice LLD Questions in [`06-Interview-QA/LLD-QA.md`](./06-Interview-QA/LLD-QA.md).

---

## 📅 Week 3 — UML, Requirements Breakdown & Concurrency

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Learn to draw Class, Sequence & Component diagrams in Mermaid. Master the FUN-SCALE requirements breakdown framework and thread-safety concurrency primitives.

### 📚 Study Files to Read

- 📖 [`01-LLD/05-UML-Diagrams.md`](./01-LLD/05-UML-Diagrams.md) — Class, Sequence & Component Diagrams + FUN-SCALE Framework
- 📖 [`01-LLD/07-Concurrency-Design.md`](./01-LLD/07-Concurrency-Design.md) — Mutex, Semaphore, Producer-Consumer, Lock-Free CAS Atomics

### ✍️ Practice Exercises & Q&A

- Draw sequence diagram for HTTP request flow & JWT verification.
- Implement an Async Producer-Consumer queue in TypeScript.

---

## 📅 Week 4 — HLD Foundation: Architecture Patterns & Distributed Systems

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Shift to system-level architecture: Monolith vs Microservices, Event-Driven Architecture (CQRS / Event Sourcing), BFF, DDD, CAP & PACELC theorems, Consistent Hashing, 2PC vs Saga transactions.

### 📚 Study Files to Read

- 📖 [`02-HLD/README.md`](./02-HLD/README.md) — HLD 5-Step Interview Framework
- 📖 [`02-HLD/01-Architecture-Patterns.md`](./02-HLD/01-Architecture-Patterns.md) — Monolith, Microservices, Event-Driven, BFF, DDD
- 📖 [`02-HLD/02-Distributed-Systems.md`](./02-HLD/02-Distributed-Systems.md) — CAP, PACELC, Consistent Hashing Ring, Saga Pattern, CRDTs

### ✍️ Practice Exercises & Q&A

- Practice HLD Q&A in [`06-Interview-QA/HLD-QA.md`](./06-Interview-QA/HLD-QA.md).

---

## 📅 Week 5 — HLD Advanced: Caching, Databases & Classic Systems

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Master distributed caching (Cache-aside vs Write-through), SQL vs NoSQL sharding, and classic system designs.

### 📚 Study Files to Read

- 📖 [`02-HLD/11-Classic-Problems.md`](./02-HLD/11-Classic-Problems.md) — Distributed Rate Limiter, Twitter Feed System (Push vs Pull), WhatsApp Messaging

### ✍️ Practice Exercises & Q&A

- Design a Distributed Rate Limiter with Redis Sliding Window Lua Script.

---

## 📅 Week 6 — Frontend System Design: Rendering, CWV & Browser Internals

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Deep dive into Rendering Strategies (CSR, SSR, SSG, ISR, Streaming SSR, RSC, Islands), Core Web Vitals (LCP, INP, CLS, TTFB), Resource Hints, Event Loop, Layout Thrashing, and Garbage Collection.

### 📚 Study Files to Read

- 📖 [`03-Frontend-SD/README.md`](./03-Frontend-SD/README.md) — FE System Design Framework
- 📖 [`03-Frontend-SD/01-Rendering-Strategies.md`](./03-Frontend-SD/01-Rendering-Strategies.md) — All Rendering Strategies Matrix & Decision Tree
- 📖 [`03-Frontend-SD/02-Performance-CWV.md`](./03-Frontend-SD/02-Performance-CWV.md) — Core Web Vitals, Resource Hints, Yielding Main Thread
- 📖 [`03-Frontend-SD/03-Browser-Internals.md`](./03-Frontend-SD/03-Browser-Internals.md) — Event Loop, Rendering Pipeline, Layout Thrashing, Memory Leaks

### ✍️ Practice Exercises & Q&A

- Practice Frontend Q&A in [`06-Interview-QA/FE-SD-QA.md`](./06-Interview-QA/FE-SD-QA.md).

---

## 📅 Week 7 — React Engine, Micro Frontends & Hot FE Practice

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Master React Fiber engine (32-bit Lanes, `useSyncExternalStore`), Micro Frontends (Module Federation), Advanced Principal Gaps (OpenTelemetry RUM, OAuth2 PKCE, Trusted Types XSS, Design Tokens), and Hot Practice Prompts.

### 📚 Study Files to Read

- 📖 [`03-Frontend-SD/04-React-Architecture.md`](./03-Frontend-SD/04-React-Architecture.md) — React Fiber Engine, Lanes Priority, `useSyncExternalStore`
- 📖 [`03-Frontend-SD/10-Frontend-Classic.md`](./03-Frontend-SD/10-Frontend-Classic.md) — YouTube Video Player, Virtualized Feed, Search Autocomplete
- 📖 🔥 [`03-Frontend-SD/HOT-FE-INTERVIEW-PRACTICE.md`](./03-Frontend-SD/HOT-FE-INTERVIEW-PRACTICE.md) — Figma Whiteboard, Micro Frontend Platform, Offline Task PWA
- 📖 📄 [`03-Frontend-SD/11-Frontend-Systems-Catalog.md`](./03-Frontend-SD/11-Frontend-Systems-Catalog.md) — Uber Live Map, Dropbox Chunked Upload, VS Code Web, Toast Center
- 📖 🎯 [`03-Frontend-SD/ADVANCED-PRINCIPAL-GAPS.md`](./03-Frontend-SD/ADVANCED-PRINCIPAL-GAPS.md) — OpenTelemetry RUM, OAuth2 PKCE, Trusted Types, Design System Tokens

---

## 📅 Week 8 — Backend Awareness, Networks & Full Synthesis Mock Interviews

**Time Budget:** 2–3 hours/day | **Days:** 5–6

### Focus

Review Backend Awareness (Node Event Loop, Express Middleware, Streams, Rate Limiting), Web Protocols (DNS → TCP → TLS 1.3 → HTTP/3 QUIC → L4/L7 LB), and practice Principal-level "Why This Over That?" trade-off scenarios.

### 📚 Study Files to Read

- 📖 [`04-Backend-Awareness/01-Node-Express-Basics.md`](./04-Backend-Awareness/01-Node-Express-Basics.md) — Node Event Loop, Streams, Rate Limiting, BE Red Flags
- 📖 [`05-Networks-Web/01-DNS-to-HTTP.md`](./05-Networks-Web/01-DNS-to-HTTP.md) — Full Request Lifecycle, TLS 1.3, HTTP/3 QUIC, L4/L7 LB
- 📖 [`06-Interview-QA/Principal-Level-QA.md`](./06-Interview-QA/Principal-Level-QA.md) — 20 "Why This Over That?" Principal Architectural Scenarios
- 📖 [`06-Interview-QA/Tradeoffs-Cheatsheet.md`](./06-Interview-QA/Tradeoffs-Cheatsheet.md) — X vs Y Quick Reference Matrix

---

## ✅ Ready for Study & Practice!

Every week has direct clickable links to exact files, concepts to master, TS practice code exercises, and self-testing Q&A blocks!

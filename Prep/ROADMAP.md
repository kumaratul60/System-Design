# 🗓️ 8-Week Principal & Staff Architect Study Roadmap

> **Target Roles:** Staff Engineer / Principal Engineer / Architect  
> **Focus:** 80% Frontend Depth | 20% Backend Integration | 55 Master System Design & LLD Blueprints  
> **Time commitment:** 2–4 hours/day, 5–6 days/week.

---

## 📊 8-Week Timeline Overview

```mermaid
gantt
    title Principal/Staff Architect — 8-Week Master Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  Week %W

    section LLD
    Week 1: OOP, SOLID & Software Design Principles :w1, 2026-08-10, 7d
    Week 2: 10 Design Patterns + Executable Code    :w2, after w1, 7d
    Week 3: UML Diagrams & Concurrency Machine Code :w3, after w2, 7d

    section HLD
    Week 4: Distributed Systems & Microservices     :w4, after w3, 7d
    Week 5: Caching, DB Sharding & Message Queues   :w5, after w4, 7d

    section Frontend
    Week 6: Rendering (SSR/SSG/ISR), CWV & Security :w6, after w5, 7d
    Week 7: React Internals, Micro-Frontends & WSS  :w7, after w6, 7d

    section Synthesis
    Week 8: 55 Master Problems & Mock Interview Grill:w8, after w7, 7d
```

---

## 🔁 Daily 3-Step Practice Loop (Non-Negotiable)

Run this **every day**, regardless of what week you are in (45–60 mins):

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  DAILY PRACTICE LOOP                                                    │
│                                                                         │
│  ① PICK   (5 min)                                                       │
│     → Choose 1 blueprint from Prep/07-Problem-Bank/                     │
│                                                                         │
│  ② DESIGN  (25–35 min)                                                  │
│     → Apply 9-Step Framework: FR, NFR, Scale, Mermaid UML, SOLID,      │
│       Design Patterns, TypeScript Code, Scale Bottlenecks.              │
│                                                                         │
│  ③ SPEAK ALOUD (10–15 min)                                              │
│     → Defend trade-offs: "I chose X over Y because..."                  │
│       Explain degraded modes, failure recovery, and SLAs.               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Week-by-Week Actionable Schedule

### 📅 Week 1 — Low-Level Design Foundation: OOP, SOLID & Design Principles
* 📖 [`01-LLD/README.md`](./01-LLD/README.md) — LLD 7-Phase Framework & Evaluation Signals
* 📖 [`01-LLD/01-OOP-Concepts.md`](./01-LLD/01-OOP-Concepts.md) — 4 Pillars, TypeScript Implementations, Scale Invariants
* 📖 [`01-LLD/SOLID.md`](./01-LLD/SOLID.md) — S.O.L.I.D. Principles with FE & BE Code + Case Studies
* 📖 [`01-LLD/MASTER-OOP-DESIGN-PRINCIPLES.md`](./01-LLD/MASTER-OOP-DESIGN-PRINCIPLES.md) — DRY, KISS, YAGNI, Law of Demeter, Coupling & Cohesion

### 📅 Week 2 — 10 High-Frequency Design Patterns & Executable Machine Coding
* 📖 [`01-LLD/04-Design-Patterns.md`](./01-LLD/04-Design-Patterns.md) — 10 High-ROI Patterns with TS Code & Decision Flowcharts
* 📖 [`01-LLD/06-Machine-Coding.md`](./01-LLD/06-Machine-Coding.md) — Executable Machine Coding in TypeScript
* 🧪 **Practice Blueprints:**
  * [`07-Problem-Bank/Data Structures & Search/01-Design-LRU-Cache.md`](./07-Problem-Bank/Data%20Structures%20&%20Search/01-Design-LRU-Cache.md)
  * [`07-Problem-Bank/Data Structures & Search/05-Design-LFU-Cache.md`](./07-Problem-Bank/Data%20Structures%20&%20Search/05-Design-LFU-Cache.md)
  * [`07-Problem-Bank/Financial & Payment Systems/01-Design-Splitwise.md`](./07-Problem-Bank/Financial%20&%20Payment%20Systems/01-Design-Splitwise.md)

### 📅 Week 3 — UML Diagrams, Concurrency & Machine Coding Drills
* 📖 [`01-LLD/05-UML-Diagrams.md`](./01-LLD/05-UML-Diagrams.md) — Class, Sequence, Component & State Machine Diagrams with Mermaid
* 📖 [`01-LLD/07-Concurrency-Multithreading.md`](./01-LLD/07-Concurrency-Multithreading.md) — Thread Safety, Locks, Atomic Operations
* 🧪 **Practice Blueprints:**
  * [`07-Problem-Bank/Managing States/01-Design-ATM.md`](./07-Problem-Bank/Managing%20States/01-Design-ATM.md)
  * [`07-Problem-Bank/Managing States/03-Design-Elevator-System.md`](./07-Problem-Bank/Managing%20States/03-Design-Elevator-System.md)
  * [`07-Problem-Bank/Data Structures & Search/11-Design-Concurrent-Lockfree-Ring-Buffer.md`](./07-Problem-Bank/Data%20Structures%20&%20Search/11-Design-Concurrent-Lockfree-Ring-Buffer.md)

### 📅 Week 4 — High-Level Design (HLD) & Distributed Systems Architecture
* 📖 [`02-HLD/README.md`](./02-HLD/README.md) — Distributed Architecture & Scalability Patterns
* 📖 [`02-HLD/01-System-Architecture-Fundamentals.md`](./02-HLD/01-System-Architecture-Fundamentals.md) — Monoliths vs Microservices, Event-Driven Systems
* 📖 [`02-HLD/02-Distributed-Systems.md`](./02-HLD/02-Distributed-Systems.md) — CAP Theorem, PACELC, Consensus (Raft/Paxos)
* 🧪 **Practice Blueprints:**
  * [`07-Problem-Bank/Developer Tools & Infrastructure/01-Design-URL-Shortener.md`](./07-Problem-Bank/Developer%20Tools%20&%20Infrastructure/01-Design-URL-Shortener.md)
  * [`07-Problem-Bank/Developer Tools & Infrastructure/08-Design-Distributed-Key-Value-Store.md`](./07-Problem-Bank/Developer%20Tools%20&%20Infrastructure/08-Design-Distributed-Key-Value-Store.md)

### 📅 Week 5 — Caching, Database Sharding & Event Messaging
* 📖 [`02-HLD/03-Caching-Strategies.md`](./02-HLD/03-Caching-Strategies.md) — Cache-Aside, Write-Through, Write-Behind, Redis Cluster
* 📖 [`02-HLD/04-Databases-Storage.md`](./02-HLD/04-Databases-Storage.md) — SQL vs NoSQL, Sharding, Replication, Indexes
* 📖 [`02-HLD/05-Messaging-Queues.md`](./02-HLD/05-Messaging-Queues.md) — Kafka, RabbitMQ, Consumer Groups, At-Least-Once Delivery
* 🧪 **Practice Blueprints:**
  * [`07-Problem-Bank/Communication & Messaging/02-Design-Pub-Sub-System.md`](./07-Problem-Bank/Communication%20&%20Messaging/02-Design-Pub-Sub-System.md)
  * [`07-Problem-Bank/Financial & Payment Systems/02-Design-Payment-Gateway.md`](./07-Problem-Bank/Financial%20&%20Payment%20Systems/02-Design-Payment-Gateway.md)

### 📅 Week 6 — Frontend Architecture, Core Web Vitals & Web Security
* 📖 [`03-Frontend-SD/README.md`](./03-Frontend-SD/README.md) — Client System Design & Architecture
* 📖 [`03-Frontend-SD/01-Rendering-Strategies.md`](./03-Frontend-SD/01-Rendering-Strategies.md) — CSR vs SSR vs SSG vs ISR
* 📖 [`03-Frontend-SD/02-Performance-CWV.md`](./03-Frontend-SD/02-Performance-CWV.md) — LCP, INP, CLS Optimization
* 📖 [`03-Frontend-SD/ADVANCED-PRINCIPAL-GAPS.md`](./03-Frontend-SD/ADVANCED-PRINCIPAL-GAPS.md) — OAuth2 PKCE, Trusted Types XSS, Tree-Shaking

### 📅 Week 7 — React Internals, Micro-Frontends & Real-Time Client Systems
* 📖 [`03-Frontend-SD/04-React-Architecture.md`](./03-Frontend-SD/04-React-Architecture.md) — Fiber Reconciler, Concurrent Mode, State Management
* 📖 [`03-Frontend-SD/05-Micro-Frontends.md`](./03-Frontend-SD/05-Micro-Frontends.md) — Module Federation, Isolation, State Sharing
* 📖 [`03-Frontend-SD/HOT-FE-INTERVIEW-PRACTICE.md`](./03-Frontend-SD/HOT-FE-INTERVIEW-PRACTICE.md) — Collaborative Whiteboard, Micro-Frontend Platform
* 🧪 **Practice Blueprints:**
  * [`07-Problem-Bank/Developer Tools & Infrastructure/07-Design-Google-Docs-Collaborative-Editor.md`](./07-Problem-Bank/Developer%20Tools%20&%20Infrastructure/07-Design-Google-Docs-Collaborative-Editor.md)
  * [`07-Problem-Bank/Communication & Messaging/03-Design-Chat-Application.md`](./07-Problem-Bank/Communication%20&%20Messaging/03-Design-Chat-Application.md)

### 📅 Week 8 — Master Synthesis & 55 Problem Bank Drills
* 📖 [`06-Interview-QA/README.md`](./06-Interview-QA/README.md) — Staff/Principal System Interview Grill Q&As
* 📖 [`06-Interview-QA/SCENARIO-EDGE-CASES-BANK.md`](./06-Interview-QA/SCENARIO-EDGE-CASES-BANK.md) — Small-to-Large Edge Cases & Failure Recovery
* 🔍 [`07-Problem-Bank/DOMAIN-SEARCH-COMPARISON.md`](./07-Problem-Bank/DOMAIN-SEARCH-COMPARISON.md) — Google vs Amazon vs Social Search Architectures
* 🎯 **Full 55-Problem Bank Drill:** Complete 1 problem/day from [`07-Problem-Bank/README.md`](./07-Problem-Bank/README.md).

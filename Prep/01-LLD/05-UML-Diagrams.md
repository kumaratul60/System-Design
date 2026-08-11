# 📐 Unified Modeling Language (UML) & Visual Architecture Master Blueprint

> **🎯 Target Audience:** Staff & Principal Engineers  
> **Focus:** Practical visual modeling (Class, Sequence, Component, State Machine diagrams via Mermaid) & systematic breakdown of Functional vs Non-Functional requirements (FUN-SCALE / FURS Framework).  
> **Existing Repo Tags:** 🔗 [See Standalone SOLID Guide](file:///Users/atulkumarawasthi/projects/SystemDesign/Prep/01-LLD/SOLID.md) | 🔗 [See Master OOP Guide](file:///Users/atulkumarawasthi/projects/SystemDesign/Prep/01-LLD/MASTER-OOP-DESIGN-PRINCIPLES.md) | 🔗 [See Design Patterns Guide](file:///Users/atulkumarawasthi/projects/SystemDesign/Prep/01-LLD/04-Design-Patterns.md)

---

## 🗺️ Master UML Diagrams Selection Flowchart

```mermaid
flowchart TD
    Start[Interview Problem Presented] --> Q1{What are you trying to communicate?}
    
    Q1 -->|Static Class Structure & Inheritance| ClassDiagram[1. Class Diagram LLD]
    Q1 -->|Temporal Data Flow & Async Requests| SeqDiagram[2. Sequence Diagram Flow]
    Q1 -->|System Boundaries & Subsystems| CompDiagram[3. Component Diagram HLD]
    Q1 -->|State Transitions & Lifecycle Guards| StateDiagram[4. State Machine Diagram]
    
    ClassDiagram --> C_Focus[Focus: Entities, Methods, Associations, Composition]
    SeqDiagram --> S_Focus[Focus: Actors, Lifelines, Sync/Async, Latency]
    CompDiagram --> Co_Focus[Focus: Gateway, Services, DBs, Micro-Frontends]
    StateDiagram --> St_Focus[Focus: States, Events, Transitions, Invariants]
```

---

## 🏗️ 1. Class Diagrams (Low-Level Object Structure)

### 💡 Core Relationships Cheat Sheet

| Relationship | Symbol | Mermaid Syntax | Meaning | Real-World Example |
|:---|:---:|:---:|:---|:---|
| **Inheritance (Is-A)** | $\triangle$ | `Super <\|-- Sub` | Child inherits properties and methods | `AdminUser` extends `User` |
| **Realization (Implements)** | $\dots\triangle$ | `Interface <\|.. Implementation` | Class fulfills an interface contract | `FetchAdapter` implements `HttpClient` |
| **Composition (Has-A - Strong)** | $\blackdiamond$ | `Parent *-- Child` | Child cannot exist without Parent | `Form` owns `FormFields` |
| **Aggregation (Has-A - Weak)** | $\diamond$ | `Parent o-- Child` | Child can exist independently | `Department` has `Employees` |
| **Association (Uses)** | $\rightarrow$ | `ClassA --> ClassB` | Class A invokes methods on Class B | `OrderService` uses `PaymentGateway` |

---

### 🖥️ Frontend Class Diagram Example: Real-Time Collaborative Canvas

```mermaid
classDiagram
    class CanvasEngine {
        -shapes: Map~string, Shape~
        -selectedId: string
        -websocketAdapter: WebSocketAdapter
        +render(ctx: CanvasRenderingContext2D): void
        +addShape(shape: Shape): void
        +selectShape(id: string): void
    }

    class Shape {
        <<abstract>>
        #id: string
        #x: number
        #y: number
        #color: string
        +draw(ctx: CanvasRenderingContext2D)* void
        +containsPoint(px: number, py: number)* boolean
    }

    class RectangleShape {
        -width: number
        -height: number
        +draw(ctx: CanvasRenderingContext2D): void
        +containsPoint(px: number, py: number): boolean
    }

    class CircleShape {
        -radius: number
        +draw(ctx: CanvasRenderingContext2D): void
        +containsPoint(px: number, py: number): boolean
    }

    class WebSocketAdapter {
        <<interface>>
        +send(event: string, payload: any): void
        +on(event: string, cb: Function): void
    }

    Shape <|-- RectangleShape : Inherits
    Shape <|-- CircleShape : Inherits
    CanvasEngine *-- Shape : Composition (Engine owns shapes)
    CanvasEngine --> WebSocketAdapter : Association (Uses WS for sync)
```

---

### 🗄️ Backend Class Diagram Example: Distributed Rate Limiter Engine

```mermaid
classDiagram
    class RateLimiter {
        <<interface>>
        +allowRequest(key: string): Promise~boolean~
    }

    class SlidingWindowCounter {
        -windowSizeMs: number
        -maxRequests: number
        -redisClient: RedisStore
        +allowRequest(key: string): Promise~boolean~
        -executeLuaScript(key: string): Promise~number~
    }

    class TokenBucket {
        -capacity: number
        -refillRatePerSec: number
        +allowRequest(key: string): Promise~boolean~
    }

    class RedisStore {
        +evalSha(sha: string, keys: string[]): Promise~any~
    }

    RateLimiter <|.. SlidingWindowCounter : Realizes
    RateLimiter <|.. TokenBucket : Realizes
    SlidingWindowCounter --> RedisStore : Association
```

---

## 🔄 2. Sequence Diagrams (Data & Request Flow)

### 🖥️ Frontend Sequence Diagram Example: Optimistic UI Update with Rollback

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser UI)
    participant State as React Query / Zustand Cache
    participant Service as PostService
    participant API as Backend REST API
    participant DB as Database

    User->>State: Click "Like Post"
    State->>State: 1. Optimistic Update (Like Count +1, Liked: true)
    State-->>User: Instant UI Re-render (<16ms)
    
    State->>Service: likePost(postId)
    Service->>API: POST /api/v1/posts/:id/like
    
    alt Network Success (200 OK)
        API->>DB: UPDATE posts SET likes = likes + 1
        DB-->>API: Success
        API-->>Service: HTTP 200 { likes: 42 }
        Service-->>State: Confirm Cache
    else Network Failure / Server Error (500)
        API-->>Service: HTTP 500 Internal Error
        Service-->>State: Throw Error
        State->>State: 2. Rollback Cache (Like Count -1, Liked: false)
        State-->>User: UI Re-renders previous state + Toast "Failed to like"
    end
```

---

### 🗄️ Backend Sequence Diagram Example: OAuth2 Authorization Code Flow with PKCE

```mermaid
sequenceDiagram
    autonumber
    actor Client as Single Page App (Browser)
    participant AuthServer as Authorization Server (Auth0/Okta)
    participant API as Resource Server (Backend API)

    Client->>Client: Generate Code Verifier + Code Challenge (S256)
    Client->>AuthServer: GET /authorize?response_type=code&code_challenge=...
    AuthServer-->>Client: Prompt User Login & Consent
    Client->>AuthServer: Authenticate User Credentials
    AuthServer-->>Client: Redirect 302 to SPA callback with Authorization Code
    
    Client->>AuthServer: POST /oauth/token (Auth Code + Code Verifier)
    AuthServer->>AuthServer: Verify SHA256(Code Verifier) == Code Challenge
    AuthServer-->>Client: Returns JWT Access Token + Refresh Token
    
    Client->>API: GET /api/v1/user/profile (Bearer JWT)
    API->>API: Verify JWT Signature (RS256 Public Key)
    API-->>Client: HTTP 200 OK Profile JSON Data
```

---

## 🧩 3. Component & Subsystem Diagrams (Architecture & Module Boundaries)

### 🖥️ Frontend Component Diagram: Micro Frontend Architecture (Module Federation)

```mermaid
graph TB
    subgraph Browser Container App
        Host[Host Shell Application]
        Router[App Router]
        Store[Global Auth State Store]
    end

    subgraph Remote MFEs (Module Federation)
        NavMFE[Navigation Bar MFE]
        FeedMFE[Feed Feed MFE]
        CheckoutMFE[Checkout MFE]
    end

    subgraph CDN Edge Infrastructure
        CDN1[CDN Edge: Nav Bundle]
        CDN2[CDN Edge: Feed Bundle]
        CDN3[CDN Edge: Checkout Bundle]
    end

    Host --> Router
    Router --> NavMFE
    Router --> FeedMFE
    Router --> CheckoutMFE

    NavMFE ..-> CDN1
    FeedMFE ..-> CDN2
    CheckoutMFE ..-> CDN3
    
    Host -.-> Store
    FeedMFE -.-> Store
```

---

## ⚙️ 4. State Machine Diagrams (Lifecycle & Invariant Management)

### 🖥️ Frontend State Machine: Audio Player Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Loading : play(url)
    Loading --> Playing : canplaythrough event
    Loading --> Error : network error

    Playing --> Paused : pause()
    Playing --> BufferWaiting : buffer underrun
    BufferWaiting --> Playing : buffer filled

    Paused --> Playing : resume()
    Paused --> Idle : stop()

    Error --> Idle : retry()
    Playing --> [*] : track finished
```

---

## 🎯 5. Requirements Breakdown Framework (FUN-SCALE / FURS)

When given an ambiguous interview prompt ("Design a Collaborative Whiteboard" or "Design a Notification System"), follow this systematic template:

```mermaid
flowchart LR
    A[Prompt Received] --> B[1. Functional Requirements FR]
    B --> C[2. Non-Functional Requirements NFR]
    C --> D[3. Scale Estimates QPS/Storage]
    D --> E[4. Visual UML Diagrams]
    E --> F[5. TypeScript Code Implementation]
```

### 📋 Example Requirements Breakdown: Collaborative Whiteboard (Figma-Style)

#### 1. Functional Requirements (FR)
* User can draw shapes (Rectangles, Circles, Freehand lines).
* Real-time cursor position & shape synchronization across connected users ($<50\text{ms}$ latency).
* Offline support: User can draw offline, synced when connection recovers.
* Unlimited canvas navigation (Pan & Zoom).

#### 2. Non-Functional Requirements (NFR)
* **Performance:** $60\text{ FPS}$ smooth rendering on $4\text{K}$ monitors.
* **Latency:** Real-time WebSockets sync $P_{99} < 50\text{ms}$.
* **Availability:** $99.99\%$ uptime for persistence engine.
* **Consistency:** Eventual consistency for concurrent canvas edits using **Conflict-Free Replicated Data Types (CRDTs)**.

#### 3. Scale Estimates
* **Users:** $100,\!000$ Daily Active Users (DAU).
* **Peak Concurrent Connections:** $10,\!000$ active rooms simultaneously.
* **WebSocket Message Volume:** $10\text{ updates/sec/user} \times 10,\!000\text{ users} = 100,\!000\text{ msg/sec}$.

---

## ⚡ 6. "Good Enough" UML for Whiteboard Interviews

In a 45-minute interview, **do not spend 15 minutes perfecting line arrowheads**. Focus on speed and communication:

1. **Boxes = Entities / Components:** Draw clear labeled boxes.
2. **Solid Line with Arrow ($\rightarrow$) = Data Flow or Dependency.**
3. **Dashed Line with Arrow ($\dashrightarrow$) = Async Message or Implementation.**
4. **Annotate Methods:** Write down 2–3 key methods inside class boxes (`allowRequest()`, `draw()`).
5. **State Cardinality Explicitly:** Mark `1` to `N` relationships on associations.

---

## 📊 Summary Comparison Table of UML Diagram Types

| Diagram Type | Focus Dimension | Key Elements | Primary FE Use Case | Primary BE Use Case |
|:---|:---|:---|:---|:---|
| **Class Diagram** | Static Structure | Classes, Interfaces, Inheritance, Composition | Canvas engines, Form validation models, State stores | Domain Entities, ORM Models, Repository interfaces |
| **Sequence Diagram** | Temporal Flow | Lifelines, Messages, Sync/Async, Activation | Optimistic UI updates, Auth login flows, WS Handshakes | Distributed Saga transactions, OAuth PKCE flows |
| **Component Diagram** | System Subsystems | Modules, Interfaces, CDN Edges, Databases | Micro Frontend Module Federation, Asset Bundles | Microservices architecture, API Gateways, Caches |
| **State Machine** | State Invariants | States, Transitions, Events, Guards | Audio/Video player, Multi-step form wizards, Modals | Order status lifecycles, Payment processing states |

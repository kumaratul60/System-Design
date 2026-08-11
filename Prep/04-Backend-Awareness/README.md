# 🔭 Backend Awareness for Frontend Architects

> **Why a Principal Frontend Engineer Must Understand the Backend**
>
> This is not a guide to becoming a backend engineer. It's a guide to being a _better frontend architect_ by understanding the systems your frontend depends on — and knowing exactly what to demand, what to question, and what to catch before it becomes your production problem.

---

## 🎯 The Core Argument

Most senior frontend engineers treat the backend as a black box: "API returns JSON, I display it." This works at the feature-team level.

At the **Principal Architect level**, you're making decisions that span systems:

- You're setting API contracts that 10 teams will consume
- You're reviewing backend designs that will directly impact your frontend performance
- You're explaining to your CTO why the app feels slow — and the answer is in the backend
- You're the last line of defense before a bad API design ships and becomes permanent

> **🔑 Principal-Level Signal:** A Principal FE Architect who can't read a database query plan, doesn't know what N+1 looks like in a REST response, or can't spot a missing index — will always be dependent on the backend team to explain their own system's performance problems. That's a ceiling.

---

## 🗂️ Files in This Section

| File                                                          | What You'll Learn                                             | Key Concepts                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| 📖 [`01-Node-Express-Basics.md`](./01-Node-Express-Basics.md) | Node event loop, Express middleware, streaming, rate limiting | Event Loop, Streams, Rate Limiter Lua, BE Red Flags, Q&A |

---

## 📊 What You Need to Know vs. What BE Engineers Do

```mermaid
quadrantChart
    title Backend Knowledge Map for FE Architects
    x-axis Low Depth --> High Depth
    y-axis Low Relevance to FE --> High Relevance to FE
    quadrant-1 Must Know Deeply
    quadrant-2 Know Well Enough to Collaborate
    quadrant-3 Awareness Only
    quadrant-4 Leave to BE Engineers
    API Contract Design: [0.8, 0.9]
    Auth Flows (JWT/OAuth): [0.7, 0.85]
    HTTP Caching Headers: [0.7, 0.9]
    Rate Limiting: [0.5, 0.75]
    Node.js Event Loop: [0.6, 0.7]
    REST Pagination: [0.6, 0.8]
    Database Indexing: [0.4, 0.6]
    Message Queue Design: [0.3, 0.4]
    Sharding Strategy: [0.2, 0.3]
    Consensus Algorithms: [0.1, 0.1]
    Storage Engine Internals: [0.15, 0.1]
```

### The Explicit Map

| Topic                                        | FE Architect Depth | Why                                                    |
| -------------------------------------------- | ------------------ | ------------------------------------------------------ |
| **REST API design**                          | Deep               | You consume and often co-define these contracts        |
| **HTTP headers (Cache-Control, ETag, CORS)** | Deep               | You own the caching layer at the client edge           |
| **Auth (JWT, OAuth2, PKCE)**                 | Deep               | Frontend handles token storage, refresh, PKCE flows    |
| **Node.js / Express basics**                 | Medium             | Your BFF layer likely runs Node                        |
| **SQL query shapes**                         | Medium             | Understanding N+1 lets you demand better APIs          |
| **Database indexing**                        | Medium             | You need to know why a query is slow                   |
| **Message queues**                           | Low-medium         | Know what Kafka is; don't need to configure partitions |
| **Sharding / replication**                   | Low                | Know the vocabulary; diagnose symptoms                 |
| **Distributed consensus**                    | Awareness          | Paxos/Raft — know they exist, why they matter          |
| **Storage engine internals**                 | Skip               | B-trees, LSM-trees — leave to BE engineers             |

---

## 💡 The 20% That Gives 80% of the Value

If you only study one week of backend concepts, master these five:

### 1. API Contract Hygiene

The frontend will live with every API design decision for years. You must be able to:

- Spot missing idempotency keys on mutation endpoints
- Catch inconsistent error response formats
- Enforce pagination standards before they ship

### 2. HTTP Caching Headers

`Cache-Control`, `ETag`, `Last-Modified`, `Vary` — these headers live at the boundary of frontend and backend. If you don't know them, you'll ship pages that are either always stale or always re-fetched.

```
Cache-Control: max-age=3600, stale-while-revalidate=86400
ETag: "a3f8b..."
Vary: Accept-Encoding, Accept-Language
```

### 3. Authentication Flows

Your frontend code handles the most security-sensitive parts of auth:

- Token storage decisions (memory vs localStorage vs httpOnly cookie)
- Token refresh logic and race conditions
- PKCE code verifier/challenge generation
- CSRF protection strategies

### 4. What an N+1 Problem Looks Like in a Response

A response that returns a list of posts where each post has a `comments_count` loaded from a separate query is an N+1. You won't see it in the JSON, but you'll feel it in the latency. Knowing this lets you demand GraphQL DataLoader or proper JOIN strategies.

### 5. Rate Limiting and Backpressure

Your frontend makes calls. Rate limits exist. You need to know:

- What a `429 Too Many Requests` response means and how to handle it
- How exponential backoff works
- How to implement client-side request queuing to stay within limits

---

## 🤝 How to Give Better Requirements to Backend Teams

Frontend architects often discover they're the _de facto_ API designers — because they're the ones who know how the data will be consumed.

### The Frontend Architect's API Requirements Template

```markdown
## API Requirements: [Endpoint Name]

### Consumer Context

- Page/feature this powers: [e.g., Product Listing Page]
- Rendering strategy: [SSR / CSR / ISR]
- Cache expectation: [e.g., 5 min stale-while-revalidate]

### Request

- Method: GET/POST/PUT/PATCH/DELETE
- Path: /api/v2/products
- Auth: [Bearer token / API key / Public]
- Idempotent: Yes/No + key strategy

### Response Shape

- Fields needed: [explicit list — avoid over-fetching]
- Pagination: cursor-based preferred (no offset pagination for feeds)
- Sort: [default sort + allowed sort fields]
- Max items per page: [e.g., 50]

### Error Contract

- 400: validation errors with field-level messages
- 401: trigger client-side logout
- 404: return empty state, not error
- 429: include Retry-After header
- 5xx: implement retry with exponential backoff

### Performance SLA

- p95 target: < 200ms
- Payload size target: < 50KB uncompressed
- Compression: gzip or brotli required
```

---

## 🔍 Questions to Ask When Reviewing Backend Designs

As a Principal FE Architect in a design review, these are your questions:

### API Design Questions

- "Is this endpoint idempotent? What happens if the client retries on network failure?"
- "How will you handle pagination for this feed? Cursor-based or offset? What's the consistency story?"
- "What's the error response format? Is it consistent with our other APIs?"
- "Can we add ETags to this response for conditional fetching?"
- "Will you support partial responses (field selection) or will every call return the full payload?"

### Performance Questions

- "What's the DB query behind this endpoint? Are there indexes on all filter columns?"
- "Is this endpoint joining across tables? At what row count does it degrade?"
- "Is there a cache layer? What's the TTL? What's the invalidation strategy?"
- "What's the p95 latency at 1000 req/s? Have you load tested it?"

### Auth & Security Questions

- "Where is the session store? What's the session TTL?"
- "Are refresh tokens rotating? What's the revocation mechanism?"
- "Is this endpoint protected against CSRF? Which method?"
- "Are user IDs in the response user-provided or system-generated? (Avoid ID enumeration)"

### Reliability Questions

- "What happens to in-flight requests during a deployment?"
- "Is there a circuit breaker on your downstream dependencies?"
- "What's the fallback if the database is unavailable?"
- "Is this write operation atomic? What's the failure partial state?"

---

## 🚩 Red Flags in Backend Designs — A FE Architect's Checklist

These are patterns that will directly cause frontend problems. Catch them in design review, not in production.

### API Contract Red Flags

| Red Flag                                                 | Why It Hurts the Frontend                                 | Fix to Demand                                               |
| -------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| `snake_case` and `camelCase` mixed in same API           | Constant manual mapping in every consumer                 | Pick one convention and enforce it in a linter              |
| No consistent error format                               | Every consumer handles errors differently                 | Adopt RFC 7807 `application/problem+json`                   |
| Returning `200 OK` with `{ error: "not found" }` in body | `fetch` won't reject the Promise — bugs in every consumer | Use proper HTTP status codes                                |
| Offset pagination on large feeds                         | Page 500 is slow, items shift between pages               | Cursor-based pagination                                     |
| No `Retry-After` header on 429                           | Frontend has no idea when to retry                        | Always include `Retry-After`                                |
| Deeply nested response objects                           | Excessive de-nesting code in every consumer               | Normalize at the API layer                                  |
| No versioning strategy                                   | Breaking changes break all clients simultaneously         | `/api/v2/` or `Accept: application/vnd.api+json; version=2` |

### Performance Red Flags

| Red Flag                                            | Symptom You'll See                              | Fix to Demand                                   |
| --------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| SELECT \* on list endpoints                         | Huge payloads, slow first paint                 | Field selection / explicit column list          |
| No indexes on filter columns                        | Endpoint is fast with 100 rows, breaks with 10M | Query plan review, index on `WHERE` columns     |
| Synchronous calls to 3rd-party APIs in request path | High tail latency (p99 spikes to 5s+)           | Make 3rd-party calls async / background         |
| No connection pooling                               | DB connections exhausted under load             | Enforce connection pool config                  |
| Unbounded result sets                               | Mobile client crashes on large payloads         | Enforce `LIMIT` at DB layer, not just API layer |

### Security Red Flags

| Red Flag                                                  | Risk                                    | Fix to Demand                                     |
| --------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| User ID in URL (`GET /users/1234/profile`)                | ID enumeration, IDOR vulnerability      | Require authorization check, or use opaque tokens |
| `Access-Control-Allow-Origin: *` on credentialed requests | CORS bypass                             | Specific origin allowlist                         |
| JWT stored in localStorage (suggested by BE)              | XSS can steal tokens                    | httpOnly cookies or in-memory storage             |
| No rate limiting on auth endpoints                        | Credential stuffing attacks             | Rate limit login/signup by IP + user              |
| Password in query string (`?token=abc123`)                | Appears in server logs, browser history | POST body or Authorization header only            |

---

## 🧠 Mental Model: The Frontend-Backend Contract

Think of every API as a **contract**, not a convenience. Contracts have:

1. **Parties** — who consumes this, what rendering strategy they use
2. **Terms** — the exact request/response shape and status codes
3. **SLAs** — latency, payload size, availability
4. **Amendment process** — how versioning and deprecation work
5. **Breach penalties** — what happens when terms aren't met (timeouts, fallbacks, circuit breakers)

When you frame API design as a contract rather than "just a backend endpoint," you naturally demand the right things — and you're harder to dismiss because you're speaking the language of system reliability.

---

## 📚 Recommended Study Order for This Section

```
Week 1 focus:   01-Node-Express-Basics.md     (event loop + middleware — mental model)
Week 1 focus:   02-REST-API-Design.md          (API contracts — immediately applicable)
Week 2 focus:   03-Auth-Patterns.md            (JWT, OAuth, PKCE — security is shared)
Week 3 focus:   04-Database-for-FE.md          (N+1, indexes — know the problem)
Week 4 focus:   05-BE-Red-Flags.md             (apply as a checklist in your next design review)
```

<details>
<summary>❓ Q1: Why should a frontend architect care about database indexes?</summary>

**Answer:** Because API latency is often caused by missing indexes, and the symptom shows up as slow page loads, high Time to First Byte (TTFB), or spinning loading states on the frontend. A frontend architect who can say "this endpoint is likely doing a full table scan because I don't see an index on the `created_at` filter column" can diagnose the root cause instead of guessing. This also gives you credibility in design reviews and lets you write more realistic NFRs — "this endpoint must respond in < 100ms at p95" is a testable, specific requirement that forces the backend to think about query plans.

</details>

<details>
<summary>❓ Q2: What is the N+1 problem and how does it manifest in a REST API response?</summary>

**Answer:** The N+1 problem occurs when a list query (1 query) is followed by N individual queries to load related data for each item. In REST, this often manifests when an endpoint returns a list of orders, but each order requires a separate DB call to load the customer name. From the frontend, you'll see it as: high API latency that scales linearly with list size (10 items = fast, 100 items = 10x slower). The fix at the API layer is either eager loading with JOIN, DataLoader batching (in GraphQL), or caching. As a FE architect, you catch this by asking: "What queries does this endpoint execute? Does query count scale with result count?"

</details>

<details>
<summary>❓ Q3: Should frontend engineers ever store JWTs in localStorage?</summary>

**Answer:** No — with a clear explanation of why. `localStorage` is accessible via JavaScript, which means any XSS vulnerability in your app (including third-party scripts) can exfiltrate the JWT. The correct approach depends on the threat model: **httpOnly cookies** are the most secure (inaccessible to JS) but require CSRF protection; **in-memory storage** (module-scoped variable) is XSS-safe but lost on page refresh. The frontend architect's job is to understand the trade: localStorage is convenient but vulnerable; httpOnly cookies add complexity (CSRF tokens, SameSite configuration) but provide defense-in-depth against XSS token theft.

</details>

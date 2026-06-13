# 🌐 System Design: 28 Core Networking & API Interview Questions & Answers

This Q&A document provides a structured, tiered review of networking fundamentals, protocol mechanics, API architectural styles (REST, GraphQL, gRPC), and real-time transport designs.

---

## 📚 Table of Contents

1. [Internet Fundamentals, Protocols & DNS (Q1 - Q4)](#1-internet-fundamentals-protocols--dns-q1---q4)
2. [REST API Design & HTTP Methods (Q5 - Q10, Q17 - Q23)](#2-rest-api-design--http-methods-q5---q10-q17---q23)
3. [GraphQL Queries, Schema & Optimizations (Q11 - Q16)](#3-graphql-queries-schema--optimizations-q11---q16)
4. [gRPC, Protocol Buffers & HTTP/2 (Q24 - Q28)](#4-grpc-protocol-buffers--http2-q24---q28)

---

## 1. Internet Fundamentals, Protocols & DNS (Q1 - Q4)

### Q1: Can you explain the fundamental concept of how the internet works to someone with a non-technical background?

- **Analogy:** The internet is like a global postal service system. Computers are houses, and each house has a unique address (IP address).
- **Process:**
  1.  **Request:** When you type a website name (like `google.com`), your browser writes a letter asking for a page and puts it in an envelope.
  2.  **Routing:** Post offices (Routers) read the destination address and forward the envelope through cables, satellites, and exchanges until it reaches the target server (house).
  3.  **Delivery:** The target server opens the envelope, reads the request, packages the website pages into smaller envelopes (packets), and mails them back.
  4.  **Reassembly:** Your browser receives all the small envelopes, matches their sequence numbers, and displays the fully assembled webpage on your screen.

### Q2: What is the role of protocols in Internet communication, and can you name a few essential protocols?

- **Role:** Protocols are standardized sets of rules governing how data is formatted, transmitted, received, and interpreted across different hardware and operating systems, ensuring compatibility.
- **Essential Protocols:**
  - **IP (Internet Protocol):** Directs packets across routers from source to destination using IP addresses.
  - **TCP (Transmission Control Protocol):** Establishes reliable, ordered, error-checked connections on top of IP.
  - **UDP (User Datagram Protocol):** A fast, connectionless, lightweight transport (no error-checking or retransmission, perfect for video/gaming).
  - **DNS (Domain Name System):** Resolves human-readable domain names into machine-readable IP addresses.
  - **HTTP/HTTPS (HyperText Transfer Protocol / Secure):** Application layer protocol for transferring web documents.

### Q3: Differentiate between HTTP and HTTPS. Why is secure communication important on the Internet?

- **Differences:**
  - **HTTP (HyperText Transfer Protocol):** Transmits data in plaintext (Port 80). Anyone sniffing the network path can read or modify the traffic.
  - **HTTPS (HTTP Secure):** Encrypts traffic by running HTTP inside a secure SSL/TLS cryptographic tunnel (Port 443).
- **Importance of Secure Communication:**
  - **Confidentiality:** Encrypts credentials, credit card details, and personal data.
  - **Integrity:** Employs hashing to guarantee data is not tampered with or injected with malicious scripts in transit (e.g., by ISP injectors).
  - **Authenticity:** Validates server identity via certificates signed by trusted Certificate Authorities (CAs).

### Q4: How do DNS (Domain Name System) and IP addresses work together to facilitate internet communication?

- **Workflow:**
  1.  Computers communicate using numerical **IP addresses** (e.g., `142.250.190.46`). Humans use **Domain Names** (e.g., `google.com`).
  2.  DNS acts as the "phonebook" of the internet.
  3.  When a user requests `google.com`, the browser queries the **DNS resolver** to find the corresponding IP.
  4.  The browser then uses that IP address to establish a direct TCP connection with the target server.

---

## 2. REST API Design & HTTP Methods (Q5 - Q10, Q17 - Q23)

### Q5: Explain the concept of REST (Representational State Transfer) in the context of web services.

- **Concept:** REST is an architectural style designed around **Resources** (represented by URIs like `/api/v1/orders`) manipulated using standard **HTTP verbs** (GET, POST, PUT, DELETE). Communication is stateless, meaning each request must contain all the information necessary for processing, and the server retains no client session history.

### Q6: What are the key principles of RESTful API design, and why are they important?

1.  **Client-Server Separation:** Decouples UI logic from data storage, allowing independent scaling.
2.  **Statelessness:** Server retains no context between requests, making scaling out horizontally across load balancers trivial.
3.  **Cacheability:** Server indicates whether responses can be cached, preventing redundant server load.
4.  **Uniform Interface:** Resources are named with nouns, accessed using standard HTTP methods, and return self-descriptive messages (JSON/XML).
5.  **Layered System:** The client cannot tell if it is connected directly to the end server or an intermediate load balancer/gateway.

### Q7: How does a client-server architecture function in the context of web development and APIs?

- **Function:** Decouples responsibilities:
  - **Client (Frontend):** Focuses on user interaction, state rendering, and layout.
  - **Server (Backend):** Focuses on security, business validation, persistence, and resource provisioning.
  - **API:** Serves as the strictly defined contract mediating communication between the two.

### Q8: Can you provide examples of HTTP methods used in RESTful APIs and briefly explain their purposes?

- `GET`: Retrieve a resource or collection. Must be safe and idempotent (read-only).
- `POST`: Create a new resource. Non-idempotent.
- `PUT`: Replace an entire resource, or create it if it doesn't exist. Idempotent.
- `PATCH`: Apply partial modifications to a resource. Non-idempotent (by specification, though often designed as idempotent).
- `DELETE`: Remove a resource. Idempotent.

### Q9: What is the purpose of status codes in HTTP responses, and can you give examples of common status codes?

- **Purpose:** Standardizes response meanings so client engines can programmatically act without parsing body strings.
- **Common Codes:**
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource successfully created (via POST/PUT).
  - `304 Not Modified`: Cached resource is still valid (conditional GET).
  - `400 Bad Request`: Client-side validation failure.
  - `401 Unauthorized`: Authentication required or failed.
  - `403 Forbidden`: Authenticated, but lacks permissions (authorization failure).
  - `404 Not Found`: Target resource does not exist.
  - `500 Internal Server Error`: Server encountered a runtime exception.

### Q10: Explain the concept of statelessness in RESTful APIs and why it is considered a key principle.

- **Concept:** Every request sent from a client to a server must contain all of the context and credentials necessary to understand and authorize the request. The server holds no session state in memory.
- **Why Critical:**
  - **Horizontal Scalability:** Requests can be routed randomly across a cluster of 1,000 servers without sharing session replication state.
  - **Reliability:** Server crashes don't log out active users since sessions aren't tied to physical server memory.

### Q17: What is the key difference between GET and POST requests in HTTP?

- **GET:** Retreives data. Parameters are passed in the URL query string. Must be **safe** (no side-effects) and **idempotent**. Browsers will cache and bookmark GET requests.
- **POST:** Submits data to create resources. Parameters are passed inside the request body. **Non-safe** and **non-idempotent**. Browsers do not cache POST requests.

### Q18: How does the PUT method differ from the POST method, and in what scenarios would you use each?

- **Differences:**
  - `POST` is for **creating** resources. It is non-idempotent. Sending a POST twice creates two duplicate resources.
  - `PUT` is for **replacing** resources. It is idempotent. Sending a PUT twice yields the same final state.
- **Use Cases:**
  - Use `POST` on a collection endpoint (`POST /orders`) when the server generates the ID.
  - Use `PUT` on a specific resource endpoint (`PUT /orders/101`) when the client dictates the ID and wants to overwrite the target completely.

### Q19: Explain the purpose of the DELETE HTTP method and provide an example use case.

- **Purpose:** Instructs the server to remove the resource identified by the URI.
- **Use Case:** `DELETE /users/452`. The server deletes the user, returning a `204 No Content` response. Subsequent DELETE calls return `404` but the state remains "deleted" (hence idempotent).

### Q20: Describe the PATCH method and when it is preferable over other HTTP methods?

- **Description:** `PATCH` applies partial modifications to a resource (e.g., updating just the email attribute of a user profile).
- **Preferability:** Preferable over `PUT` when you only want to update one attribute. Using `PUT` requires passing the entire resource payload; omitting attributes during `PUT` often results in the server nullifying those missing fields.

### Q21: How does the OPTIONS method contribute to web development, and when is it typically used?

- **Description:** Retreives the communication options/methods supported by the target resource.
- **Typical Use (CORS):** Browsers automatically send an **OPTIONS preflight request** before cross-origin write requests (POST/PUT/DELETE) to check if the server permits the origin and custom headers.

### Q22: Explain the significance of the "Content-Type" header in an HTTP request.

- **Significance:** Tells the receiver how to parse the byte payload inside the request or response body.
- **Common Types:**
  - `application/json` (standard API payloads).
  - `application/x-www-form-urlencoded` (form submissions).
  - `multipart/form-data` (binary uploads / files).
  - `text/html` (webpages).

### Q23: What is the purpose of the "User-Agent" header, and how might it be useful for web developers?

- **Purpose:** Identifies the client software (browser version, OS, device, crawler).
- **Usefulness:**
  - **Compatibility:** Serving optimized layouts depending on mobile vs. desktop headers.
  - **Analytics & Security:** Identifying malicious bot scrapers or checking browser engines.

---

## 3. GraphQL Queries, Schema & Optimizations (Q11 - Q16)

### Q11: Describe the basic structure of a GraphQL query and how it differs from traditional REST API requests.

- **Basic Structure:**
  ```graphql
  query GetUserProfile {
    user(id: "42") {
      name
      email
      orders {
        id
        price
      }
    }
  }
  ```
- **Differences:**
  - **Single Endpoint:** GraphQL uses a single `/graphql` POST endpoint; REST uses multiple paths (`/users`, `/orders`).
  - **Declarative Fetching:** The client specifies the exact fields it needs. The server returns JSON mirroring the query structure.

### Q12: How does GraphQL solve over-fetching and under-fetching issues commonly associated with REST APIs?

- **Over-fetching (getting too much data):** In REST, `GET /users/42` returns a massive JSON payload with 50 fields. In GraphQL, the client asks for just `{ name }`, saving bandwidth.
- **Under-fetching (getting too little data, requiring multiple calls):** In REST, to display a user's order details, you must call `GET /users/42`, then parse their order IDs, and loop over `GET /orders/:id`. In GraphQL, you fetch both resources in a single nested query.

### Q13: Can you explain the concept of a "schema" in the context of GraphQL and why it's important?

- **Concept:** The schema is the strict Type Definition contract defining all available fields, queries, mutations, types, and relations.
- **Importance:**
  - **Strong Contract:** Serves as a single source of truth between frontend and backend teams.
  - **Validation:** The engine automatically validates queries against the schema before invoking resolvers, blocking malformed requests.
  - **Introspection:** Allows tooling (like GraphiQL) to query the schema directly to provide auto-completion.

### Q14: What are the advantages of using GraphQL over traditional REST APIs for certain types of applications?

- **Multiple Clients:** Mobile and web clients need different slices of data; GraphQL lets them query different configurations without backend alterations.
- **Aggregated Backends:** Ideal as an orchestration layer merging multiple microservices into a single graph.
- **Rapid Iteration:** Frontend teams add fields to their views without requesting backend API modifications (as long as the schema supports the type).

### Q15: How does batching work in GraphQL, and why is it beneficial for optimizing data fetching?

- **The N+1 Problem:** If a query requests 10 users and their orders, a naive resolver will call the database once for the users list, and then run 10 separate SQL queries to fetch each user's orders (N+1 queries).
- **Batching Solution (DataLoader):**
  - **Mechanism:** DataLoader coalesces separate read operations inside a single execution frame (using `process.nextTick` or event loops).
  - **Batch Query:** It combines the 10 separate user IDs into a single database batch fetch: `SELECT * FROM orders WHERE user_id IN (1, 2, ... 10)`.

### Q16: In the context of web development, how do you choose between using RESTful APIs and GraphQL based on specific project requirements?

- **Choose REST when:**
  - Caching is critical (REST natively leverages HTTP/CDN caching via URIs).
  - You are building public, simple third-party APIs (industry standard).
  - You have simple CRUD resources with minimal nesting.
- **Choose GraphQL when:**
  - You have a complex, highly-nested data graph (relations).
  - You support mobile applications where bandwidth must be minimized.
  - You run a BFF (Backend-for-Frontend) orchestration layer over multiple backend services.

---

## 4. gRPC, Protocol Buffers & HTTP/2 (Q24 - Q28)

### Q24: What is gRPC, and how does it differ from traditional REST APIs in terms of communication?

- **gRPC:** A high-performance RPC framework developed by Google.
- **Differences:**
  - **Transport:** gRPC runs exclusively on **HTTP/2** (multiplexing streams); REST typically runs on HTTP/1.1.
  - **Payload:** gRPC compiles down to **Binary Protocol Buffers**; REST uses human-readable JSON strings.
  - **Paradigm:** gRPC exposes remote methods (functions) directly via RPC code stubs; REST exposes resources (data).

### Q25: Explain the benefits of using Protocol Buffers (protobuf) in gRPC for data serialization.

- **Performance:** Binary serialization is much smaller and faster than string-based JSON serialization.
- **Bandwidth:** Omits key names in transmissions; fields are packed into binary streams identified by tags.
- **Type Safety:** Code generators output strongly-typed client/server stubs in multiple languages (Java, Go, C++, Python) from a single `.proto` file.

### Q26: What role do service definitions play in gRPC, and why are they significant?

- **Role:** Written in Protocol Buffers as an Interface Definition Language (IDL):
  ```protobuf
  service UserService {
    rpc GetUser (UserRequest) returns (UserResponse);
  }
  ```
- **Significance:** Acts as a strict contract. Code generators parse this file to output native client call stubs and server templates, eliminating boilerplate networking code.

### Q27: How does gRPC support HTTP/2 and what advantages does this bring over HTTP/1.1?

- **HTTP/2 Support:** gRPC maps calls directly to HTTP/2 streams.
- **Advantages:**
  - **Multiplexing:** Send hundreds of RPC requests over a single TCP connection, eliminating browser connection limits.
  - **Streaming:** Native support for Client streaming, Server streaming, and Bidirectional streaming.
  - **Header Compression (HPACK):** Compresses headers to save bandwidth.

### Q28: Can you compare and contrast RESTful APIs and gRPC, highlighting the strengths and weaknesses of each?

| Feature             | RESTful APIs                       | gRPC                                       |
| :------------------ | :--------------------------------- | :----------------------------------------- |
| **Protocol**        | HTTP/1.1 or HTTP/2                 | HTTP/2 exclusively                         |
| **Payload**         | JSON (Text)                        | Protocol Buffers (Binary)                  |
| **Contract**        | Optional (OpenAPI/Swagger)         | Mandatory IDL (`.proto`)                   |
| **Browser Support** | Universal                          | Requires proxy translation (gRPC-Web)      |
| **Best For**        | Public APIs, edge routing.         | High-volume internal microservices.        |
| **Strengths**       | Simple debugging, CDN cacheable.   | Ultra-low latency, code-generation.        |
| **Weaknesses**      | Large payload size, "chatty" APIs. | Hard to debug (binary), poor edge caching. |

---

[Return to API Architectural Styles Hub](./README.md)

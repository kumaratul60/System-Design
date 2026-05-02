# System Design: Communication Strategies & Patterns

Effective communication is the backbone of any distributed system. This directory serves as a comprehensive laboratory for modern communication patterns used in distributed systems. This guide covers how components—from browsers to databases—talk to each other, the protocols they use, and how to choose the right pattern for your use case. From simple polling to full-duplex bi-directional streams, these patterns define how our services interact, scale, and deliver real-time experiences.

---

## 🚀 The Decision Tree: Which One to Use?

Use this quick guide to determine the best strategy for your requirements:

1.  **Do you need Server-to-Server notifications?**
    - 👉 Use **[Webhooks](./Webhooks/README.md)**.
2.  **Does the Client only need updates FROM the Server (Unidirectional)?**
    - 👉 Use **[Server-Sent Events (SSE)](./ServerSentEvent/README.md)**.
3.  **Do you need two-way, high-frequency, low-latency interaction (Bidirectional)?**
    - 👉 Use **[WebSockets](./WebSocket/README.md)**.
4.  **Are you on a restricted network that blocks non-HTTP traffic?**
    - 👉 Use **[Long Polling](./LongPolling/README.md)**.
5.  **Is real-time NOT critical and simplicity is key?**
    - 👉 Use **[Short Polling](./ShortPolling/README.md)**.

---

## 🛠️ Implemented Techniques

### 1. [Short Polling](./ShortPolling/)

The client repeatedly asks the server for data at fixed intervals.

**Mode:** Pull (Client-initiated)

- **Pros:** Simplest to implement; works on any server/browser without special protocols.
- **Cons:** High server overhead due to constant empty requests; significant battery drain on mobile.
- **Example:** A dashboard checking for new email count every 60 seconds.
- **Use Case:** Simple status checks where latency isn't critical.

### 2. [Long Polling](./LongPolling/)

The server holds the request open until data is available or a timeout occurs.

**Mode:** Pull (Optimized "Hanging" request)

- **Pros:** Lower latency than short polling; works behind strict corporate firewalls that block WS.
- **Cons:** High resource usage on the server (held connections); "Request-Response" cycle overhead remains.
- **Example:** A web chat application on a legacy server that doesn't support WebSockets.
- **Use Case:** Near real-time updates when WebSockets/SSE are not available.

### 3. [Webhooks](./Webhooks/)

A "Reverse API" or "User-defined HTTP callback." Server A pushes data to Server B via an HTTP POST request when an event occurs.

**Mode:** Push (Server-to-Server)

- **Pros:** Highly efficient as data only moves when an event occurs; no persistent connections needed.
- **Cons:** Requires the consumer to have a public URL; needs robust security (signatures) and retry logic.
- **Example:** Stripe sending a `payment_succeeded` notification to your backend.
- **Use Case:** Third-party integrations and event-driven automation between backend services.

### 4. [Server-Sent Events (SSE)](./ServerSentEvent/)

Unidirectional persistent streaming from server to client over HTTP.

**Mode:** Push (Unidirectional Server-to-Client)

- **Pros:** Automatic reconnection; uses standard HTTP; very efficient for streaming data to the browser.
- **Cons:** Unidirectional only; browser connection limits (multiplexing required via HTTP/2).
- **Example:** A live news ticker or a real-time stock price feed.
- **Use Case:** Real-time dashboards, news feeds, and tickers.

### 5. [WebSockets](./WebSocket/)

Full-duplex, bidirectional communication over a single TCP connection.

**Mode:** Bidirectional (Full-Duplex)

- **Pros:** Lowest latency; data flows both ways simultaneously; very low header overhead after handshake.
- **Cons:** Stateful and harder to scale (requires sticky sessions); not all proxies/firewalls support it.
- **Example:** A multiplayer game or a collaborative document editor like Google Docs.
- **Use Case:** Chat apps, multiplayer games, and collaborative tools.

---

## 📊 Technical Comparison Matrix

| Feature        | Short Polling    | Long Polling     | Webhooks         | SSE              | WebSockets    |
| :------------- | :--------------- | :--------------- | :--------------- | :--------------- | :------------ |
| **Protocol**   | HTTP             | HTTP             | HTTP             | HTTP             | WS/TCP        |
| **Direction**  | Client -> Server | Client -> Server | Server -> Server | Server -> Client | Bidirectional |
| **Connection** | Ephemeral        | "Hanging"        | Ephemeral        | Persistent       | Persistent    |
| **Latency**    | High             | Medium           | Low              | Low              | Lowest        |
| **Use Case**   | Simple Checks    | Near Real-time   | Async Events     | Live Streams     | Interactive   |

---

## 🏗️ Common Architecture Patterns

### The "Fulfillment" Pattern

1.  **REST API:** Client places an order and gets a `202 Accepted` response.
2.  **Webhooks:** External payment gateway notifies the server when payment clears.
3.  **WebSockets:** Server pushes "Order Shipped" status to the client in real-time.

---

## ⚠️ Best Practices & Pitfalls (Top-Level)

- **Mobile Battery:** Avoid Short Polling on mobile; frequent radio wakeups drain battery.
- **Scalability:** Stateful connections (WS/SSE) require **Sticky Sessions** (Session Affinity) or a shared backplane (Redis).
  - _Note:_ Sticky sessions ensure that all requests from a specific client are routed to the same server that established the initial persistent connection.
- **Connection Limits:** Browsers limit to ~6 concurrent HTTP/1.1 connections; use **HTTP/2** to multiplex.
- **Proxy Buffering:** Disable Nginx/Proxy buffering for SSE to ensure data flows immediately.
- **Security:** Always verify signatures for **Webhooks** and use `WSS` for encrypted WebSockets.
- **Idempotency:** Ensure consumers can handle duplicate events (especially for Webhooks and Polling).

---

## 📁 Directory Structure

- `ShortPolling/`: Basic interval-based polling example.
- `LongPolling/`: Hanging-request implementation.
- `Webhooks/`: Server-to-server POST notification with security.
- `ServerSentEvent/`: Streaming updates to the browser.
- `WebSocket/`: Bi-directional communication using `ws` and `Socket.io`.
